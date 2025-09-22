const express = require("express");

const router = express.Router();
const promotionController = require("../controller/promotion.controller");
const [
  authentication,
  authorizeRoles,
] = require("../../middleware/auth.middleware");

router.post(
  "/create",
  authentication,
  authorizeRoles(["manager"]),
  promotionController.createPromotion
);
router.get(
  "/get",
  authentication,
  authorizeRoles(["manager", "cashier"]),
  promotionController.getPromotions
);
// router.put('/updatestatus', promotionConrtroller.updatePromotionStatuses)

module.exports = router;
