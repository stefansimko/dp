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
        required: false,
        ref: "User"
    },
    availabilities: [{
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: "Together"
    }],
});

module.exports = mongoose.model("ParkingPlace", ParkingPlaceSchema);
