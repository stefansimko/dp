const mongoose = require("mongoose");
const md5 = require("md5");
const bcrypt = require("bcrypt");
const enumValues = require('mongoose-enumvalues');

require('mongoose-type-email');


const UserSchema = new mongoose.Schema({
    deviceId: {
        type: String,
        required: false,
        trim: true
    },
    ipAddressV4: {
        type: String,
        required: false
    },
    salutation: {
        type: String,
        required: true,
        enum: ["MR", "MS", "MRS"]

    },
    userRole: {
        type: String,
        required: true,
        enum: ["USER", "ADMIN"],
        default: "USER"
    },
    firstName: {
        type: String,
        required: true,
        max: 50
    },
    lastName: {
        type: String,
        required: true,
        max: 50
    },
    mobileNumber: {
        type: String,
        validate: {
            validator: function (v) {
                var re = /^[+][0-9]{12}$/;
                return (v == null || v.trim().length < 1) || re.test(v)
            },
            message: 'Provided phone number is invalid.'
        }
    },
    email: {
        type: mongoose.SchemaTypes.Email,
        max: 100
    },
    userName: {
        type: String,
        unique: true,
        required: true,
        max: 30
    },
    password: {
        type: String,
        required: true,
        min: 8,
        max: 16,
        trim: true
    },
    termsOfUseAccepted: {
        required: true,
        type: Boolean
    },
    securityQuestion: {
        type: String,
        required: true,
        enum: ["MOTHER_PLACE_OF_BIRTH", "BEST_CHILDHOOD_FRIEND_NAME", "FIRST_PET_NAME", "FAVOURITE_TEACHER_NAME", "FAVOURITE_HISTORIC_CHARACTER",
            "GRANDFATHER_PROFESSION"]
    },
    securityAnwsers: {
        required: true,
        type: String,
        min: 3,
        max: 255
    },
    dateCreated: {
        type: Date,
        default: Date.now
    },
    dateUpdated: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ["ACTIVE", "LOCKED", "IN_REGISTRATION"],
        default: "IN_REGISTRATION"
    },
    parkingPlace: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: "ParkingPlace"
    },
    occupations: [{
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: "Occupation"
    }]



})

UserSchema.pre("save", function (next) {
    if (!this.isModified("password")) {
        return next();
    }
    bcrypt.genSalt(10, (err, salt) => {
        if (err) return next(err);

        bcrypt.hash(this.password, salt, (err, hash) => {
            if (err) return next(err);

            this.password = hash;
            next();
        });
    });
});

module.exports = mongoose.model("User", UserSchema);
