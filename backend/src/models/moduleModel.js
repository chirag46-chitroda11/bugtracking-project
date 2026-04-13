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
      ref: "Project",   // ✅ FIX
      required: true
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"   // ✅ FIX
    },

    status: {
      type: String,
      enum: ["active", "completed"],
      default: "active"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Module", moduleSchema);