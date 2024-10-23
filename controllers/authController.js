'use strict';
const passport = require('./passport');
const models = require('../models');
const {where} = require("sequelize");

let controller = {};
controller.showLogin = (req, res) => {
    if (req.isAuthenticated()) {
        return res.redirect('/');
    }
    res.render('login', {
        loginMessage: req.flash('loginMessage'),
        registerMessage: req.flash('registerMessage'),
        reqUrl: req.query.reqUrl
    });
};
controller.login = async (req, res, next) => {
    const keepSignedIn = req.body.keepSignedIn || false;
    const reqUrl = req?.body?.reqUrl || '/users/my-account';
    let cart = req.session.cart;
    passport.authenticate('local-login', (error, user) => {
        if (error) {
            return next(error)
        }
        if (!user) {
            return res.redirect(`/users/login?reqUrl=${reqUrl}`);
        }
        req.logIn(user, (e) => {
            if (e) return next(e)
            req.session.cookie.maxAge = keepSignedIn ? (24 * 60 * 60 * 1000) : null;
            req.session.cart = cart;
            return res.redirect(reqUrl);
        })
    })(req, res, next);

};

controller.logout = (req, res, next) => {
    let cart = req.session.cart;
    req.logout((error) => {
        if (error) return next(error);
        req.session.cart = cart;
        return res.redirect('/');
    })
}

controller.register = (req, res, next) => {
    const reqUrl = req?.body?.reqUrl || '/users/my-account';
    let cart = req.session.cart;
    passport.authenticate('local-register', (error, user) => {
        if (error) {
            return next(error)
        }
        if (!user) {
            return res.redirect(`/users/login?reqUrl=${reqUrl}`);
        }
        req.logIn(user, (e) => {
            if (e) return next(e)
            req.session.cart = cart;
            return res.redirect(reqUrl);
        })
    })(req, res, next);

}
controller.isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect(`/users/login?reqUrl=${req.originalUrl}`);

}

controller.forgotPassword = async (req, res) => {
    let email = req.body?.email || '';
    let user = await models.User.findOne({where: {email}});
    if (user) {
        const {sign} = require('./jwt');
        const host = req.header('host');
        const resetLink = `${req.protocol}://${host}/users/reset?token=${sign(email)}&email=${email}`;
        const {sendForgotPasswordMail} = require('./mail');
        sendForgotPasswordMail(user, host, resetLink).then(rs => {
            console.log('email sent');
            res.locals.forgotDone = true;
            res.render('forgot-password');
        }).catch(err => {
            res.locals.forgotMessage = 'An error has occured when sending to your email.Please check your email address!';
            res.render('forgot-password');
        });

    } else {
        res.locals.forgotMessage = 'Email not exist';
        res.render('forgot-password');
    }

}
controller.showResetPassword = (req, res) => {
    let email = req.query.email;
    let token = req.query.token;
    const {verify} = require('./jwt');
    if (!token || verify(token)) {
        return res.render('reset-password', {expired: true})
    } else {
        return res.render('reset-password', {email, token})
    }

}
controller.resetPassword = async (req, res) => {
    let email = req.body.email;
    let token = req.body.token;
    let bcrypt = require('bcrypt');
    let password = bcrypt.hashSync(req.body.password, bcrypt.genSalt(8));
    await models.User.update({password}, {where: {email}});
    return res.render('reset-password', {done: true})
}
module.exports = controller;
