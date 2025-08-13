const express = require("express");

const router = express.Router();
const promotionConrtroller = require("../controller/promotion.controller");
const [
  authentication,
  authorizeRoles,
] = require("../../middleware/auth.middleware");

router.post("/create", promotionConrtroller.createPromotion);
router.get(
  "/get",
  authentication,
  authorizeRoles(["manager", "cashier"]),
  promotionConrtroller.getPromotions
);
// router.put('/updatestatus', promotionConrtroller.updatePromotionStatuses)

module.exports = router;
