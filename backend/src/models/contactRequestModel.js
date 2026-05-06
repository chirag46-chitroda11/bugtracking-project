const mongoose = require("mongoose");

const contactRequestSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    inquiryType: {
      type: String,
      required: true,
      enum: ["general", "bug_report", "feature_request", "partnership", "support"]
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ["new", "read", "replied"],
      default: "new"
    }
  },
  { timestamps: true }
);

// Indexes for performance
contactRequestSchema.index({ status: 1, createdAt: -1 });
contactRequestSchema.index({ email: 1 });

module.exports = mongoose.model("ContactRequest", contactRequestSchema);
