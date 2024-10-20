'use strict';
const models = require('../models');
let controller = {};
controller.showLogin = (req, res) => {
    res.render('login');
};
controller.login = async (req, res) => {
};

module.exports = controller;
