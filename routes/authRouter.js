'use strict';
let express = require('express');
let router = express.Router();
let controller = require('../controllers/authController');
let {body, getErrorMessage} = require('../controllers/validator');

router.get('/login', controller.showLogin);
router.post('/login',
    body('email').trim().notEmpty().withMessage('Email is required!!!').isEmail('Invalid email address!'),
    body('password').trim().notEmpty().withMessage('Password is required!!!'), (req, res, next) => {
        const errorMessage = getErrorMessage(req);
        if (errorMessage) {
            return res.render('login', {loginMessage: errorMessage});
        }
        next();
    }, controller.login);
module.exports = router;
