'use strict';
let express = require('express');
let router = express.Router();
let controller = require('../controllers/authController');
let {body, getErrorMessage} = require('../controllers/validator');

router.get('/login', controller.showLogin);
router.get('/logout', controller.logout);
router.get('/forgot', (req, res) => {
    res.render('forgot-password')
});
router.post('/login',
    body('email').trim().notEmpty().withMessage('Email is required!!!').isEmail().withMessage('Invalid email address!'),
    body('password').trim().notEmpty().withMessage('Password is required!!!'), (req, res, next) => {
        const errorMessage = getErrorMessage(req);
        if (errorMessage) {
            return res.render('login', {loginMessage: errorMessage});
        }
        next();
    }, controller.login);

router.post('/register',
    body('firstName').trim().notEmpty().withMessage('First Name is required!!!'),
    body('lastName').trim().notEmpty().withMessage('Last Name is required!!!'),
    body('email').trim().notEmpty().withMessage('Email is required!!!').isEmail().withMessage('Invalid email address!'),
    body('password').trim().notEmpty().withMessage('Password is required!!!'),
    body('password').matches(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/).withMessage('Must contain at least one  number and one uppercase and lowercase letter, and at least 8 or more characters'),
    body('confirmPassword').custom((confirmPassword, {req}) => {
        if (confirmPassword != req.body.password) {
            throw new Error('Password not match');
        }
        return true;
    }),
    (req, res, next) => {
        const errorMessage = getErrorMessage(req);
        if (errorMessage) {
            return res.render('login', {registerMessage: errorMessage});
        }
        next();
    }, controller.register);


router.post('/forgot',
    body('email').trim().notEmpty().withMessage('Email is required!!!').isEmail().withMessage('Invalid email address!'),
    (req, res, next) => {
        const errorMessage = getErrorMessage(req);
        if (errorMessage) {
            return res.render('forgot-password', {forgotMessage: errorMessage});
        }
        next();
    }, controller.forgotPassword)

module.exports = router;
