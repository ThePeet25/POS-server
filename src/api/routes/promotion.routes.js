const express = require('express');

const router = express.Router();
const promotionConrtroller = require('../controller/promotion.controller');

router.post('/create', promotionConrtroller.createPromotion)
router.get('/get', promotionConrtroller.getPromotions)
// router.put('/updatestatus', promotionConrtroller.updatePromotionStatuses)

module.exports = router