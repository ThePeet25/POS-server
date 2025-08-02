const express = require('express');

const router = express.Router();

const stockController = require('../controller/stock.controller');

router.post('/create', stockController.createStock);

module.exports = router