'use strict';
const passport = require('passport');
const localStrategy = require('passport-local');
const bcrypt = require('bcrypt');
const models = require('../models');

passport.serializeUser((user, done) => {
    done(null, user.id);
})

passport.deserializeUser(async (id, done) => {
    try {
        let user = await models.User.findOne({
            attributes: ['id', 'email', 'firstName', 'lastName', 'mobile', 'isAdmin'],
            where: {id}
        });
        done(null, user);
    } catch (error) {
        done(error, null);

    }
})

passport.use('local-login', new localStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true

}, async (req, email, password, done) => {
    if (email) {
        email = email.toLowerCase();
    }
    try {
        if (!req.user) {
            let user = await models.User.findOne({
                where: {email}
            });
            if (!user) {
                return done(null, false, req.flash('loginMessage', 'Email does not exist!'));
            }
            if (!bcrypt.compareSync(password, user.password)) {
                return done(null, false, req.flash('loginMessage', 'Invalid passwordt!'));
            }
            done(null, user);
        }
        done(null, req.user);
    } catch (e) {
        done(e, null);
    }
}));

passport.use('local-register', new localStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, email, password, done) => {
    if (email) {
        email = email.toLowerCase();
    }
    if (req.user) {
        return done(null, req.user);
    }
    try {
        let user = await models.User.findOne({
            where: {email}
        });
        if (user) {
            return done(null, false, req.flash('registerMessage', 'Email is already taken!'));
        }
        await models.User.create({
            email,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            mobile: req.body.mobile,
            password: bcrypt.hashSync(password, bcrypt.genSaltSync(8))
        });
        done(null, false, req.flash('registerMessage', 'You have registered successfully!Please login'))
    } catch (e) {
        done(e, null);
    }
}))

module.exports = passport;
