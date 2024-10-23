'use strict';
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'adssadsa';

function sign(email, time = 30) {
    return jwt.sign({email}, process.env.JWT_SECRET || JWT_SECRET, {expiresIn: 60 * time})
}

function verify(token) {
    try {
        jwt.verify(token, process.env.JWT_SECRET || JWT_SECRET)
        return true;
    } catch (e) {
        return false;

    }
}

module.exports = {sign, verify}
