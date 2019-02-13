const User = require('./db/models/User')
const Occupation = require('./db/models/Occupation')
const ParkingPlace = require('./db/models/ParkingPlace')
const Availability = require('./db/models/Availability')
const jwt = require('jsonwebtoken')
const nodemailer = require("nodemailer");
const randomstring = require("randomstring");
const bcrypt = require("bcrypt");
const Token = require('./db/models/Token')
const Together = require('./db/models/Together')







exports.signUp = (req, res) => {
    User.findOne({ $or: [{ mobileNumber: req.body.mobileNumber }, { userName: req.body.userName }, { email: req.body.email }] }, function (err, user) {

        if (user) {
            res.json({
                "error-response": {
                    "error-code": 403,
                    "error'key": "USER_ALREADY_EXISTS",
                    "error-message": "ParkingHouseUser with provided email or phone number already exists."
                }
            })

            return
        }

        const newUser = new User({
            deviceId: req.body.deviceId,
            ipAddressV4: req.body.ipAddressV4,
            securityQuestion: req.body.securityQuestion,
            securityAnswer: req.body.securityAnswer,
            mobileNumber: req.body.mobileNumber,
            email: req.body.email,
            userName: req.body.userName,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            termsOfUseAccepted: req.body.termsOfUseAccepted,
            salutation: req.body.salutation,
            password: req.body.password
        });

        newUser.save()
            .then(data => {
                var userToSend = {
                    userName: data.userName,
                    status: data.status
                }
                res.status(200).send(userToSend);
            }).catch(err => {
                res.status(500).send({
                    message: err.message || "Some error occurred while creating the User."
                });
            });

    }

    ).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while creating the User."
        });
    });
};

exports.modify = (req, res) => {

    User.findOneAndUpdate({ userName: req.params.mobileNumber }, function (err, user) {
        res.status(200).send({
            message: "User was succesfully updated! "
        })

    })
};

exports.userInfo = (req, res) => {
    User.findOne(req.params.mobileNumber)
        .populate([{
            path: 'parkingPlace',

            populate: {
                path: 'parkingHouse',

            }

        },
        {
            path: 'occupations',
            populate: [{
                path: 'parkingPlace'
            },
            {
                path: 'owner'
            }
            ]
        }])
        .then(user => {
            var userToSend = {
                userName: user.userName,
                firstName: user.firstName,
                lastName: user.lastName,
                termsOfUseAccepted: user.termsOfUseAccepted,
                parkingPlace: {
                    identifier: user.parkingPlace._id,
                    displayName: user.parkingPlace.displayName,
                    parkingHouse: {
                        identifier: user.parkingPlace.parkingHouse._id,
                        displayName: user.parkingPlace.parkingHouse.displayName,
                        iat: user.parkingPlace.parkingHouse.iat,
                        iot: user.parkingPlace.parkingHouse.iot,
                        address: {
                            street: user.parkingPlace.parkingHouse.address.street,
                            houseNumber: user.parkingPlace.parkingHouse.address.houseNumber,
                            zipcode: user.parkingPlace.parkingHouse.address.zipcode,
                            city: user.parkingPlace.parkingHouse.address.city
                        }
                    }
                },
                occupation: user.occupations



            }
            res.send(userToSend);
        }).catch(err => {
            if (err.kind === 'ObjectId') {
                return res.status(404).send({
                    message: "Note not found with id " + req.params.userName
                });
            }
            return res.status(500).send({
                message: "Error retrieving note with id " + req.params.userName
            });
        });
};

exports.userProfile = (req, res) => {
    User.findOne(req.params.mobileNumber)
        .then(user => {
            if (!user) {
                return res.status(404).send({
                    message: "User not found"
                });
            }
            var userToSend = {
                userName: user.userName,
                salutation: user.salutation,
                firstName: user.firstName,
                lastName: user.lastName,
                securityQuestion: user.securityQuestion

            }
            res.send(userToSend);
        }).catch(err => {
            if (err.kind === 'ObjectId') {
                return res.status(404).send({
                    message: "Note not found with id " + req.params.userName
                });
            }
            return res.status(500).send({
                message: "Error retrieving note with id " + req.params.userName
            });
        });
};

exports.assignParkingPlace = (req, res) => {

    const loginAlias = req.body.loginAlias;
    const parkingPlaceID = req.body.parkingPlaceIdentifier;

    if (!loginAlias) {
        res.json({
            "error-response": {
                "error-code": 403,
                "error'key": "NO_LOGIN_ALIAS_SPECIFIED",
                "error-message": "No login alias specified."
            }
        })
        return
    }

    if (!parkingPlaceID) {
        res.json({
            "error-response": {
                "error-code": 403,
                "error'key": "NO_PARKING_PLACE_SPECIFIED",
                "error-message": "No parking place specified."
            }
        })
        return
    }

    User.findOneAndUpdate({ $or: [{ mobileNumber: loginAlias }, { userName: loginAlias }, { email: loginAlias }] }, { $set: { parkingPlace: parkingPlaceID } }, { upsert: true, new: true }, function (err, user) {
        console.log('dosiel som 1')
        if (!user) {
            res.json({
                "error-response": {
                    "error-code": 403,
                    "error'key": "PARKING_PLACE_ASSIGNMENT_UNKNOWN_USER",
                    "error-message": "Cannot assign park place to unknown user."
                }
            })
            return
        }

        ParkingPlace.findOne({ _id: parkingPlaceID }, function (err, parkingPlace) {
            if (!parkingPlace) {
                res.json({
                    "error-response": {
                        "error-code": 403,
                        "error'key": "NO_PARKING_PLACE_FOUND",
                        "error-message": "No parking place found."
                    }
                })
                return
            }
        }).then(parkingPlaceFound => {


            if (parkingPlaceFound.owner) {
                res.json({
                    "error-response": {
                        "error-code": 403,
                        "error'key": "PARKING_PLACE_ALREADY_OCCUPIED",
                        "error-message": "Parkingplace is already occupied."
                    }
                })
                return
            }
            User.findOne({ $or: [{ mobileNumber: loginAlias }, { userName: loginAlias }, { email: loginAlias }] }, function (err, userFou) {
                parkingPlaceFound.update({ $set: { owner: userFou } }, { new: true }, function (err, parki) {
                    res.status(200).json({ message: "Parkingplace was successfully assigned to user" })
                })


            })

        })
    })

};
exports.releaseParkingPlace = (req, res) => {
    const loginAlias = req.body.loginAlias;
    const parkingPlaceID = req.body.parkingPlaceIdentifier;

    if (!loginAlias) {
        res.json({
            "error-response": {
                "error-code": 403,
                "error'key": "NO_LOGIN_ALIAS_SPECIFIED",
                "error-message": "No login alias specified."
            }
        })
        return
    }

    if (!parkingPlaceID) {
        res.json({
            "error-response": {
                "error-code": 403,
                "error'key": "NO_PARKING_PLACE_SPECIFIED",
                "error-message": "No parking place specified."
            }
        })
        return
    }

    User.findOneAndUpdate({ $or: [{ mobileNumber: loginAlias }, { userName: loginAlias }, { email: loginAlias }] }, { $unset: { parkingPlace: parkingPlaceID } }, { upsert: true, new: true }, function (err, user) {

        if (!user) {
            return res.json({
                "error-response": {
                    "error-code": 403,
                    "error'key": "PARKING_PLACE_ASSIGNMENT_UNKNOWN_USER",
                    "error-message": "Cannot assign park place to unknown user."
                }
            })

        }
    }).then(data => {


        ParkingPlace.findById(parkingPlaceID, function (err, parkingPlaceFound) {
            if (!parkingPlaceFound) {
                res.json({
                    "error-response": {
                        "error-code": 403,
                        "error'key": "PARKING_PLACE_DOESNT_EXIST",
                        "error-message": "Cannot find specified parking place."
                    }
                })

                return
            }

        }).then(data => {
            if (!data.owner) {
                res.json({
                    "error-response": {
                        "error-code": 403,
                        "error'key": "PARKING_PLACE_NOT_OCCUPIED",
                        "error-message": "Cannot unssign user because the parking place is not occupied."
                    }
                })

                return
            }
            data.update({ $unset: { owner: data._id } },
                { upsert: true, new: true }, function (err, parkingPlaceFound) {
                    res.status(200).send({
                        message: "The user has been unassigned to the Parking place."
                    })

                })
        }).catch(err => {
            res.json({
                "error-response": {
                    "error-code": 500,
                    "error'key": "INTERNAL_SERVER_ERROR",
                    "error-message": "Internal server error – please contact support."
                }
            });
        })
    }).catch(err => {
        res.json({
            "error-response": {
                "error-code": 500,
                "error'key": "INTERNAL_SERVER_ERROR",
                "error-message": "Internal server error – please contact support."
            }
        });
    })

};

exports.setAvailableDay = (req, res) => {

    const loginAlias = req.body.loginAlias;
    const parkingPlaceID = req.body.parkingPlaceIdentifier;
    const day = req.body.day

    if (!loginAlias) {
        res.json({
            "error-response": {
                "error-code": 403,
                "error'key": "SETTING_AVAILABLE_DAY_UNKNOWN_USER",
                "error-message": "Cannot set available day to unknown user."
            }
        })
        return
    }

    if (!parkingPlaceID) {
        res.json({
            "error-response": {
                "error-code": 403,
                "error'key": "SETTING_AVAILABLE_DAY_UNKNOWN_PARKING_PLACE",
                "error-message": "Cannot set available day to parking place."
            }
        })
        res.end(400)
        return
    }

    if (!day) {
        res.json({
            "error-response": {
                "error-code": 400,
                "error'key": "UNMARSHALLING_EXCEPTION",
                "error-message": "Request has invalid format"
            }
        })
        res.end(400)
        return
    }



    User.findOne({ $or: [{ mobileNumber: loginAlias }, { userName: loginAlias }, { email: loginAlias }] }, function (err, userFound) {
        if (!userFound) {
            res.json({
                "error-response": {
                    "error-code": 400,
                    "error'key": "SETTING_AVALIBLE_DAY_FOR_NON_OWNER",
                    "error-message": "Setting avalaible day for non owner of parking place"
                }
            })
        }

        if (userFound.parkingPlace != parkingPlaceID || !userFound.parkingPlace) {
            res.json({
                "error-response": {
                    "error-code": 400,
                    "error'key": "SETTING_AVALIBLE_DAY_FOR_PARKING_PLACE_THAT_IS_NOT_ASSIGNED_ON_YOU",
                    "error-message": "Setting avalaible day for parking place, that is not assigned on you is not allowed"
                }
            })
        }

    })


    Occupation.findOne({ day: day, parkingPlace: parkingPlaceID }, function (err, occupationFound) {
        if (occupationFound) {
            if (occupationFound.day == day && occupationFound.parkingPlace == parkingPlaceID) {
                return res.json({
                    "error-response": {
                        "error-code": 400,
                        "error'key": "SETTING_AVALIBLE_DAY_FOR_ALREADY_BOOKED_DAY",
                        "error-message": "Setting available day for parking place that is already occupied for requested day is forbidden"
                    }
                })
            }
        }
    })
    const togetherToSave = new Together({
        day: day,
        parkingPlace: parkingPlaceID
    }).save().then(data => {
        console.log(data)
        ParkingPlace.findByIdAndUpdate(data.parkingPlace, { $push: { availabilities: data._id } }, { upsert: true, new: true }, function (err, parkingPlaceFound) {
            console.log(parkingPlaceFound)
        })
    })
    Availability.findOne({ parkingPlace: parkingPlaceID }).exec()
        .then(data => {
            if (data) {
                Availability.findOne({ parkingPlace: parkingPlaceID, day: day }, function (err, findDays) {
                    if (findDays) {
                        res.json({
                            "error-response": {
                                "error-code": 403,
                                "error'key": "AVAILABLE_DAY_FOR_THIS_PARKING_PLACE_ALREADY_EXISTS",
                                "error-message": "Available day for this parking place already exists "
                            }
                        })
                    }
                    else {
                        data.update({ $addToSet: { day: day } }, { upsert: true, new: true }, function (err, availabilityUpdated) {
                            res.status(200).send({ message: "Setting available was successful." })
                        })
                    }
                })

            }

            else {
                const availabilityToSave = new Availability({
                    day: day,
                    parkingPlace: parkingPlaceID
                }).save()
                res.status(200).send({ message: "Setting available was successful." })

            }
        })
};


exports.useAvailableDay = (req, res) => {

    const loginAlias = req.body.loginAlias;
    const parkingPlaceID = req.body.parkingPlaceIdentifier;
    const day = req.body.day

    if (!loginAlias) {
        res.json({
            "error-response": {
                "error-code": 403,
                "error'key": "SETTING_AVAILABLE_DAY_UNKNOWN_USER",
                "error-message": "Cannot set available day to unknown user."
            }
        })
        return
    }

    if (!parkingPlaceID) {
        res.json({
            "error-response": {
                "error-code": 403,
                "error'key": "SETTING_AVAILABLE_DAY_TO_UNKNOWN_PARKING_PLACE",
                "error-message": "Cannot set available day to  uknown parking place."
            }
        })
        res.end(400)
        return
    }
    User.findOne({ $or: [{ mobileNumber: loginAlias }, { userName: loginAlias }, { email: loginAlias }] }, function (err, user) {
        if (!user) {
            return res.json({
                "error-response": {
                    "error-code": 404,
                    "error'key": "SETTING_AVAILABLE_DAY_TO_UNKNOWN_USER",
                    "error-message": "Cannot set available day to  uknown parking place."
                }
            })
        }
        Together.findOne({ parkingPlace: parkingPlaceID, day: day }, function (err, togetherFound) {
            if (togetherFound) {

                Together.findOneAndUpdate({ parkingPlace: parkingPlaceID, day: day }, { $set: { owner: user._id } }, { upsert: true, new: true }, function (err, togetherUpdated) {
                    console.log(togetherUpdated)
                })
            }
            else {
                const togetherToSave = new Together({
                    day: day,
                    parkingPlace: parkingPlaceID,
                    owner: user._id
                }).save().then(data => {
                    ParkingPlace.findByIdAndUpdate(data.parkingPlace, { $push: { availabilities: data._id } }, { upsert: true, new: true }, function (err, parkingPlaceFound) {
                        console.log(parkingPlaceFound)
                    })
                })
            }
        })




    }).then(user => {
        Availability.findOne({ day: day, parkingPlace: parkingPlaceID }, function (err, availability) {
            if (!availability || !availability.day || !availability.parkingPlace || availability.day.size == 0) {
                return res.json({
                    "error-response": {
                        "error-code": 403,
                        "error'key": "AVAILABLE_DAY_DOESNT_EXIST_FOR_THIS_PARKING_PLACE",
                        "error-message": "Available day doesnt exist for this parking place"
                    }
                })

            }

        }).then(avaibilityfound => {
            Occupation.findOne({ day: avaibilityfound.day, parkingPlace: avaibilityfound.parkingPlaceID }, function (err, occupatioFound) {

                if (occupatioFound) {
                    return res.json({
                        "error-response": {
                            "error-code": 403,
                            "error'key": "AVAILABLE_DAY_DOESNT_EXIST_FOR_THIS_PARKING_PLACE",
                            "error-message": "Available day doesnt exist for this parking place"
                        }
                    })
                }
                else {
                    const newOccupation = Occupation({
                        day: day,
                        parkingPlace: parkingPlaceID,
                        owner: user._id
                    })

                    newOccupation.save().then(occupation => {

                        User.findOneAndUpdate({ mobileNumber: loginAlias }, { $push: { occupations: occupation } }, { upsert: true, new: true }
                        ).then(user => {
                            Availability.findOneAndUpdate({ parkingPlace: occupation.parkingPlace }, { $pull: { day: day } }, { upsert: true }
                            ).then(data => {
                                console.log(data.day.length)
                                if (data.day.length == 1) {
                                    data.remove();
                                    return res.status(200).json({
                                        message: "Setting occupation was successful"

                                    })
                                }
                                else {
                                    return res.status(200).json({
                                        message: "Setting occupation was successful"

                                    })
                                }
                            }

                                // res.status(200).json({
                                // message: "Setting occupation was successful"

                                // })
                            )
                        })
                    })
                }

            }).catch(err => {
                res.json({
                    "error-response": {
                        "error-code": 500,
                        "error'key": "INTERNAL_SERVER_ERROR",
                        "error-message": "Internal server error – please contact support."
                    }
                });

            })


        })
    })

}


exports.token = (req, res) => {

    var userName = req.userName
    console.log('usernamen', userName)
    var scope = req.scope
    var clientID = req.clientID
    var serviceUrl = req.serviceUrl
    var httpMethod = req.httpMethod


    User.findOne({ userName: userName }, function (err, userFound) {

        if (!userFound) {
            res.json({
                "error-response": {
                    "error-code": 500,
                    "error'key": "INTERNAL_SERVER_ERROR",
                    "error-message": "Internal server error – please contact support."
                }
            });

        }

    }).then(user => {

        const token = jwt.sign({ userName: user.userName }, process.env.SECRET, { expiresIn: 100000 })
        const tokenToSave = new Token({
            owner: user._id,
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
        })
        res.status(200).json({
            value: tokenToSave.token,
            expiresIn: 100000,
            remainingUsages: tokenToSave.remainingUsages
        })

    })
}


exports.validateToken = (req, res, next) => {
    res.status(200).send('sicko ok')

}

exports.securityQuestion = (req, res, next) => {
    if (!req.body.loginAlias) {
        return res.json({
            "error-response": {
                "error-code": 400,
                "error'key": "UNMARSHALLING_EXCEPTION",
                "error-message": "Request has invalid format"
            }
        })
    }
    User.findOne({ $or: [{ mobileNumber: loginAlias }, { userName: loginAlias }, { email: loginAlias }] }).then(data => {
        if (data.status == 'LOCKED') {
            return res.json({
                "error-response": {
                    "error-code": 403,
                    "error'key": "CONTACT_CALL_CENTER",
                    "error-message": "User is locked. Please contact call center."
                }
            })
        }
        if (!data.securityQuestion) {
            return res.json({
                "error-response": {
                    "error-code": 403,
                    "error'key": "USER_HAS_NO_SECURITY_QUESTION_SET",
                    "error-message": "User has no security question set"
                }
            })
        }

        res.json({
            securityQuestion: data.securityQuestion
        });
    })
}

exports.resetPassword = (req, res, next) => {
    const loginAlias = req.body.loginAlias;
    const securityQuestion = req.body.securityQuestion;
    const securityAnswer = req.body.securityAnswer;
    if (!req.body.loginAlias) {
        return res.json({
            "error-response": {
                "error-code": 403,
                "error'key": "CONTACT_CALL_CENTER",
                "error-message": "User is locked. Please contact call center."
            }
        })
    }
    if (!req.body.securityAnswer || !req.body.securityQuestion) {
        return res.json({
            "error-response": {
                "error-code": 403,
                "error'key": "MISSING_SECURITY_QUESTION_OR_ANSWER",
                "error-message": "Request is missing either security question or answer"
            }
        })
    }

    User.findOne({ $or: [{ mobileNumber: loginAlias }, { userName: loginAlias }, { email: loginAlias }] }, function (err, userFound) {
        if (userFound.status == 'LOCKED') {
            return res.json({
                "error-response": {
                    "error-code": 403,
                    "error'key": "CONTACT_CALL_CENTER",
                    "error-message": "User is locked. Please contact call center."
                }
            })
        }
    }).then(data => {
        if (data.securityQuestion != securityQuestion) {
            return res.json({
                "error-response": {
                    "error-code": 403,
                    "error'key": "INCORRECT_SECURITY_QUESTION",
                    "error-message": "Given security question is incorrect"
                }
            })
        }

        if (data.securityQuestion == securityQuestion && data.securityAnswer != securityAnswer) {
            if (data.numberOfRemainingAttempts != 0) {
                numberOfRemainingAttemptsNew = data.numberOfRemainingAttempts - 1;
                data.update({ $set: { numberOfRemainingAttempts: numberOfRemainingAttemptsNew } })
                return res.json({
                    "error-response": {
                        "error-code": 403,
                        "error'key": "INCORRECT_SECURITY_ANSWER",
                        "error-message": "Given security answer is incorrect"
                    }
                })
            }
            else {
                return res.json({
                    "error-response": {
                        "error-code": 403,
                        "error'key": "INCORRECT_SECURITY_ANSWER_LOCKED_CUSTOMER",
                        "error-message": "Given security answer is incorrect. The max number of attempts has been exceeded. User has been locked"
                    }
                })
            }

        }
        else {
            const otp = randomstring.generate(16);

            var smtpTransport = nodemailer.createTransport({
                service: "gmail",
                host: "smtp.gmail.com",
                auth: {
                    user: "stevo.simko",
                    pass: "133110vettelhckosice"
                }
            });

            var mailOptions = {
                from: 'noreply@wirecard.com',
                to: data.email,
                subject: "Password Reset",
                html: "Dear user, <br> You have received One Time Password. You can find it here: " + otp
                    + "<br>Use this password to finnish your action "
            }
            const otp2 = otp
            smtpTransport.sendMail(mailOptions, function (error, response) {
                if (error) {
                    res.end("Internal server error – please contact support.");
                } else {
                    // let hash = bcrypt.hashSync(otp2, 10);
                    bcrypt.genSalt(10, function (err, salt) {
                        if (err) return; //handle error

                        bcrypt.hash(otp2, salt, function (err, hash) {

                            if (err) return; //handle error

                            data.update({ $set: { oneTimePassword: hash, optWasUsed: false } }, { upsert: true, new: true })
                                .then(res.end("One-time password has been sent via e-mail to user. Reset password link has been sent successfully"))

                        });
                    });


                }
            });
        }
    })
}
exports.isOtpValid = (req, res, next) => {
    const loginAlias = req.body.loginAlias;
    const otp = req.body.oneTimePassword;
    if (!loginAlias || !otp) {
        return res.json({
            "error-response": {
                "error-code": 400,
                "error'key": "UNMARSHALLING_EXCEPTION",
                "error-message": "Invalid format"
            }
        })
    }
    User.findOne({ $or: [{ mobileNumber: req.body.loginAlias }, { userName: req.body.loginAlias }, { email: req.body.loginAlias }] }).then(data => {
        if (!data) {
            res.json({
                "error-response": {
                    "error-code": 403,
                    "error'key": "UNKNOWN_USER",
                    "error-message": "Unknown user."
                }
            })
            return
        }
        else {
            if (data.optWasUsed == true) {
                res.json({
                    "error-response": {
                        "error-code": 403,
                        "error'key": "OTP_WAS_ALREADY_USED",
                        "error-message": "OTP password was already used."
                    }
                })
                return
            }
            else {
                bcrypt.compare(otp, data.oneTimePassword, function (err, response) {
                    if (response) {
                        res.status(200).json({ message: 'OTP is valid' })
                    } else {
                        res.json({
                            "error-response": {
                                "error-code": 403,
                                "error'key": "INVALID_OTP",
                                "error-message": "OTP is invalid"
                            }
                        })
                    }
                });

            }

        }

    })

}
exports.changePassword = (req, res, next) => {
    const loginAlias = req.body.loginAlias;
    const otp = req.body.oneTimePassword;
    const newPassword = req.body.newPassword;

    if (!loginAlias || !otp || !newPassword) {
        return res.json({
            "error-response": {
                "error-code": 400,
                "error'key": "UNMARSHALLING_EXCEPTION",
                "error-message": "Invalid format"
            }
        })


    }

    User.findOne({ $or: [{ mobileNumber: req.body.loginAlias }, { userName: req.body.loginAlias }, { email: req.body.loginAlias }] }).then(data => {
        if (!data) {
            res.json({
                "error-response": {
                    "error-code": 403,
                    "error'key": "UNKNOWN_USER",
                    "error-message": "Unknown user."
                }
            })
            return
        }
        else {
            if (data.optWasUsed == true) {
                res.json({
                    "error-response": {
                        "error-code": 403,
                        "error'key": "OTP_WAS_ALREADY_USED",
                        "error-message": "OTP password was already used."
                    }
                })
                return
            }
            else {
                const passwordToSave = newPassword;
                bcrypt.compare(otp, data.oneTimePassword, function (err, response) {
                    if (err) {
                        res.json({
                            "error-response": {
                                "error-code": 500,
                                "error'key": 500,
                                "error-message": "Internal server error – please contact support."
                            }
                        })
                        return
                    }
                    if (response) {
                        bcrypt.compare(newPassword, data.password, function (err, response) {
                            if (response) {
                                res.json({
                                    "error-response": {
                                        "error-code": 403,
                                        "error'key": "NEW_PASSWORD_OLD_PASSWORD_EQUALS",
                                        "error-message": "New password and old password musn't be equal"
                                    }
                                })
                                return
                            }
                            else {
                                bcrypt.genSalt(10, function (err, salt) {
                                    if (err) {
                                        res.json({
                                            "error-response": {
                                                "error-code": 500,
                                                "error'key": 500,
                                                "error-message": "Internal server error – please contact support."
                                            }
                                        })
                                        return
                                    };

                                    bcrypt.hash(passwordToSave, salt, function (err, hash) {

                                        if (err) {
                                            res.json({
                                                "error-response": {
                                                    "error-code": 500,
                                                    "error'key": 500,
                                                    "error-message": "Internal server error – please contact support."
                                                }
                                            })
                                            return
                                        };
                                        // User.findOneAndUpdate({ $or: [{ mobileNumber: req.body.loginAlias }, { userName: req.body.loginAlias }, { email: req.body.loginAlias }] }, { $set: { password: hash, optWasUsed: true } }, { upsert: true, new: true })
                                        data.update({ $set: { password: hash, optWasUsed: true } }, { upsert: true, new: true })
                                            .then(res.status(200).json({ message: "Password was successfully changed" }))
                                            .catch(err => {
                                                res.json({
                                                    "error-response": {
                                                        "error-code": 500,
                                                        "error'key": 500,
                                                        "error-message": "Error with updating user password. Please contact call center."
                                                    }
                                                })
                                                return
                                            })

                                    })
                                })
                            }
                        })
                    } else {
                        res.json({
                            "error-response": {
                                "error-code": 403,
                                "error'key": "INVALID_OTP",
                                "error-message": "OTP is invalid"
                            }
                        })
                    }
                });

            }

        }

    })
}

