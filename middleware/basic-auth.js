const User = require('../db/models/User')
module.exports = (req, res, next) => {

    try {
        if (!req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1) {
            return res.json({
                "error-response": {
                    "error-code": 400,
                    "error'key": 403,
                    "error-message": "Bad Request."
                }
            });
        }

        const base64Credentials = req.headers.authorization.split(' ')[1];

        const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
        const [username, password] = credentials.split(':');

        User.findOne({ username: username }, function (err, userFound) {
            if (!userFound) {
                 return res.json({
                    "error-response": {
                        "error-code": 500,
                        "error'key": "INTERNAL_SERVER_ERROR",
                        "error-message": "Internal server error – please contact support."
                    }
                });
            }
            if (userFound.status == 'LOCKED'){
                return res.json({
                    "error-response": {
                        "error-code": 403,
                        "error'key": "LOGIN_LOCKED",
                        "error-message": "User is locked."
                    }
                });
            }

            if (userFound.status == 'IN_REGISTRATION'){
                return res.json({
                    "error-response": {
                        "error-code": 403,
                        "error'key": "LOGIN_IN_REGISTRATION",
                        "error-message": "User is in registration."
                    }
                });
            }

            if (userFound.termsOfUseAccepted == false){
                return res.json({
                    "error-response": {
                        "error-code": 403,
                        "error'key": "TERMS_AND_CONDITIONS_NOT_ACCEPTED",
                        "error-message": "The user has not accepted the terms and conditions yet"
                    }
                });
            }
        })
        next()

    }
    catch (error) {
        res.status(500).send(error)
    }
}