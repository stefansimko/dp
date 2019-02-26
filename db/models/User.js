const mongoose = require("mongoose");
const md5 = require("md5");
const bcrypt = require("bcrypt");
const enumValues = require('mongoose-enumvalues');
const jwt = require('jsonwebtoken');
// var validate = require('mongoose-validator').validate;
var validate = require('mongoose-validator')


require('mongoose-type-email');

var nameValidator = [
    validate({
        validator: 'isLength',
        arguments: [3, 50],
        message: 'Name should be between {ARGS[0]} and {ARGS[1]} characters',
    }),
    validate({
        validator: 'isAlphanumeric',
        passIfEmpty: true,
        message: 'Name should contain alpha-numeric characters only',
    }),
]


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
        },
        unique: true
    },
    email: {
        type: mongoose.SchemaTypes.Email,
        max: 100
    },
    userName: {
        type: String,
        unique: true,
        required: true,
        // maxlength: [8, 'Maximum characters for Username is 8'],
        minlength: 4,
        trim: true
        // validate: nameValidator

    },
    password: {
        type: String,
        required: true,
        minLength: 8,
        maxLength: 16,
        trim: true
    },
    termsOfUseAccepted: {
        required: true,
        type: Boolean
    },
    securityQuestion: {
        type: String,
        required: false,
        enum: ["MOTHER_PLACE_OF_BIRTH", "BEST_CHILDHOOD_FRIEND_NAME", "FIRST_PET_NAME", "FAVOURITE_TEACHER_NAME", "FAVOURITE_HISTORIC_CHARACTER",
            "GRANDFATHER_PROFESSION"]
    },
    securityAnswer: {
        required: false,
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
        default: "ACTIVE"
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
    }],

    token: [{
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: "Token"
    }],
    numberOfRemainingAttempts: {
        type: Number,
        default: 3
    },
    oneTimePassword: {
        required: false,
        type: String
    },
    optWasUsed: {
        required: false,
        type: Boolean,
    }




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

UserSchema.post('save', function (error, doc, next) {
    if (error.name === 'MongoError' && error.code === 11000) {
        next(new Error(error));
    } else {
        next(error);
    }
});

module.exports = mongoose.model("User", UserSchema);
