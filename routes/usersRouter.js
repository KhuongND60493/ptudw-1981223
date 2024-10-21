'use strict';
const express = require('express');
const router = express.Router();
const controller = require('../controllers/userController');
const {body, validationResult} = require('express-validator');

router.get('/checkout', controller.showCheckout);
router.post(
    '/placeorders',
    body('firstName').notEmpty().withMessage('Firstname is required!'),
    body('lastName').notEmpty().withMessage('Lastname is required!'),
    body('email').notEmpty().withMessage('Email is required!').isEmail().withMessage('Invalid email address!'),
    body('mobile').notEmpty().withMessage('Mobile is required!'),
    body('address').notEmpty().withMessage('Address is required!'),
    (req, res, next) => {
        let errors = validationResult(req);
        if (req.body.addressId == '0' && !errors.isEmpty()) {
            let erArrays = errors.array();
            let msg = '';
            for (let i = 0; i < erArrays.length; i++) {
                msg += erArrays[i].msg + '</br>';
            }
            return res.render('error', {message: msg});
        }
        next();
    },
    controller.placeorders,
);

router.get('/my-account', (req, res) => {
    res.render('my-account')
})

module.exports = router;
