'use strict';

module.exports = app => {
    const token = require('./parkingHouseControllers');

    app.post('/v1/token/', token.signUp);

    app.get('/v1/verify-token', token.findAll);
};