const mongoose = require("mongoose");

const Together = new mongoose.Schema({
    day: {
        type: String,
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: "User"
    },
    parkingPlace: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "ParkingPlce"
    }
});

module.exports = mongoose.model("Together", Together);