const express = require("express");
const router = express.Router();

const {
  getNotifications,
  createNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification
} = require("../controller/notificationController");

// GET all notifications
router.get("/", getNotifications);

// CREATE notification
router.post("/", createNotification);

// MARK single as read
router.patch("/read/:id", markAsRead);

// MARK ALL as read
router.patch("/read-all", markAllAsRead);

// DELETE notification
router.delete("/:id", deleteNotification);

module.exports = router;
