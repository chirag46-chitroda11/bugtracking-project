const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: [
        "bug_reported",
        "bug_assigned",
        "bug_resolved",
        "status_changed",
        "project_created",
        "project_updated",
        "module_created",
        "module_updated",
        "task_overdue",
        "task_created",
        "task_assigned",
        "task_updated",
        "sprint_created",
        "sprint_started",
        "sprint_completed",
        "user_registered",
        "high_severity_bug",
        "general"
      ],
      default: "general"
    },
    // Role-based targeting - which roles can see this notification
    targetRoles: {
      type: [String],
      enum: ["admin", "project_manager", "developer", "tester"],
      default: ["admin"]
    },
    // Specific user targeting (e.g., task assigned to a developer)
    targetUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    // Legacy field kept for backward compatibility
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId
    },
    isRead: {
      type: Boolean,
      default: false
    },
    // Track who has read it (for multi-role notifications)
    readBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }]
  },
  { timestamps: true }
);

// Index for efficient role-based queries
notificationSchema.index({ targetRoles: 1, createdAt: -1 });
notificationSchema.index({ targetUserId: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
