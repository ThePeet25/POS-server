const express = require('express');

const router = express.Router();

const usersController = require('../controller/users.controller');

router.post('/', usersController.createUser);
router.post('/login', usersController.loginUser)

module.exports = router;