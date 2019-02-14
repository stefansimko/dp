const ParkingHouse = require('./db/models/ParkingHouse')
const ParkingPlace = require('./db/models/ParkingPlace')


exports.signUp = (req, res) => {

    var displayName = req.body.displayName;
    var iat = req.body.iat;
    var iot = req.body.iot;

    const address = {
        street: req.body.address.street,
        houseNumber: req.body.address.houseNumber,
        zipcode: req.body.address.zipcode,
        city: req.body.address.city
    }

    if (!displayName || !iat || !iot) {
        res.json({
            "error-response": {
                "error-code": 400,
                "error'key": "UNMARSHALLING_EXCEPTION",
                "error-message": "Request has invalid format"
            }
        })
        return
    }

    ParkingHouse.findOne({ displayName: displayName }, function (err, parkingHouse) {

        if (parkingHouse) {
            res.json({
                "error-response": {
                    "error-code": 403,
                    "error'key": "PARKING_HOUSE_ALREADY_EXISTS",
                    "error-message": "Parking house already exits by the same name."
                }
            })
            return
        }

        const newParkingHouse = new ParkingHouse({
            displayName: displayName,
            iat: iat,
            iot: iot,
            address: {
                street: address.street,
                houseNumber: address.houseNumber,
                zipCode: address.zipcode,
                city: address.city
            }
        });

        newParkingHouse.save()
            .then(data => {
                res.send({ identificator: data._id });
            }).catch(err => {
                res.status(500).send({
                    message: err.message || "Some error occurred while creating the ParkingHouse."
                });
            });


    }).catch(err => {
        res.json({
            "error-response": {
                "error-code": 500,
                "error'key": 500,
                "error-message": "Internal server error – please contact support."
            }
        })

    }
    );
};

exports.delete = (req, res) => {

    const parkingHouseId = req.params.parkingHouseIdentifier;

    if (!parkingHouseId) {
        res.json({
            "error-response": {
                "error-code": 400,
                "error'key": "UNMARSHALLING_EXCEPTION",
                "error-message": "Request has invalid format"
            }
        })
    }

    ParkingHouse.findOneAndDelete(req.params.parkingHouseIdentifier, function (err, parkinghouse) {

        if (!parkinghouse) {
            res.json({
                "error-response": {
                    "error-code": 403,
                    "error'key": "PARKING_HOUSE_NOT_FOUND",
                    "error-message": "Parking house with this name doesnt exist."
                }
            })
            return
        }
        ParkingPlace.deleteMany({ parkingHouse: req.params.parkingHouseIdentifier }, function (err, parkingplaces) {
            if (err) {
                res.json(err)
            }
            console.log(parkingplaces)
        })

        return res.status(200).send({
            message: "Parkinghouse was successfully deleted"
        });
    }).catch(err => {
        res.json({
            "error-response": {
                "error-code": 500,
                "error'key": 500,
                "error-message": "Internal server error – please contact support."
            }
        })

    }
    );
}

exports.modify = (req, res) => {
    const parkingHouseId = req.params.parkingHouseIdentifier;
    var displayName = req.body.displayName;
    if (!parkingHouseId || !displayName) {
        res.json({
            "error-response": {
                "error-code": 400,
                "error'key": "UNMARSHALLING_EXCEPTION",
                "error-message": "Request has invalid format"
            }
        })
    }

    ParkingHouse.findOneAndUpdate(
        req.params.parkingHouseIdentifier,
        { $set: { displayName: displayName } },
        { multi: true, safe: true }, function (err, parkinghouse) {

            if (!parkinghouse) {
                res.json({
                    "error-response": {
                        "error-code": 403,
                        "error'key": "PARKING_HOUSE_NOT_FOUND",
                        "error-message": "Parking house with this name doesnt exist."
                    }
                })
                return
            }

            res.status(200).send({
                message: "Parkinghouse was successfully updated"
            })
        }
    )
}

exports.findAll = (req, res) => {

    ParkingHouse.find().populate({
        path: 'parkingplace',
        populate: {
            path: 'owner'
        }
    }
    )
        .then(parkingHouses => {
            res.status(200).send(parkingHouses)
        }


        ).catch(err => {
            if (err.kind === 'ObjectId') {
                return res.status(403).send({
                    message: "Parkinghouse not found with id " + req.params._id
                });
            }
            return res.status(500).send({
                message: "Error retrieving note with id " + req.params.userName
            });
        });

    // }
};

exports.freeParkingPlaces = (req, res) => {
    ParkingHouse.find()
        .select('displayName iat iot address')
        .lean()
        .populate({
            path: 'parkingplace',
            model: 'ParkingPlace',
            select: '_id displayName owner',
            populate: [{
                path: 'owner',
                model: 'User',
                select: 'firstName lastName email mobilNumber'
            },
            {
                path: 'availabilities',
                model: 'Together',
                select: ' -_id day',
                match: { owner: null }
            }
            ]
        }

        )

        .exec(function (err, together) {
            res.status(200).json(together)
        })
}