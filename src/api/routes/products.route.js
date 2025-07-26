const express = require('express');

const router = express.Router();

const productController = require('../controller/products.controller');
const [ authentication, authorizeRoles ] = require('../../middleware/auth.middleware');

router.post('/create',authentication, authorizeRoles(['manager']), productController.createProduct);
router.get('/getporducts', authentication, authorizeRoles(['manager', 'cashier']), productController.getProducts)

module.exports = router;