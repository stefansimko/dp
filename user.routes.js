module.exports = (app) => {
    const users = require('./userControllers.js');
    const test2 = require('./middleware/test2')
    const test = require('./middleware/test')
    const login = require('./middleware/login')



    app.post('/v1/register/user', users.signUp);

    app.post('/v1/modify/user/:loginAlias', users.modify);

    // app.post('/v1/delete/user/:loginAlias', users.delete);

    app.get('/v1/user/:loginAlias', users.userInfo);

    app.get('/v1/user/:loginAlias/profile', users.userProfile);

    app.post('/v1/user/:loginAliasUser/assign-parking-place-owner', users.assignParkingPlace)

    app.post('/v1/user/:loginAliasUser/release-parking-place-owner', users.releaseParkingPlace)

    app.post('/v1/user/:loginAliasUser/use-avalaible-day', users.useAvailableDay)

    app.post('/v1/user/:loginAliasUser/set-available-days', users.setAvailableDay)

    app.put('/v1/token', login, users.token)

    app.get('/v1/validateToken', test2, users.validateToken)

    app.post('/v1/security-question', users.securityQuestion)

    app.post('/v1/reset-password', users.resetPassword)

    app.post('/v1/otp/is-valid', users.isOtpValid)

    app.post('/v1/otp/change-password', users.changePassword)
}
