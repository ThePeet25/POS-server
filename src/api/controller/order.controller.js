const prisma = require("../../config/prisma");
const orderService = require("../../services/order.service");

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
  const { orderLists, total_price } = req.body;
  const user = req.user;
  const receiptId = generateReceiptId();

  if (!orderLists || !total_price || !user) {
    return res.status(400).json({
      message: "missing order data",
    });
  }

  try {
    const order = await orderService.createOrder(
      receiptId,
      orderLists,
      total_price,
      user.id
    );

    if (!order.success) {
      return res.status(order.status).json({
        message: order.message,
      });
    }

    res.status(201).json({
      message: "Create order success",
      id: order.result,
    });
  } catch (err) {
    console.error("Error during create order ERROR:", err);
    res.status(500).json({
      message: "Error during create order",
    });
  }
};

exports.getOrders = async (req, res) => {
  const page = req.query.page || 1;
  const limit = req.query.limit || 20;
  const search = req.query.search || "";
  const date = req.query.date || null;

  try {
    const orderLists = await orderService.getOrders(page, limit, search, date);

    res.status(200).json({
      ...orderLists,
    });
  } catch (error) {
    console.log("Error during get order ERROR:", error);
    res.status(500).json({
      message: "Error during get order",
    });
  }
};

exports.getOrderDetail = async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const result = await orderService.getOrderDetail(id);

    res.status(200).json({
      product: result.orderDetails,
      totalPrice: result.totalPrice,
    });
  } catch (error) {
    console.error("Error during get order detail ERROR:", error);
    res.status(500).json({
      message: "Error during get order detail",
    });
  }
};
