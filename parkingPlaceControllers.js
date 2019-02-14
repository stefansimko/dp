const ParkingPlace = require('./db/models/ParkingPlace')
const ParkingHouse = require('./db/models/ParkingHouse')
const User = require('./db/models/User')
const Availability = require('./db/models/Availability')
const Occupation = require('./db/models/Occupation')
const Together = require('./db/models/Together')


exports.signUp = (req, res) => {

    var displayName = req.body.displayName;
    var parkingHouse = req.body.parkingHouse;
    if (!displayName || !parkingHouse) {
        res.json({
            "error-response": {
                "error-code": 400,
                "error'key": "UNMARSHALLING_EXCEPTION",
                "error-message": "Request has invalid format"
            }
        })

        return
    }

    ParkingPlace.findOne({ displayName: displayName }, function (err, parkingplace) {
        if (err) {
            res.send(err)
        }

        if (parkingplace) {
            res.json({
                "error-response": {
                    "error-code": 403,
                    "error'key": "PARKING_PLACE_ALREADY_EXISTS",
                    "error-message": "Parking place already exits by the same name"
                }
            })

            return
        }
        ParkingHouse.findOne({ _id: parkingHouse }, function (err, parkingHouse) {
            if (err) {
                res.send(err)
            }

            if (!parkingHouse) {
                res.json({
                    "error-response": {
                        "error-code": 404,
                        "error'key": "PARKING_HOUSE_UNKNOWN",
                        "error-message": "Parking place already doesnt exist with this name"
                    }
                })

                return
            }

        })
    });
    const parkingPlace = new ParkingPlace({
        displayName: req.body.displayName,
        parkingHouse: req.body.parkingHouse,
    }).save()
        .then(data => {

            ParkingHouse.findByIdAndUpdate(
                data.parkingHouse,
                { $push: { parkingplace: data._id } },
                { new: true }, (err, doc) => {
                    if (err) {
                        console.log("Something wrong when updating data!");
                    }
                }
            )

            res.status(200).send({ identificator: data._id });
        }).catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while creating the ParkingHouse."
            });
        });
};

exports.modify = (req, res) => {

    const parkingPlaceId = req.params.parkingPlaceIdentifier;
    const displayName = req.body.displayName;

    if (!parkingPlaceId || !displayName) {
        res.json({
            "error-response": {
                "error-code": 400,
                "error'key": "UNMARSHALLING_EXCEPTION",
                "error-message": "Request has invalid format"
            }
        })

        return
    }

    ParkingPlace.findOneAndUpdate({ _id: parkingPlaceId },
        { $set: { displayName: displayName } },
        { multi: true, safe: true },
        function (err, parkingPlace) {

            if (!parkingPlace) {
                res.json({
                    "error-response": {
                        "error-code": 404,
                        "error'key": "PARKING_HOUSE_UNKNOWN",
                        "error-message": "Parking house doesnt exist with this name"
                    }
                })

                return
            }
            res.status(200).send({
                message: "Parkinghouse was successfully updated"
            })
        })
}
exports.delete = (req, res) => {

    const parkingPlaceId = req.params.parkingPlaceIdentifier;

    ParkingPlace.findOneAndDelete(parkingPlaceId, function (err, parkingplace) {
        if (err) {
            res.json(err)
        }

        if (!parkingplace) {
            res.json({
                "error-response": {
                    "error-code": 404,
                    "error'key": "PARKING_PLACE_NOT_FOUND",
                    "error-message": "Parking place doesnt exist with this name"
                }
            })

            return
        }

        ParkingHouse.findOneAndUpdate(
            parkingplace.parkingHouse,
            { $pull: { parkingplace: parkingplace._id } },
            (err, doc) => {
                if (err) {
                    res.json({
                        "error-response": {
                            "error-code": 500,
                            "error'key": "INTERNAL_SERVER_ERROR",
                            "error-message": "Some error occurred while updating the Parking place."
                        }
                    })
                }
            })

        res.status(200).send({
            message: 'Parking place was successfully deleted!!!'
        })


    }).catch(err => {
        res.json({
            "error-response": {
                "error-code": 500,
                "error'key": "INTERNAL_SERVER_ERROR",
                "error-message": "Some error occurred while updating the Parking place."
            }
        });
    })
},
    exports.getAvailability = (req, res) => {
        const parkingPlaceId = req.params.parkingPlaceIdentifier;
        ParkingPlace.findById(parkingPlaceId, 'displayName').lean()
            .populate('owner', '-_id firstName lastName mobileNumber email')
            .populate('parkingHouse', 'displayName Iat Iot address').lean()
            .populate({
                path: 'availabilities',





                select: '-_id day',
                populate: {
                    path: 'owner',
                    model: 'User',
                    select: '-_id userName firstName lastName mobileNumber email '
                }
            })
            .exec(function (err, together) {
                res.status(200).json(together)
            })
    }