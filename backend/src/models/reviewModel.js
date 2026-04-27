const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    role: {
        type: String,
        trim: true,
        default: ""
    },
    company: {
        type: String,
        trim: true,
        default: ""
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    avatar: {
        type: String,
        default: ""
    },
    isApproved: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model("Review", reviewSchema);
