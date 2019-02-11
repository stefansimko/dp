"use strict";

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("./db/models/User");
const ParkingHouse = require("./db/models/ParkingHouse");
const ParkingPlace = require("./db/models/ParkingPlace");
const Occupation = require("./db/models/Occupation");

const createToken = (user, secret, expiresIn) => {
    const { username, email } = user;
    return jwt.sign({ username, email }, secret, { expiresIn });
};

module.exports = {
    User: { parkingPlace: ({ _id }) => ParkingPlace.findOne({ owner: _id }) },
    ParkingPlace: { parkingHouse: ({ _id }) => ParkingHouse.findOne({ parkingplace: _id }) },
    // ParkingHouse: { parkingHouse: ({ _id }) => ParkingPlace.findOne({ parkingHouse: _id }) },
    Query: {
        getUserInfo: (() => {
            var _ref = (0, _asyncToGenerator3.default)(function* (_, { userId }, { User }) {
                const user = yield User.findOne();

                return user;
            });

            return function getUserInfo(_x, _x2, _x3) {
                return _ref.apply(this, arguments);
            };
        })(),
        getAllParkingHouses: (() => {
            var _ref2 = (0, _asyncToGenerator3.default)(function* (_, args, { ParkingHouse }) {
                const parkingHouse = yield ParkingHouse.find({}).populate({
                    path: "parkingplace",
                    model: "ParkingPlace",
                    populate: {
                        path: "owner",
                        model: "User"
                    }
                });
                return parkingHouse;
                // },
                // getUserProfile: async (_, { userId }, { User }) => {
                //     const user = await User.findOne({
                //         _id: userId
                //     })
                //     return user;
                // }
            });

            return function getAllParkingHouses(_x4, _x5, _x6) {
                return _ref2.apply(this, arguments);
            };
        })()
    },
    Mutation: {
        signupUser: (() => {
            var _ref3 = (0, _asyncToGenerator3.default)(function* (_, { firstName, lastName, userName, mobileNumber, email, ipAddressV4, deviceId, termsOfUseAccepted, securityQuestion, securityAnwsers, salutation, password, parkingPlace }, { User }) {
                const user = yield User.findOne({ firstName });
                if (user) {
                    throw new Error("User already exists");
                }
                const newUser = yield new User({
                    firstName,
                    lastName,
                    userName,
                    mobileNumber,
                    email,
                    termsOfUseAccepted,
                    securityQuestion,
                    securityAnwsers,
                    salutation,
                    password,
                    parkingPlace
                }).save();
                return newUser;
                // return { token: createToken(newUser, process.env.SECRET, "1d") };
            });

            return function signupUser(_x7, _x8, _x9) {
                return _ref3.apply(this, arguments);
            };
        })(),
        signupParkingHouse: (() => {
            var _ref4 = (0, _asyncToGenerator3.default)(function* (_, { displayName, iat, iot, street }, { ParkingHouse }) {
                const newParkingHouse = yield new ParkingHouse({
                    displayName,
                    iat,
                    iot
                }).save();
                return newParkingHouse;
            });

            return function signupParkingHouse(_x10, _x11, _x12) {
                return _ref4.apply(this, arguments);
            };
        })(),
        signUpParkingPlace: (() => {
            var _ref5 = (0, _asyncToGenerator3.default)(function* (_, { displayName, parkingHouse, owner }, { ParkingPlace }) {
                const newParkingPlace = yield new ParkingPlace({
                    displayName,
                    parkingHouse,
                    owner
                }).save();
                const parkingHouseToUpdate = yield ParkingHouse.findOneAndUpdate({ _id: parkingHouse }, { $push: { parkingplace: newParkingPlace } });
                const userToUpdate = yield User.findOneAndUpdate({ _id: owner }, { $set: { parkingplace: newParkingPlace } });
                return newParkingPlace;
            });

            return function signUpParkingPlace(_x13, _x14, _x15) {
                return _ref5.apply(this, arguments);
            };
        })(),
        signupOccupation: (() => {
            var _ref6 = (0, _asyncToGenerator3.default)(function* (_, { parkingPlace, owner, day }, { Occupation }) {
                const occupation = yield new Occupation({
                    parkingPlace,
                    owner,
                    day
                }).save();
                const userToUpdate = yield User.findOneAndUpdate({ _id: owner }, { $set: { occupations: occupation } });
                return occupation;
            });

            return function signupOccupation(_x16, _x17, _x18) {
                return _ref6.apply(this, arguments);
            };
        })(),
        deleteUser: (() => {
            var _ref7 = (0, _asyncToGenerator3.default)(function* (_, { userId }, { User }) {
                const user = yield User.findOneAndDelete({ _id: userId });
                return user;
            });

            return function deleteUser(_x19, _x20, _x21) {
                return _ref7.apply(this, arguments);
            };
        })(),
        deleteParkingHouse: (() => {
            var _ref8 = (0, _asyncToGenerator3.default)(function* (_, { parkingHouseId }, { ParkingHouse }) {
                const parkingHouse = yield ParkingHouse.findOneAndDelete({ _id: parkingHouseId });
                return parkingHouse;
            });

            return function deleteParkingHouse(_x22, _x23, _x24) {
                return _ref8.apply(this, arguments);
            };
        })(),
        updateParkingHouse: (() => {
            var _ref9 = (0, _asyncToGenerator3.default)(function* (_, { parkingHouseId, displayName, iat, iot }, { ParkingHouse }) {
                const parkingHouse = yield ParkingHouse.findOneAndUpdate({ _id: parkingHouseId }, { $set: { displayName, iat, iot } }, { new: true });
                return parkingHouse;
            });

            return function updateParkingHouse(_x25, _x26, _x27) {
                return _ref9.apply(this, arguments);
            };
        })(),
        deleteParkingPlace: (() => {
            var _ref10 = (0, _asyncToGenerator3.default)(function* (_, { parkingPlaceId }, { ParkingPlace }) {
                const parkingPlace = yield ParkingPlace.findOneAndDelete({ _id: parkingPlaceId });
                return parkingPlace;
            });

            return function deleteParkingPlace(_x28, _x29, _x30) {
                return _ref10.apply(this, arguments);
            };
        })(),
        updateParkingPlace: (() => {
            var _ref11 = (0, _asyncToGenerator3.default)(function* (_, { parkingPlaceId, displayName, parkingHouse, owner }, { ParkingPlace }) {
                const parkingPlace = yield ParkingPlace.findOneAndUpdate({ _id: parkingPlaceId, parkingHouse: parkingHouse, owner: owner }, { $set: { displayName } }, { returnOriginal: false, upsert: true });
                return parkingPlace;
            });

            return function updateParkingPlace(_x31, _x32, _x33) {
                return _ref11.apply(this, arguments);
            };
        })()

    }
};