const express = require("express");

const [
  authentication,
  authorizeRoles,
] = require("../../middleware/auth.middleware");

const routerController = require("../controller/order.controller");

const router = express.Router();

router.post("/create", routerController.createOrder);
