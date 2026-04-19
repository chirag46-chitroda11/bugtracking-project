const Notification = require("../models/notificationModel");

// GET notifications with role-based filtering
const getNotifications = async (req, res) => {
  try {
    const { role, userId, page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let filter = {};

    if (role === "admin") {
      // Admin sees everything
      filter = {};
    } else if (role && userId) {
      // Other roles: see notifications targeted to their role OR directly to them
      filter = {
        $or: [
          { targetRoles: role },
          { targetUserId: userId },
          // Legacy notifications without targetRoles (backward compat)
          { targetRoles: { $exists: false } },
          { targetRoles: { $size: 0 } }
        ]
      };
    } else if (userId) {
      filter = {
        $or: [
          { targetUserId: userId },
          { userId: userId }
        ]
      };
    }

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("targetUserId", "name email")
      .populate("userId", "name email");

    const total = await Notification.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// CREATE a notification
const createNotification = async (req, res) => {
  try {
    const { title, message, type, userId, targetRoles, targetUserId, referenceId } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: "Title and message are required"
      });
    }

    const notification = await Notification.create({
      title,
      message,
      type,
      userId,
      targetRoles: targetRoles || ["admin"],
      targetUserId,
      referenceId
    });

    // Emit socket event
    const io = req.app.get("io");
    if (io) {
      // Emit to target role rooms
      const roles = targetRoles || ["admin"];
      roles.forEach(role => {
        io.to(`role_${role}`).emit("new_notification", notification);
      });

      // Emit to specific user if targeted
      if (targetUserId) {
        io.to(`user_${targetUserId}`).emit("new_notification", notification);
      }
    }

    res.status(201).json({
      success: true,
      message: "Notification created",
      data: notification
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// MARK single notification as read
const markAsRead = async (req, res) => {
  try {
    const { userId } = req.query;
    const updateData = { isRead: true };

    // If userId provided, add to readBy array
    if (userId) {
      await Notification.findByIdAndUpdate(
        req.params.id,
        { 
          $set: { isRead: true },
          $addToSet: { readBy: userId }
        },
        { new: true }
      );
    }

    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: notification
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// MARK ALL notifications as read
const markAllAsRead = async (req, res) => {
  try {
    const { role, userId } = req.query;
    let filter = {};

    if (role === "admin") {
      filter = {};
    } else if (role && userId) {
      filter = {
        $or: [
          { targetRoles: role },
          { targetUserId: userId }
        ]
      };
    } else if (userId) {
      filter = { $or: [{ targetUserId: userId }, { userId: userId }] };
    }

    await Notification.updateMany(filter, { isRead: true });

    res.status(200).json({
      success: true,
      message: "All notifications marked as read"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// DELETE a notification
const deleteNotification = async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Notification deleted"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getNotifications,
  createNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification
};
