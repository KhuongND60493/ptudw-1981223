'use strict';
const {body, validationResult} = require('express-validator');

function getErrorMessage(req) {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        let erArrays = errors.array();
        return erArrays.reduce((message, err) => {
            return message + err.msg + '</br>';
        }, '')
    }
    return null;
}

module.exports = {body, getErrorMessage};
