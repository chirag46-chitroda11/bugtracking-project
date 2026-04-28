const Task = require("../models/taskModel")
const ActivityLog = require("../models/activityLogModel")
const mongoose = require("mongoose");

// create task
const createTask = async (req, res) => {
  try {
    const {
      taskTitle,
      description,
      projectId,
      moduleId,
      assignedDeveloper,
      assignedTester,
      sprintId,
      estimatedHours,
      notes,
      status,
      priority,
      startDate,
      endDate
    } = req.body;

    // ✅ VALIDATION
    if (!taskTitle || !description || !projectId || !moduleId) {
      return res.status(400).json({
        success: false,
        message: "Task Title, Description, Project and Module are required"
      });
    }

    // ✅ GET CURRENT USER (ASSIGN BY)
    const assignBy = req.user?.id || req.user?._id;

    const task = await Task.create({
      taskTitle,
      description,
      projectId,
      moduleId,
      assignedDeveloper: assignedDeveloper || null,
      assignedTester: assignedTester || null,
      sprintId: sprintId || null,
      estimatedHours: estimatedHours ? parseFloat(estimatedHours) : 0,
      notes: notes || "",
      assignBy,
      status: status || "pending",
      priority: priority || "medium",
      startDate: startDate || null,
      endDate: endDate || null
    });

    // Log task creation
    if (assignBy) {
      await ActivityLog.create({
        userId: assignBy,
        action: "task_created",
        entityType: "task",
        entityId: task._id,
        title: task.taskTitle,
        description: `Task "${task.taskTitle}" created${assignedDeveloper ? ' and assigned to developer' : ''}`,
        metadata: { projectId, assignedDeveloper }
      });
    }

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: task
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// get all tasks
const getAllTasks = async (req, res) => {

  try {

    const tasks = await Task.find()
      .populate("projectId")
      .populate("moduleId")
      .populate("assignedDeveloper")

    res.status(200).json({
      success: true,
      message: "Tasks fetched successfully",
      data: tasks
    })

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    })

  }

}


// get task by id
const getTaskById = async (req, res) => {

  try {

    const task = await Task.findById(req.params.id)
      .populate({
        path: "projectId",
        select: "projectName description status createdBy startDate endDate",
        populate: { path: "createdBy", select: "name role email profilePicture" }
      })
      .populate("moduleId", "moduleName")
      .populate("assignedDeveloper", "name role email profilePicture")
      .populate("assignedTester", "name role email profilePicture")
      .populate("assignBy", "name role email profilePicture");

    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    // Fetch activity logs for this task
    const activityLogs = await ActivityLog.find({ entityId: req.params.id, entityType: "task" })
      .populate("userId", "name role profilePicture")
      .sort({ createdAt: -1 })
      .limit(30);

    // Fetch worklogs for this task
    const TimeLog = require("../models/timelogModel");
    const worklogs = await TimeLog.find({ taskId: req.params.id })
      .sort({ createdAt: -1 })
      .limit(10);

    const totalLogged = worklogs.reduce((sum, l) => sum + (l.hoursWorked || 0), 0);

    res.status(200).json({
      success: true,
      data: task,
      activityLogs,
      worklogs,
      totalLoggedHours: totalLogged
    })

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    })

  }

}


// update task
const updateTask = async (req, res) => {

  try {

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Task ID format"
      });
    }

    const oldTask = await Task.findById(id);
    if (!oldTask) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    const task = await Task.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    )

    const currentUserId = req.user?.id || req.user?._id;

    // Log activity for status changes
    if (req.body.status && (!oldTask || oldTask.status !== req.body.status)) {
      const Notification = require("../models/notificationModel");
      if (req.body.status === "testing") {
        await Notification.create({
          title: "Task Ready For QA",
          message: `Task ${task.taskTitle} requires testing verification.`,
          type: "status_changed",
          targetRoles: ["tester", "project_manager"],
          referenceId: task._id
        });
      }

      // Create activity log for status change
      if (currentUserId) {
        const statusLabels = {
          "pending": "Todo",
          "in progress": "In Progress",
          "testing": "Ready for QA",
          "completed": "Completed"
        };
        await ActivityLog.create({
          userId: currentUserId,
          action: "status_changed",
          entityType: "task",
          entityId: task._id,
          title: task.taskTitle,
          description: `Changed status from "${statusLabels[oldTask?.status] || oldTask?.status || 'N/A'}" to "${statusLabels[req.body.status] || req.body.status}"`,
          metadata: { oldStatus: oldTask?.status, newStatus: req.body.status }
        });
      }
    }

    // Log activity for time tracking
    if (req.body.timeSpent !== undefined && (!oldTask || oldTask.timeSpent !== req.body.timeSpent)) {
      if (currentUserId) {
        const delta = ((req.body.timeSpent || 0) - (oldTask?.timeSpent || 0)) / 3600;
        await ActivityLog.create({
          userId: currentUserId,
          action: "time_logged",
          entityType: "task",
          entityId: task._id,
          title: task.taskTitle,
          description: `Logged ${delta.toFixed(2)} hours of work`,
          metadata: { oldTimeSpent: oldTask?.timeSpent, newTimeSpent: req.body.timeSpent }
        });
      }
    }

    // Log activity for tester assignment
    if (req.body.assignedTester && (!oldTask || !oldTask.assignedTester || String(oldTask.assignedTester) !== String(req.body.assignedTester))) {
      const Notification = require("../models/notificationModel");
      await Notification.create({
        title: "Assigned QA Task",
        message: `You have been assigned to test: ${task.taskTitle}`,
        type: "task_assigned",
        targetRoles: ["tester"],
        targetUserId: req.body.assignedTester,
        referenceId: task._id
      });

      if (currentUserId) {
        await ActivityLog.create({
          userId: currentUserId,
          action: "tester_assigned",
          entityType: "task",
          entityId: task._id,
          title: task.taskTitle,
          description: `Assigned a QA tester for review`,
          metadata: { testerId: req.body.assignedTester }
        });
      }
    }

    // Log developer reassignment by PM
    if (req.body.assignedDeveloper && oldTask && String(oldTask.assignedDeveloper) !== String(req.body.assignedDeveloper)) {
      if (currentUserId) {
        await ActivityLog.create({
          userId: currentUserId,
          action: "task_reassigned",
          entityType: "task",
          entityId: task._id,
          title: task.taskTitle,
          description: `Task reassigned to a new developer`,
          metadata: { oldDev: oldTask.assignedDeveloper, newDev: req.body.assignedDeveloper }
        });
      }
    }

    // Log general task edit by PM
    if (currentUserId && !req.body.status && !req.body.timeSpent && !req.body.assignedTester && !req.body.assignedDeveloper) {
      await ActivityLog.create({
        userId: currentUserId,
        action: "task_edited",
        entityType: "task",
        entityId: task._id,
        title: task.taskTitle,
        description: `Task details updated`,
        metadata: {}
      });
    }

    res.status(200).json({
      success: true,
      message: "Task updated successfully",
      data: task
    })

  } catch (error) {
    console.error("Task Update Error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }

}


// delete task
const deleteTask = async (req, res) => {

  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    const currentUserId = req.user?.id || req.user?._id;
    if (currentUserId) {
      await ActivityLog.create({
        userId: currentUserId,
        action: "task_deleted",
        entityType: "task",
        entityId: task._id,
        title: task.taskTitle,
        description: `Task "${task.taskTitle}" was deleted`,
        metadata: { projectId: task.projectId }
      });
    }

    await Task.findByIdAndDelete(req.params.id);

    // 🧹 CASCADE CLEANUP: Remove orphan records linked to this task
    const TimeLog = require("../models/timelogModel");
    const Comment = require("../models/commentModel");
    const Bug = require("../models/bugModel");

    await Promise.all([
      TimeLog.deleteMany({ taskId: task._id }),
      Comment.deleteMany({ taskId: task._id }),
      Bug.updateMany({ taskId: task._id }, { $unset: { taskId: "" } })
    ]);

    res.status(200).json({
      success: true,
      message: "Task deleted successfully and related records cleaned"
    })

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    })

  }

}

// GET tasks for tester QA pipeline (auth-protected, scoped to testing-relevant tasks)
const getTesterTasks = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized: no user ID in token" });
    }

    // Testers see tasks that are in testing/completed/in-progress phases for QA
    const tasks = await Task.find({
      status: { $in: ["testing", "completed", "in progress"] }
    })
      .populate("projectId")
      .populate("moduleId")
      .populate("assignedDeveloper", "name role email profilePicture")
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      message: "Tester tasks fetched successfully",
      data: tasks
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const Comment = require("../models/commentModel")

// get comments by task
const getCommentsByTask = async (req, res) => {
  try {
    const comments = await Comment.find({ taskId: req.params.id }).populate("userId", "name role profilePicture").sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: comments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// add comment to task
const addCommentToTask = async (req, res) => {
  try {
    const { text } = req.body;
    const userId = req.user.id || req.user._id; // Fixed: JWT payload has req.user.id
    const taskId = req.params.id;

    if (!text) {
      return res.status(400).json({ success: false, message: "Comment text is required" });
    }

    const comment = await Comment.create({ taskId, userId, text });
    const populatedComment = await Comment.findById(comment._id).populate("userId", "name role profilePicture");

    // Create activity log for comment
    const taskForLog = await Task.findById(taskId);
    if (taskForLog) {
      await ActivityLog.create({
        userId,
        action: "comment_added",
        entityType: "task",
        entityId: taskId,
        title: taskForLog.taskTitle,
        description: `Added a comment`,
        metadata: { commentText: text.substring(0, 100) }
      });
    }

    res.status(201).json({ success: true, data: populatedComment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}


module.exports = {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getCommentsByTask,
  addCommentToTask,
  getTesterTasks
}