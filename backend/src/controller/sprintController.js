const Sprint = require("../models/sprintModel");
const { createAndEmitNotification } = require("../utils/notificationHelper");

// CREATE
const createSprint = async (req, res) => {
  try {
    const { sprintName, projectId, startDate, endDate, status, sprintGoal, capacityHours, priorityFocus, includedModules, assignedDevelopers, assignedTesters, notes } = req.body;

    if (!sprintName || !projectId) {
      return res.status(400).json({
        success: false,
        message: "Sprint name and project are required"
      });
    }

    const sprint = new Sprint({
      sprintName,
      projectId,
      startDate,
      endDate,
      status: (status || "planned").toLowerCase(),
      sprintGoal, capacityHours, priorityFocus, includedModules, assignedDevelopers, assignedTesters, notes
    });

    await sprint.save();

    // Notify about new sprint
    await createAndEmitNotification(req.app, {
      title: "Sprint Created",
      message: `Sprint "${sprintName}" has been created`,
      type: "sprint_created",
      targetRoles: ["admin", "project_manager", "developer"],
      referenceId: sprint._id
    });

    const ActivityLog = require("../models/activityLogModel");
    const currentUserId = req.user?.id || req.user?._id;
    if (currentUserId) {
       await ActivityLog.create({
         userId: currentUserId,
         action: "status_changed", 
         entityType: "sprint",
         entityId: sprint._id,
         title: sprint.sprintName,
         description: `Began iteration sequence "${sprintName}"`,
         metadata: { status: sprint.status }
       });
    }

    res.status(201).json({
      success: true,
      data: sprint
    });

  } catch (error) {
    console.error("Create Sprint Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// GET ALL
const getAllSprints = async (req, res) => {
  try {
    const sprints = await Sprint.find()
      .populate("projectId", "projectName")
      .populate("assignedDevelopers assignedTesters", "name email role profilePicture")
      .populate("tasks");

    res.status(200).json({
      success: true,
      message: "Sprints fetched successfully",
      data: sprints
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// GET BY ID
const getSprintById = async (req, res) => {
  try {
    const sprint = await Sprint.findById(req.params.id)
      .populate("projectId", "projectName")
      .populate("assignedDevelopers assignedTesters", "name email role profilePicture")
      .populate("tasks");

    res.status(200).json({
      success: true,
      data: sprint
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// UPDATE
const updateSprint = async (req, res) => {
  try {
    const { id } = req.params;
    const oldSprint = await Sprint.findById(id);
    const oldStatus = oldSprint?.status;

    const updated = await Sprint.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );

    // Notify if sprint status changed
    if (req.body.status && req.body.status !== oldStatus) {
      if (req.body.status === "active") {
        await createAndEmitNotification(req.app, {
          title: "Sprint Started",
          message: `Sprint "${updated.sprintName}" is now active`,
          type: "sprint_started",
          targetRoles: ["admin", "project_manager", "developer"],
          referenceId: updated._id
        });
      } else if (req.body.status === "completed") {
        await createAndEmitNotification(req.app, {
          title: "Sprint Completed",
          message: `Sprint "${updated.sprintName}" has been completed`,
          type: "sprint_completed",
          targetRoles: ["admin", "project_manager", "developer", "tester"],
          referenceId: updated._id
        });
      }
    }

    res.json({
      success: true,
      data: updated
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Update failed" });
  }
};

// DELETE
const deleteSprint = async (req, res) => {
  try {
    const sprint = await Sprint.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Sprint deleted successfully",
      data: sprint
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const assignTaskToSprint = async (req, res) => {
  try {
    const { sprintId, taskId } = req.body;

    const sprint = await Sprint.findByIdAndUpdate(
      sprintId,
      { $addToSet: { tasks: taskId } },
      { new: true }
    ).populate("tasks");

    await createAndEmitNotification(req.app, {
      title: "Task Added to Sprint",
      message: `A task has been assigned to sprint "${sprint.sprintName}"`,
      type: "task_assigned",
      targetRoles: ["admin", "project_manager", "developer"],
      referenceId: sprint._id
    });

    res.status(200).json({
      success: true,
      message: "Task assigned to sprint",
      data: sprint
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


module.exports = {
  createSprint,
  getAllSprints,
  getSprintById,
  updateSprint,
  deleteSprint,
  assignTaskToSprint
};