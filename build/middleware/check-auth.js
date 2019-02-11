'use strict';

const jwt = require('jsonwebtoken');
const User = require('../db/models/User');

module.exports = (req, res, next) => {

    try {

        const token = req.headers.authorization.split(" ")[1];

        if (!token) {
            res.json({
                "error-response": {
                    "error-code": 400,
                    "error'key": "BAD_REQUEST",
                    "error-message": "Bad request"
                }
            });
        } else {
            const decoded = jwt.verify(token, process.env.SECRET);
            if (!decoded) {
                res.json({
                    "error-response": {
                        "error-code": 403,
                        "error'key": "INVALID_TOKEN",
                        "error-message": "Token is invalid"
                    }
                });
            }
            req.userData = decoded;

            User.findOne({ userName: decoded.userName }, function (err, userFound) {
                console.log(userFound);
                if (!userFound) {
                    res.json({
                        "error-response": {
                            "error-code": 403,
                            "error'key": "ACCESS_DENIED",
                            "error-message": "Access denied"
                        }
                    });
                }
                if (userFound.status == 'IN_REGISTRATION') {
                    res.json({
                        "error-response": {
                            "error-code": 403,
                            "error'key": "LOGIN_IN_REGISTRATION",
                            "error-message": "User is in registration process"
                        }
                    });
                }

                if (userFound.status == 'LOGIN_LOCKED') {
                    res.json({
                        "error-response": {
                            "error-code": 403,
                            "error'key": "LOGIN_LOCKED",
                            "error-message": "User is locked"
                        }
                    });
                }
            });
            next();
        }
    } catch (error) {
        return res.json({
            "error-response": {
                "error-code": 500,
                "error'key": "INTERNAL_SERVER_ERROR",
                "error-message": "Internal server error – please contact support."
            }
        });
    }
};