const orderService = require("../../servies/order.service");

function generateReceiptId(length = 4) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    result += chars[randomIndex];
  }
  return result;
}

exports.createOrder = async (req, res) => {
  const { orderLists, amount } = req.body;
  const user = req.user;
  const receiptId = generateReceiptId();

  if (!orderLists || !amount || !user) {
    return res.status(400).json({
      message: "missing order data",
    });
  }

  try {
    const order = orderService.createOrder(
      receiptId,
      orderLists,
      amount,
      user.id
    );

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
