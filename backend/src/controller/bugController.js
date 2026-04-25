const Bug = require("../models/bugModel");
const { createAndEmitNotification } = require("../utils/notificationHelper");

// report bugs
const createBug = async (req, res) => {
  try {
    const { taskId, bugTitle, description, reportBy, reportById, assignedDeveloper, severity, bugImage, moduleId, priority, stepsToReproduce, expectedResult, actualResult, environment } = req.body;

    const bug = await Bug.create({
      taskId: taskId || null,
      bugTitle,
      description,
      bugImage,
      reportBy,
      reportById: reportById || null,
      assignedDeveloper,
      severity,
      moduleId,
      priority,
      stepsToReproduce,
      expectedResult,
      actualResult,
      environment,
      status: "open",
      activityLogs: [{
        message: "Bug drafted/reported",
        action: "created",
        userName: reportBy,
        date: new Date()
      }]
    });

    // Auto-create notification for bug reported
    await createAndEmitNotification(req.app, {
      title: "New Bug Reported",
      message: `Bug "${bugTitle}" reported with ${severity} severity`,
      type: "bug_reported",
      targetRoles: ["admin", "project_manager", "tester"],
      referenceId: bug._id
    });

    // Extra notification for high/critical severity
    if (severity === "critical" || severity === "high") {
      await createAndEmitNotification(req.app, {
        title: "⚠️ High Severity Bug Detected",
        message: `Critical attention needed: "${bugTitle}" - ${severity} severity`,
        type: "high_severity_bug",
        targetRoles: ["admin", "project_manager", "developer"],
        referenceId: bug._id
      });
    }

    // Notify assigned developer
    if (assignedDeveloper) {
      await createAndEmitNotification(req.app, {
        title: "Bug Assigned to You",
        message: `Bug "${bugTitle}" has been assigned to you`,
        type: "bug_assigned",
        targetRoles: ["developer"],
        targetUserId: assignedDeveloper,
        referenceId: bug._id
      });
    }

    const ActivityLog = require("../models/activityLogModel");
    const currentUserId = req.user?.id || req.user?._id || reportById;
    if (currentUserId) {
      await ActivityLog.create({
        userId: currentUserId,
        action: "bug_edited",
        entityType: "bug",
        entityId: bug._id,
        title: bug.bugTitle,
        description: `Reported new bug`,
        metadata: { severity }
      });
    }

    res.status(201).json({
      success: true,
      message: "Bug reported successfully",
      data: bug
    });

  } catch (error) {
    console.log("CREATE BUG ERROR:", error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// get all bugs 
const getAllBugs = async (req, res) => {
  try {
    const bugs = await Bug.find()
      .populate("taskId")
      .populate("assignedDeveloper", "name role email profilePicture")
      .populate("reportById", "name role email profilePicture")
      .populate("reviewComments.authorId", "name role email profilePicture");

    res.status(200).json({
      success: true,
      message: "Bug fetched successfully",
      data: bugs
    });

  } catch (error) {
    console.log("Populate ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// get bug by id 
const getBugById = async (req, res) => {
  try {
    const bug = await Bug.findById(req.params.id)
      .populate("taskId")
      .populate("assignedDeveloper", "name role email profilePicture")
      .populate("moduleId", "moduleName")
      .populate("reportById", "name role email profilePicture")
      .populate("reviewComments.authorId", "name role email profilePicture");

    res.status(200).json({
      success: true,
      data: bug
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// update bug status 
const updateBugStatus = async (req, res) => {
  try {
    const oldBug = await Bug.findById(req.params.id);
    const oldStatus = oldBug?.status;

    const bug = await Bug.findByIdAndUpdate(
      req.params.id,
      {
        status: req.body.status,
        $push: { activityLogs: { message: `Status changed to ${req.body.status}`, action: "status_update", userName: req.user?.name || "System", date: new Date() } }
      },
      { new: true }
    );

    const ActivityLog = require("../models/activityLogModel");
    const currentUserId = req.user?.id || req.user?._id;
    if (currentUserId && oldStatus !== req.body.status) {
      await ActivityLog.create({
        userId: currentUserId,
        action: "status_changed",
        entityType: "bug",
        entityId: bug._id,
        title: bug.bugTitle,
        description: `Changed bug status to ${req.body.status}`,
        metadata: { oldStatus, newStatus: req.body.status }
      });
    }

    // Create notification for status change
    await createAndEmitNotification(req.app, {
      title: "Bug Status Updated",
      message: `Bug "${bug.bugTitle}" moved from ${oldStatus} to ${req.body.status}`,
      type: "status_changed",
      targetRoles: ["admin", "project_manager", "tester", "developer"],
      referenceId: bug._id
    });

    // Specific notification conditions
    if (req.body.status === "resolved" || req.body.status === "retest") {
      await createAndEmitNotification(req.app, {
        title: "Bug Fix Verify Required",
        message: `Bug "${bug.bugTitle}" requires your retesting and verification`,
        type: "retest_required",
        targetRoles: ["tester"],
        referenceId: bug._id
      });
    }

    if (req.body.status === "reopened") {
      await createAndEmitNotification(req.app, {
        title: "Bug Reopened",
        message: `Bug "${bug.bugTitle}" has failed retesting and is reopened`,
        type: "bug_reopened",
        targetRoles: ["developer", "project_manager"],
        targetUserId: bug.assignedDeveloper,
        referenceId: bug._id
      });
    }

    if (req.body.status === "closed") {
      await createAndEmitNotification(req.app, {
        title: "Bug Closed",
        message: `Bug "${bug.bugTitle}" has been verified and closed`,
        type: "bug_resolved",
        targetRoles: ["admin", "project_manager", "developer"],
        referenceId: bug._id
      });
    }

    res.status(200).json({
      success: true,
      message: "Bug Status Updated",
      data: bug
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const updateBug = async (req, res) => {
  try {
    const { $push, ...updateFields } = req.body;

    let updateOp = { ...updateFields };

    // Handle $push for reviewComments (comment posting)
    if ($push && $push.reviewComments) {
      const comment = $push.reviewComments;
      const bug = await Bug.findByIdAndUpdate(
        req.params.id,
        {
          $set: updateFields,
          $push: { reviewComments: comment }
        },
        { new: true }
      )
        .populate("assignedDeveloper", "name role email profilePicture")
        .populate("moduleId", "moduleName")
        .populate("reportById", "name role email profilePicture")
        .populate("reviewComments.authorId", "name role email profilePicture");

      // Emit notification if status changed
      if (updateFields.status) {
        await createAndEmitNotification(req.app, {
          title: "Bug Status Updated",
          message: `Bug "${bug.bugTitle}" status changed to ${updateFields.status}`,
          type: "status_changed",
          targetRoles: ["admin", "project_manager", "developer"],
          referenceId: bug._id
        });
        if (updateFields.status === "reopened" && bug.assignedDeveloper) {
          await createAndEmitNotification(req.app, {
            title: "Bug Reopened",
            message: `Bug "${bug.bugTitle}" failed retest and was reopened`,
            type: "bug_reopened" in require("../models/notificationModel").schema.path("type").enumValues ? "bug_reopened" : "status_changed",
            targetRoles: ["developer"],
            targetUserId: bug.assignedDeveloper._id || bug.assignedDeveloper,
            referenceId: bug._id
          });
        }
      }

      return res.status(200).json({ success: true, data: bug });
    }

    // Standard field update (from EditBug form or status toggle from BugDetails)
    // editorName / editorRole are sent by frontend for activity log authorship
    const actorName = updateFields.editorName || req.user?.name || "User";
    const actorRole = updateFields.editorRole || req.user?.role || "tester";

    // Strip the editor meta fields — we don't want them saved as bug fields
    const { editorName: _en, editorRole: _er, ...fieldsToSet } = updateFields;

    // CORRECT Mongoose update: $set for field updates, $push for activity log array
    // Cannot mix plain field keys with $push — must use $set explicitly
    const mongoUpdate = {
      $set: fieldsToSet,
      $push: {
        activityLogs: {
          message: fieldsToSet.status
            ? `Status changed to "${fieldsToSet.status}"`
            : "Bug details edited",
          action: fieldsToSet.status ? "status_update" : "edit",
          userName: actorName,
          userRole: actorRole,
          date: new Date()
        }
      }
    };

    const bug = await Bug.findByIdAndUpdate(
      req.params.id,
      mongoUpdate,
      { new: true }
    )
      .populate("assignedDeveloper", "name role email profilePicture")
      .populate("moduleId", "moduleName")
      .populate("reportById", "name role email profilePicture")
      .populate("reviewComments.authorId", "name role email profilePicture");

    if (!bug) return res.status(404).json({ success: false, message: "Bug not found" });

    const ActivityLog = require("../models/activityLogModel");
    const currentUserId = req.user?.id || req.user?._id;
    if (currentUserId && Object.keys(fieldsToSet).length > 0) {
      await ActivityLog.create({
        userId: currentUserId,
        action: fieldsToSet.status ? "status_changed" : "bug_edited",
        entityType: "bug",
        entityId: bug._id,
        title: bug.bugTitle,
        description: fieldsToSet.status ? `Changed bug status to ${fieldsToSet.status}` : `Updated bug details`,
        metadata: fieldsToSet.status ? { newStatus: fieldsToSet.status } : {}
      });
    }

    // Notify on status change
    if (fieldsToSet.status) {
      await createAndEmitNotification(req.app, {
        title: "Bug Status Updated",
        message: `Bug "${bug.bugTitle}" status changed to ${fieldsToSet.status}`,
        type: "status_changed",
        targetRoles: ["admin", "project_manager", "developer", "tester"],
        referenceId: bug._id
      });
      if (fieldsToSet.status === "closed") {
        await createAndEmitNotification(req.app, {
          title: "Bug Closed ✅",
          message: `Bug "${bug.bugTitle}" has been verified and closed by tester`,
          type: "bug_resolved",
          targetRoles: ["admin", "project_manager", "developer"],
          referenceId: bug._id
        });
      }
      if (fieldsToSet.status === "reopened" && bug.assignedDeveloper) {
        await createAndEmitNotification(req.app, {
          title: "Bug Reopened",
          message: `Bug "${bug.bugTitle}" failed retest and was reopened`,
          type: "status_changed",
          targetRoles: ["developer"],
          targetUserId: bug.assignedDeveloper._id || bug.assignedDeveloper,
          referenceId: bug._id
        });
      }
    }

    res.status(200).json({ success: true, data: bug });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// delete bug 
const deleteBug = async (req, res) => {
  try {
    const bug = await Bug.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Bug deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ADMIN DASHBOARD DATA
const getAdminDashboard = async (req, res) => {
  try {
    const bugs = await Bug.find();

    const stats = {
      total: bugs.length,
      open: bugs.filter(b => b.status === "open" || b.status === "submitted" || b.status === "draft").length,
      in_progress: bugs.filter(b => b.status === "in_progress").length,
      resolved: bugs.filter(b => b.status === "resolved" || b.status === "retest").length,
      closed: bugs.filter(b => b.status === "closed").length,
    };

    res.json({ stats, bugs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const assignBugToDeveloper = async (req, res) => {
  try {
    const { bugId, developerId } = req.body;

    const bug = await Bug.findById(bugId);

    if (!bug) {
      return res.status(404).json({ message: "Bug not found" });
    }

    bug.assignedDeveloper = developerId;
    bug.status = "in_progress";

    await bug.save();

    // Notify the developer
    await createAndEmitNotification(req.app, {
      title: "Bug Assigned to You",
      message: `Bug "${bug.bugTitle}" has been assigned to you`,
      type: "bug_assigned",
      targetRoles: ["developer"],
      targetUserId: developerId,
      referenceId: bug._id
    });

    res.json({ message: "Bug Assigned Successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getManagerBugs = async (req, res) => {
  try {
    const bugs = await Bug.find({
      status: { $in: ["submitted", "open"] }
    })
      .populate("taskId")
      .populate("assignedDeveloper", "name role email profilePicture");

    res.status(200).json({
      success: true,
      message: "Manager bugs fetched",
      data: bugs
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// GET open bug count
const getOpenBugCount = async (req, res) => {
  try {
    const count = await Bug.countDocuments({
      status: { $in: ["open", "submitted", "draft"] }
    });

    res.status(200).json({
      success: true,
      count
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// GET bugs reported by the authenticated tester (tester-scoped)
const getTesterBugs = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized: no user ID in token" });
    }

    // Look up user to get name/email for legacy bug matching
    const User = require("../models/userModel");
    const currentUser = await User.findById(userId).select("name email");

    // Build query: match by reportById (ObjectId) OR legacy reportBy (name/email string)
    const orConditions = [{ reportById: userId }];
    if (currentUser?.name) orConditions.push({ reportBy: currentUser.name });
    if (currentUser?.email) orConditions.push({ reportBy: currentUser.email });

    const bugs = await Bug.find({ $or: orConditions })
      .populate("taskId")
      .populate("assignedDeveloper", "name role email profilePicture")
      .populate("reportById", "name role email profilePicture")
      .populate("moduleId", "moduleName")
      .populate("reviewComments.authorId", "name role email profilePicture")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Tester bugs fetched successfully",
      data: bugs
    });
  } catch (error) {
    console.log("GET TESTER BUGS ERROR:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add comment to bug (clean dedicated endpoint)
const addBugComment = async (req, res) => {
  try {
    const { comment, commenter, authorId, authorRole } = req.body;
    if (!comment || !comment.trim()) {
      return res.status(400).json({ success: false, message: "Comment text is required" });
    }

    const bug = await Bug.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          reviewComments: {
            authorId: authorId || req.user?.id || req.user?._id,
            authorRole: authorRole || req.user?.role,
            authorName: commenter || req.user?.name,
            commenter: commenter || "Tester",
            comment,
            date: new Date()
          },
          activityLogs: {
            message: "Added a review comment",
            action: "comment",
            userName: commenter || req.user?.name || "User",
            userRole: authorRole || req.user?.role,
            date: new Date()
          }
        }
      },
      { new: true }
    )
      .populate("assignedDeveloper", "name role email profilePicture")
      .populate("moduleId", "moduleName")
      .populate("reportById", "name role email profilePicture")
      .populate("reviewComments.authorId", "name role email profilePicture");

    const ActivityLog = require("../models/activityLogModel");
    const currentUserId = authorId || req.user?.id || req.user?._id;
    if (currentUserId) {
      await ActivityLog.create({
        userId: currentUserId,
        action: "comment_added",
        entityType: "bug",
        entityId: bug._id,
        title: bug.bugTitle,
        description: `Commented on Bug`,
        metadata: { commentText: comment }
      });
    }

    if (!bug) return res.status(404).json({ success: false, message: "Bug not found" });

    // Notify logic
    if (authorRole === "tester" && bug.assignedDeveloper) {
      // Tester alerts assigned developer
      await createAndEmitNotification(req.app, {
        title: "New Bug Comment",
        message: `${commenter || "Tester"} commented on bug "${bug.bugTitle}"`,
        type: "general",
        targetRoles: ["developer", "admin", "project_manager"],
        targetUserId: bug.assignedDeveloper._id || bug.assignedDeveloper,
        referenceId: bug._id
      });
    } else if (authorRole === "developer") {
      // Developer alerts admins/PMs/testers natively via roles
      await createAndEmitNotification(req.app, {
        title: "Developer Note Added",
        message: `${commenter || "Developer"} commented on bug "${bug.bugTitle}"`,
        type: "general",
        targetRoles: ["admin", "project_manager", "tester"],
        referenceId: bug._id
      });
    }

    res.status(201).json({ success: true, data: bug });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createBug,
  getAllBugs,
  getBugById,
  updateBugStatus,
  deleteBug,
  updateBug,
  addBugComment,
  getAdminDashboard,
  assignBugToDeveloper,
  getManagerBugs,
  getOpenBugCount,
  getTesterBugs
};