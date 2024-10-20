'use strict';
let express = require('express');
let router = express.Router();
let controller = require('../controllers/authController');
router.get('/login', controller.showLogin);
router.post('/login', controller.login);
module.exports = router;
