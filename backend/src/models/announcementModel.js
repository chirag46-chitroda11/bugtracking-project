const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  authorName: {
    type: String,
    required: true
  },
  authorRole: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium"
  }
}, { timestamps: true });

module.exports = mongoose.model("Announcement", announcementSchema);
