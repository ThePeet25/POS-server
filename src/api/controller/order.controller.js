const orderService = require("../../servies/order.service");

exports.createOrder = async (req, res) => {
  const { orderLists, amount } = req.body;
  const user = req.user;

  if (!orderLists || !amount || !user) {
    return res.status(400).json({
      message: "missing order data",
    });
  }

  try {
    const order = orderService.createOrder(orderLists, amount, user.id);

    if (!order.success) {
      res.status(order.status).json({
        message: order.message,
      });
    }
  } catch (err) {
    console.error("Error during create order ERROR:", err);
    res.status(500).json({
      message: "Error during create order",
    });
  }
};
