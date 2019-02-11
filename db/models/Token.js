
const mongoose = require("mongoose");

const TokenSchema = new mongoose.Schema({
    scope: {
        type: String,
        required: false,
        trim: true
    },
    remainingUsages: {
        type: Number,
        required: false,
        default: -1
    },
    token: {
        type: String,
        required: true,
        trim: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: "User"
    },
    clientId: {
        type: String,
        required: false,
        trim: true
    },
    serviceUrl: {
        type: String,
        required: false,
        trim: true
    },
    httpMethod: {
        type: String,
        required: false,
        trim: true
    },

})

module.exports = mongoose.model("Token", TokenSchema);
