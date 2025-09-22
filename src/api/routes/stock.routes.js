const express = require("express");

const router = express.Router();

const stockController = require("../controller/stock.controller");

const [
  authentication,
  authorizeRoles,
] = require("../../middleware/auth.middleware");

router.post(
  "/create",
  authentication,
  authorizeRoles(["manager"]),
  stockController.createStock
);
router.get(
  "/get",
  authentication,
  authorizeRoles(["manager"]),
  stockController.getStocks
);

module.exports = router;
