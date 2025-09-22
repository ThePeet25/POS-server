const express = require("express");
const dashboardController = require("../controller/dashboard.controller");
const [
  authentication,
  authorizeRoles,
] = require("../../middleware/auth.middleware");

const router = express.Router();

router.get(
  "/day",
  authentication,
  authorizeRoles(["manager"]),
  dashboardController.getDaySummery
);
router.get(
  "/monthYear",
  authentication,
  authorizeRoles(["manager"]),
  dashboardController.getMonthYear
);

router.get(
  "/7day/:dateType",
  authentication,
  authorizeRoles(["manager"]),
  dashboardController.get7DayMonthYear
);
module.exports = router;
