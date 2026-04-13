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
   
    assignedDeveloper: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
},

    severity: {
        type: String,
        enum: ["low", "medium", "high", "critical"],
    },

    status: {
        type: String,
        enum: ["draft", "submitted", "in_progress", "retest", "closed"],
        default: "draft"
    }

}, { timestamps: true });

module.exports = mongoose.model("Bug", bugSchema);