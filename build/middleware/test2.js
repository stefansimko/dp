'use strict';

const User = require('../db/models/User');
const Token = require('../db/models/Token');
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    if (!req.headers.authorization) {
        return res.json({
            "error-response": {
                "error-code": 401,
                "error'key": 401,
                "error-message": "Missing authentication credentials."
            }
        });
    } else {
        if (req.headers.authorization.startsWith('Basic')) {
            const base64Credentials = req.headers.authorization.split(' ')[1];

            const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
            const split = credentials.split(':');
            var userName = split[0];

            User.findOne({ userName: userName }, function (err, userFound) {

                if (!userFound) {
                    return res.json({
                        "error-response": {
                            "error-code": 500,
                            "error'key": "INTERNAL_SERVER_ERROR",
                            "error-message": "Internal server error – please contact support."
                        }
                    });
                }
                if (userFound.status == 'LOCKED') {
                    return res.json({
                        "error-response": {
                            "error-code": 403,
                            "error'key": "LOGIN_LOCKED",
                            "error-message": "User is locked."
                        }
                    });
                }

                if (userFound.status == 'IN_REGISTRATION') {
                    return res.json({
                        "error-response": {
                            "error-code": 403,
                            "error'key": "LOGIN_IN_REGISTRATION",
                            "error-message": "User is in registration."
                        }
                    });
                }

                if (userFound.termsOfUseAccepted == false) {
                    return res.json({
                        "error-response": {
                            "error-code": 403,
                            "error'key": "TERMS_AND_CONDITIONS_NOT_ACCEPTED",
                            "error-message": "The user has not accepted the terms and conditions yet"
                        }
                    });
                }
            });
            req.userName = userName;
            next();
        } else {
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
                }).then(data => {
                    Token.findOne({ _id: data.token }, function (err, tokenFound) {
                        if (!token) {
                            res.json({
                                "error-response": {
                                    "error-code": 403,
                                    "error'key": "TOKEN_NOT_FOUND",
                                    "error-message": "Token wasn't found"
                                }
                            });
                            return;
                        }
                        console.log(token.token);
                        console.log(token);
                        if (token != tokenFound.token) {
                            res.json({
                                "error-response": {
                                    "error-code": 403,
                                    "error'key": "NOT_USER_TOKEN",
                                    "error-message": "Token doesnt belong to user"
                                }
                            });
                            return;
                        }
                        next();
                    });
                });
            }
        }
    }
};