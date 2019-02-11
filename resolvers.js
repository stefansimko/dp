const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("./db/models/User")
const ParkingHouse = require("./db/models/ParkingHouse")
const ParkingPlace = require("./db/models/ParkingPlace")
const Occupation = require("./db/models/Occupation")


const createToken = (user, secret, expiresIn) => {
    const { username, email } = user;
    return jwt.sign({ username, email }, secret, { expiresIn });
};

module.exports = {
    User: { parkingPlace: ({ _id }) => ParkingPlace.findOne({ owner: _id }) },
    ParkingPlace: { parkingHouse: ({ _id }) => ParkingHouse.findOne({ parkingplace: _id }) },
    // ParkingHouse: { parkingHouse: ({ _id }) => ParkingPlace.findOne({ parkingHouse: _id }) },
    Query: {
        getUserInfo: async (_, { userId }, { User }) => {
            const user = await User.findOne()

            return user;
        },
        getAllParkingHouses: async (_, args, { ParkingHouse }) => {
            const parkingHouse = await ParkingHouse.find({
            })
                .populate({
                    path: "parkingplace",
                    model: "ParkingPlace",
                    populate: {
                        path: "owner",
                        model: "User"
                    }
                })
            return parkingHouse;
            // },
            // getUserProfile: async (_, { userId }, { User }) => {
            //     const user = await User.findOne({
            //         _id: userId
            //     })
            //     return user;
            // }
        },
    },
    Mutation: {
        signupUser: async (_, { firstName, lastName, userName, mobileNumber, email, ipAddressV4, deviceId, termsOfUseAccepted, securityQuestion, securityAnwsers, salutation, password, parkingPlace }, { User }) => {
            const user = await User.findOne({ firstName });
            if (user) {
                throw new Error("User already exists")
            }
            const newUser = await new User({
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

        },
        signupParkingHouse: async (_, { displayName, iat, iot, street }, { ParkingHouse }) => {
            const newParkingHouse = await new ParkingHouse({
                displayName,
                iat,
                iot
            }).save()
            return newParkingHouse;
        },
        signUpParkingPlace: async (_, { displayName, parkingHouse, owner }, { ParkingPlace }) => {
            const newParkingPlace = await new ParkingPlace({
                displayName,
                parkingHouse,
                owner
            }).save();
            const parkingHouseToUpdate = await ParkingHouse.findOneAndUpdate(
                { _id: parkingHouse },
                { $push: { parkingplace: newParkingPlace } },
            )
            const userToUpdate = await User.findOneAndUpdate(
                { _id: owner },
                { $set: { parkingplace: newParkingPlace } },
            )
            return newParkingPlace
        },
        signupOccupation: async (_, { parkingPlace, owner, day }, { Occupation }) => {
            const occupation = await new Occupation({
                parkingPlace,
                owner,
                day
            }).save()
            const userToUpdate = await User.findOneAndUpdate(
                { _id: owner },
                { $set: { occupations: occupation } },
            )
            return occupation;
        },
        deleteUser: async (_, { userId }, { User }) => {
            const user = await User.findOneAndDelete({ _id: userId });
            return user
        },
        deleteParkingHouse: async (_, { parkingHouseId }, { ParkingHouse }) => {
            const parkingHouse = await ParkingHouse.findOneAndDelete({ _id: parkingHouseId });
            return parkingHouse
        },
        updateParkingHouse: async (_, { parkingHouseId, displayName, iat, iot, }, { ParkingHouse }) => {
            const parkingHouse = await ParkingHouse.findOneAndUpdate(
                { _id: parkingHouseId },
                { $set: { displayName, iat, iot } },
                { new: true });
            return parkingHouse
        },
        deleteParkingPlace: async (_, { parkingPlaceId }, { ParkingPlace }) => {
            const parkingPlace = await ParkingPlace.findOneAndDelete({ _id: parkingPlaceId });
            return parkingPlace
        },
        updateParkingPlace: async (_, { parkingPlaceId, displayName, parkingHouse, owner }, { ParkingPlace }) => {
            const parkingPlace = await ParkingPlace.findOneAndUpdate(
                { _id: parkingPlaceId, parkingHouse: parkingHouse, owner: owner },
                { $set: { displayName } },
                { returnOriginal: false, upsert: true });
            return parkingPlace
        }

    }
}
