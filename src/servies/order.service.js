const prisma = require("../config/prisma");

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

exports.createOrder = async (orderLists, amount, userId) => {
  try {
    //create order and select order id
    const order = prisma.orders.create({
      data: {
        userId,
        totalAmount: amount,
      },
      select: {
        id: true,
      },
    });

    orderLists.foreach((orderItem) => {
      console.log(orderItem);
      const productId = findProductId(orderItem.product);

      if (productId === null) {
        console.error("Can't find product Id");
        return {
          success: false,
          status: 400,
          message: "product doesnt exsist",
        };
      }

      prisma.orderItems.create({
        data: {
          orderId: order.id,
          productId,
        },
      });
    });
  } catch (err) {
    console.error("Error during create order service ERROR:", err);
    throw err;
  }
};
