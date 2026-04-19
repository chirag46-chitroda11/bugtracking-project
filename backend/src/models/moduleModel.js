const mongoose = require("mongoose");

const moduleSchema = new mongoose.Schema(
  {
    moduleName: {
      type: String,
      required: true
    },

    description: {
      type: String,
      required: true
    },

    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    status: {
      type: String,
      enum: ["active", "completed", "on_hold", "archived"],
      default: "active"
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium"
    },

    dueDate: {
      type: Date
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Module", moduleSchema);