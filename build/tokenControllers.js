'use strict';

const Token = require('./db/models/Token');

exports.token = (req, res) => {

    const userName = req.body.userName;
    const password = req.body.password;

    Token.findOne({});

    // User.findOne({ userName: userName, password: password }, function (err, userFound) {
    //     if (!userFound) {
    //         res.json({
    //             "error-response": {
    //                 "error-code": 500,
    //                 "error'key": "INTERNAL_SERVER_ERROR",
    //                 "error-message": "Internal server error – please contact support."
    //             }
    //         });

    //     }

    // }).then(user => {
    //     const token = jwt.sign({ userName: user.userName }, process.env.SECRET, { expiresIn: 100000 })
    //     User.findOne({ userName: user.userName }, function (err, user) {

    //         if (!user) {
    //             res.json({
    //                 "error-response": {
    //                     "error-code": 500,
    //                     "error'key": "Ineni taky",
    //                     "error-message": "Internal server error – please contact support."
    //                 }
    //             });
    //         }


    //     }).then(userFound => {
    //         User.findOneAndUpdate({ userName: userFound.userName, }, { $set: { token: token } }, { upsert: true, new: true }, function (err, doc) {
    //             if (err) {
    //                 console.log("Something wrong when updating data!");
    //             }
    //             console.log(doc);
    //         })
    //         res.status(200).send(token)
    //     })
    // })
};

exports.validateToken = (req, res, next) => {
    res.status(200).send('sicko ok');
};