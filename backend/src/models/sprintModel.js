const mongoose = require("mongoose");

const sprintSchema = new mongoose.Schema(
  {
    sprintName: {
      type: String,
      required: true
    },

    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true
    },
    sprintGoal: { type: String },
    capacityHours: { type: Number, default: 0 },
    priorityFocus: { type: String, enum: ["low", "medium", "high", "critical"], default: "medium" },
    includedModules: [{ type: mongoose.Schema.Types.ObjectId, ref: "Module" }],
    assignedDevelopers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    assignedTesters: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    notes: { type: String },

    startDate: {
      type: Date
    },

    endDate: {
      type: Date
    },

    tasks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task"
      }
    ],

    status: {
      type: String,
      default: "planned"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Sprint", sprintSchema);