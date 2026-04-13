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