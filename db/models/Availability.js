const mongoose = require("mongoose");
const _ = require('underscore');

const AvailabilitySchema = new mongoose.Schema({
    day: [{
        type: String,
        required: true,
        unique: true
    }],
    parkingPlace: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "ParkingPlace"
    }
});

// AvailabilitySchema.pre('save', function (next) {
//     this.day = _.unique(this.day);
//     next();
// });


module.exports = mongoose.model("Availability", AvailabilitySchema);
