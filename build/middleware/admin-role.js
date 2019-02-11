'use strict';

const User = require('../db/models/User');
module.exports = (req, res, next) => {

    try {
        if (!req.headers.authorization || req.headers.authorization.indexOf('Basic ')) {
            next();
        }

        const base64Credentials = req.headers.authorization.split(' ')[1];

        const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
        const [username, password] = credentials.split(':');

        User.findOne({ username: [username] }, function (err, userFound) {
            if (!userFound) {
                return res.json({
                    "error-response": {
                        "error-code": 500,
                        "error'key": "INTERNAL_SERVER_ERROR",
                        "error-message": "Internal server error – please contact support."
                    }
                });
            }

            if (userFound.role != 'ADMIN') {
                return res.json({
                    "error-response": {
                        "error-code": 500,
                        "error'key": "ACCESS_DENIED",
                        "error-message": "Internal server error – please contact support."
                    }
                });
            }
        });
        next();
    } catch (error) {
        res.status(500).send(error);
    }
};