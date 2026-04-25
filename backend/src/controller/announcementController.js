const Announcement = require("../models/announcementModel");
const ActivityLog = require("../models/activityLogModel");

const getAnnouncements = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const announcements = await Announcement.find()
      .populate("authorId", "name role profilePicture")
      .sort({ createdAt: -1 })
      .limit(limit);

    res.status(200).json({ success: true, data: announcements });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createAnnouncement = async (req, res) => {
  try {
    const { title, message, priority } = req.body;

    // Only Admin and PM can create announcements
    if (req.user.role !== "admin" && req.user.role !== "pm") {
      return res.status(403).json({ success: false, message: "Unauthorized to create announcements" });
    }

    const announcement = await Announcement.create({
      title,
      message,
      priority: priority || "medium",
      authorId: req.user.id || req.user._id,
      authorName: req.user.name || "Administrator",
      authorRole: req.user.role || "admin"
    });

    const populated = await Announcement.findById(announcement._id).populate("authorId", "name role profilePicture");

    // Log Activity
    const currentUserId = req.user.id || req.user._id;
    if (currentUserId) {
      await ActivityLog.create({
        userId: currentUserId,
        action: "announcement_added",
        entityType: "comment", // using comment enum for global texts
        entityId: announcement._id,
        title: announcement.title,
        description: `Published a global announcement: ${announcement.title}`,
        metadata: { priority: announcement.priority }
      });
    }

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteAnnouncement = async (req, res) => {
  try {
    // Only Admin and PM can delete
    if (req.user.role !== "admin" && req.user.role !== "pm") {
      return res.status(403).json({ success: false, message: "Unauthorized to delete announcements" });
    }

    const { id } = req.params;
    await Announcement.findByIdAndDelete(id);

    res.status(200).json({ success: true, message: "Announcement deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement
};
