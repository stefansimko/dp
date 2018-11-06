const mongoose = require("mongoose");

const OccupationSchema = new mongoose.Schema({
    day: {
        type: String,
        required: true
    },
    parkingPlace: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "ParkingPlace"
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    }
});

module.exports = mongoose.model("Occupation", OccupationSchema);
