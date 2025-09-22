const express = require("express");

const [
  authentication,
  authorizeRoles,
] = require("../../middleware/auth.middleware");

const orderController = require("../controller/order.controller");

const router = express.Router();

router.post("/create", authentication, orderController.createOrder);

router.get("/get", authentication, orderController.getOrders);
router.get("/get/:id", authentication, orderController.getOrderDetail);

module.exports = router;
