const prisma = require("../config/prisma");
const dateConvert = require("../lib/dateconvert");
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
  const productIds = orderLists.map((item) => item.id);

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
    const product = productMap[item.id];

    if (product.quantity < item.quantity) {
      return false;
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
        productId: item.id,
        quantity: item.quantity,
      };
    }

    totalPrice += product.price * item.quantity;
    return {
      orderId: item.id,
      price: product.price,
      productId: item.id,
      quantity: item.quantity,
    };
  });

  if (orderItems.some((product) => product === false)) {
    return {
      success: false,
      status: 400,
      message: "Not enough stock for product",
    };
  }

  //6. check total price
  console.log(totalPrice);
  if (totalPrice !== total_price) {
    return {
      success: false,
      status: 400,
      message: "Total price not match please calculator again",
    };
  }

  //7. create data
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

    for (const item of orderItems) {
      await tx.products.update({
        where: {
          id: item.productId,
        },
        data: {
          quantity: {
            decrement: item.quantity,
          },
        },
      });
    }

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

  if (date) {
    const { startUtcDate, endUtcDate } = dateConvert.toGMT0(date);
    whereClause.createdAt = {
      gte: startUtcDate,
      lte: endUtcDate,
    };
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

  //3. map
  const orderResult = orderLists.map((order) => ({
    date: dateConvert.toGMT7String(order.createdAt),
    receiptId: order.receiptId,
    id: order.id,
  }));

  return {
    orderResult,
  };
};

exports.getOrderDetail = async (id) => {
  //1. query
  const detail = await prisma.orderItems.findMany({
    where: {
      orderId: id,
    },
    select: {
      product: {
        select: {
          id: true,
          name: true,
        },
      },
      order: {
        select: {
          totalAmount: true,
        },
      },
      quantity: true,
      price: true,
    },
  });

  console.log(detail);
  //2. map
  orderDetails = detail.map((order) => ({
    id: order.product.id,
    name: order.product.name,
    quantity: order.quantity,
    price: order.price,
  }));

  return {
    orderDetails,
    totalPrice: detail[0] ? detail[0].order.totalAmount : 0,
  };
};
