const mongoose = require("mongoose");

const ParkingPlaceSchema = new mongoose.Schema({
    displayName: {
        type: String,
        required: true
    },
    parkingHouse: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "ParkingHouse"
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    }
});

module.exports = mongoose.model("ParkingPlace", ParkingPlaceSchema);
