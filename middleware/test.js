
const User = require('../db/models/User')
const Token = require('../db/models/Token')
const jwt = require('jsonwebtoken')
const bcrypt = require("bcrypt");


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
        const split = credentials.split(':');
        var userName = split[0]
        var password = split[1]

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
            bcrypt.compare(password, userFound.password, function (err, result) {
                if (result === true) {
                    return res.json({
                        "error-response": {
                            "error-code": 500,
                            "error'key": "sedi to",
                            "error-message": "Internal server error – please contact support."
                        }
                    });

                }
                else {
                    return res.json({
                        "error-response": {
                            "error-code": 500,
                            "error'key": "needi to",
                            "error-message": "Internal server error – please contact support."
                        }
                    });

                }
            })


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


            var scope = req.query.scope;
            var clientID = req.query.client_id;
            var serviceUrl = req.query.service_url;
            var httpMethod = req.query.http_method;
            const token = jwt.sign({ userName: userName }, process.env.SECRET, { expiresIn: 100000 })
            const tokenToSave = new Token({
                owner: userFound._id,
                token: token,
                scope: scope,
                clientId: clientID,
                serviceUrl: serviceUrl,
                httpMethod: httpMethod
            })

            tokenToSave.save().then(data => {
                User.findOneAndUpdate({ _id: data.owner, }, { $push: { token: data } }, { new: true }
                    , function (err, userFound) {
                        if (err) {
                            res.json(err)
                        }

                    }
                )
            }

            )
            res.status(200).json({
                value: tokenToSave.token,

            })
        })
        next()


    }
    catch (error) {
        res.status(500).send(error)
    }
}
