'use strict';

const passport = require('./passport');
let controller = {};
controller.showLogin = (req, res) => {
    if (req.isAuthenticated()) {
        return res.redirect('/');
    }
    res.render('login', {loginMessage: req.flash('loginMessage'), reqUrl: req.query.reqUrl});
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


controller.isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect(`/users/login?reqUrl=${req.originalUrl}`);

}
module.exports = controller;
