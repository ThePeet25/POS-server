const express = require('express');

const router = express.Router();

const usersController = require('../controller/users.controller');
const [ authentication, authorizeRoles ] = require('../../middleware/auth.middleware');

router.post('/create', usersController.createUser);
router.post('/login', usersController.loginUser)
router.post('/logout', authentication, authorizeRoles(['manager','cashier']),usersController.logout);

//test role authorization
router.get('/manager', authentication, authorizeRoles(['manager']), (req, res) => {
    res.json({ messgae: 'Role can be use'})
})

module.exports = router;