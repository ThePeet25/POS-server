const prisma = require("../config/prisma");
const { includes } = require("../middleware/auth.middleware");

const findProductId = async (productName) => {
  const productId = await prisma.products.findFirst({
    where: {
      name: productName,
    },
    select: {
      id: true,
    },
  });

  if (!productId) {
    return null;
  }
  return productId.id;
};

const priceCalculate = (price, Promotions) => {
  let discountPrice;
  if (Promotions.discountType === "PERCENT") {
    discountPrice =
      Math.round((price - (Promotions.discountValue / 100) * price) * 100) /
      100;
  } else {
    discountPrice = price - Promotions.discountValue;
  }
  return discountPrice;
};

exports.createOrder = async (receiptId, orderLists, total_price, userId) => {
  //1. get product ID from order
  const productIds = orderLists.map((item) => item.productId);

  //2. query products
  const products = await prisma.products.findMany({
    where: {
      id: {
        in: productIds,
      },
    },
    select: {
      id: true,
      price: true,
      quantity: true,
      productPromotions: {
        select: {
          promotion: {
            select: {
              discountType: true,
              discountValue: true,
              remainingQuota: true,
            },
          },
        },
      },
    },
  });

  //3. product length
  if (productIds.length !== products.length) {
    return {
      success: false,
      status: 400,
      message: "Some products not found",
    };
  }

  //4. map to dictionary
  const productMap = {};
  products.forEach((p) => {
    productMap[p.id] = p;
  });

  //5. calculate price
  let totalPrice = 0;
  const orderItems = orderLists.map((item) => {
    const product = productMap[item.productId];

    if (product.quantity < item.quantity) {
      throw new Error(`Not enough stock for product ${item.productId}`);
    }

    const isHavePromotion = product.productPromotions[0] || null;
    if (isHavePromotion) {
      let discountPrice = priceCalculate(
        product.price,
        isHavePromotion.promotion
      );

      totalPrice += discountPrice * item.quantity;
      return {
        orderId: item.id,
        price: discountPrice,
        productId: item.productId,
        quantity: item.quantity,
      };
    }

    totalPrice += item.price * item.quantity;
    return {
      orderId: item.id,
      price: product.price,
      productId: item.productId,
      quantity: item.quantity,
    };
  });

  //6. create data
  const result = await prisma.$transaction(async (tx) => {
    const order = await tx.orders.create({
      data: {
        receiptId,
        userId,
        totalAmount: totalPrice,
      },
      select: {
        id: true,
      },
    });

    await tx.orderItems.createMany({
      data: orderItems.map((item) => ({
        ...item,
        orderId: order.id,
      })),
    });

    return receiptId;
  });

  return {
    result,
    success: true,
  };
};

exports.getOrders = async (page = 1, limit = 20, search, date = null) => {
  //1. set where clause
  let whereClause = {};

  if (search) {
    whereClause.receiptId = search;
  }

  //2. query
  const orderLists = await prisma.orders.findMany({
    where: whereClause,
    select: {
      createdAt: true,
      receiptId: true,
      id: true,
    },
  });

  return {
    message: "ok",
    orderLists,
  };
};
