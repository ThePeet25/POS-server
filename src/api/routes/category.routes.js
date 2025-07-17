const express = require('express');

const router = express.Router();

const categoryController = require('../controller/category.controller');
const [ authentication, authorizeRoles ] = require('../../middleware/auth.middleware');

router.post('/create',authentication, authorizeRoles(['manager']), categoryController.createCategory);

module.exports = router;