"use strict";

const mongoose = require("mongoose");
const Float = require('mongoose-float').loadType(mongoose);

const ParkingHouseSchema = new mongoose.Schema({
    displayName: {
        type: String,
        require: true
    },
    iot: {
        type: Float,
        require: true
    },
    iat: {
        type: Float,
        require: true
    },
    parkingplace: [{
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: "ParkingPlace"
    }],
    address: {
        street: {
            type: String,
            require: true
        },
        houseNumber: {
            type: Number,
            require: true
        },
        zipcode: {
            type: Number,
            require: true
        },
        city: {
            type: String,
            require: true
        }
    }

});
module.exports = mongoose.model("ParkingHouse", ParkingHouseSchema);