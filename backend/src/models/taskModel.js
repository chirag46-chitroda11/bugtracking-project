const mongoose = require("mongoose");

require("./userModel");   // 🔥 ADD THIS

const taskSchema = new mongoose.Schema({
    taskTitle: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    acceptanceCriteria: {
        type: String
    },
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project"
    },
    moduleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Module"
    },
    assignedDeveloper: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"   // 🔥 FIXED
    },
    assignedTester: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    estimatedHours: {
        type: Number,
        default: 0
    },
    sprintId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Sprint"
    },
    notes: {
        type: String,
        default: ""
    },
    linkedBug: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bug"
    },
    assignBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"   // 🔥 FIXED
    },
    retestCount: { type: Number, default: 0 },
    escalatedToPm: { type: Boolean, default: false },
    escalationReason: { type: String },
    status: {
        type: String,
        enum: ["pending", "in progress", "testing", "completed"],
        default: "pending"
    },
    priority: {
        type: String,
        enum: ["low", "medium", "high"]
    },
    startDate: Date,
    endDate: Date,
    timeSpent: { type: Number, default: 0 },
    timerStartedAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model("Task", taskSchema);