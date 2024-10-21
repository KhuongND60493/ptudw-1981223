'use strict';
const models = require('../models');
const passport = require('./passport');
let controller = {};
controller.showLogin = (req, res) => {
    res.render('login', {loginMessage: req.flash('loginMessage')});
};
controller.login = async (req, res, next) => {
    const keepSignedIn = req.body.keepSignedIn || false;
    passport.authenticate('local-login', (error, user) => {
        if (error) {
            return next(error)
        }
        if (!user) {
            return res.redirect('/users/login');
        }
        req.logIn(user, (e) => {
            if (e) return next(e)
            req.session.cookie.maxAge = keepSignedIn ? (24 * 60 * 60 * 1000) : null;
            return res.redirect('/users/my-account')
        })
    })(req, res, next);

};

module.exports = controller;
