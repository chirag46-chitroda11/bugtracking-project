const ActivityLog = require("../models/activityLogModel");

// GET recent activity logs for PM dashboard feed
const getRecentActivity = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;

    const logs = await ActivityLog.find()
      .populate("userId", "name role profilePicture")
      .sort({ createdAt: -1 })
      .limit(limit);

    res.status(200).json({
      success: true,
      data: logs
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getRecentActivity };
