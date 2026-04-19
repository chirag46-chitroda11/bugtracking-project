const Notification = require("../models/notificationModel");

/**
 * Create a notification and emit it via Socket.io
 * Reusable helper used across all controllers
 */
const createAndEmitNotification = async (app, {
  title,
  message,
  type = "general",
  targetRoles = ["admin"],
  targetUserId = null,
  referenceId = null
}) => {
  try {
    const notification = await Notification.create({
      title,
      message,
      type,
      targetRoles,
      targetUserId,
      referenceId
    });

    const io = app.get("io");
    if (io) {
      // Emit to each target role room
      if (targetRoles && targetRoles.length > 0) {
        targetRoles.forEach(role => {
          io.to(`role_${role}`).emit("new_notification", notification);
        });
      }

      // Also emit to specific user if targeted
      if (targetUserId) {
        io.to(`user_${targetUserId}`).emit("new_notification", notification);
      }
    }

    return notification;
  } catch (error) {
    console.log("Notification helper error:", error.message);
    return null;
  }
};

module.exports = { createAndEmitNotification };
