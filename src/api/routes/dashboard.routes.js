const express = require("express");
const dashboardController = require("../controller/dashboard.controller");

const router = express.Router();

router.get("/day", dashboardController.getDaySummery);
router.get("/monthYear", dashboardController.getMonthYear);

router.get("/7day/:dateType", dashboardController.get7DayMonthYear);
module.exports = router;
