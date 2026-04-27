const mongoose = require("mongoose");
require("./taskModel");

const bugSchema = new mongoose.Schema({
    taskId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task",
        required: false
    },

    bugTitle: { type: String },
    description: { type: String },

    bugImage: { type: String },

    reportBy: { type: String },
    reportById: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    assignedDeveloper: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    qaTesterId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    retestCount: { type: Number, default: 0 },
    escalatedToPm: { type: Boolean, default: false },
    escalationReason: { type: String },

    severity: {
        type: String,
        enum: ["low", "medium", "high", "critical"],
    },

    priority: {
        type: String,
        enum: ["low", "medium", "high"],
        default: "medium"
    },

    moduleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Module"
    },

    stepsToReproduce: { type: String },
    expectedResult: { type: String },
    actualResult: { type: String },
    environment: { type: String },

    reviewComments: [{
        authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        authorName: String,
        authorRole: String,
        commenter: String, // fallback for old data
        comment: String,
        status: { type: String, enum: ["open", "resolved"], default: "open" },
        mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        date: { type: Date, default: Date.now }
    }],

    activityLogs: [{
        message: String,
        action: String,
        userName: String,
        userRole: String,
        date: { type: Date, default: Date.now }
    }],

    status: {
        type: String,
        enum: ["draft", "open", "submitted", "in_progress", "retest", "resolved", "closed", "reopened"],
        default: "draft"
    }

}, { timestamps: true });

module.exports = mongoose.model("Bug", bugSchema);