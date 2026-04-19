const Project = require("../models/projectModel")
const Module = require("../models/moduleModel")
const Task = require("../models/taskModel")
const { createAndEmitNotification } = require("../utils/notificationHelper")


const createProject = async (req, res) => {

  try {

    const { projectName, description, createdBy, projectCode, clientName, priority, budget, techStack, riskLevel, developers, testers } = req.body;
    if (!projectName || !description || !projectCode) {
      return res.status(400).json({
        success: false,
        message: "Project Name, Description, and Project Code are required"
      });
    }

    const project = await Project.create({
      projectName,
      description,
      createdBy,
      projectCode,
      clientName,
      priority,
      budget,
      techStack,
      riskLevel,
      developers,
      testers
    })

    // Notify about new project
    await createAndEmitNotification(req.app, {
      title: "New Project Created",
      message: `Project "${projectName}" has been created`,
      type: "project_created",
      targetRoles: ["admin", "project_manager"],
      referenceId: project._id
    });

    const ActivityLog = require("../models/activityLogModel");
    const currentUserId = req.user?.id || req.user?._id || createdBy;
    if (currentUserId) {
       await ActivityLog.create({
         userId: currentUserId,
         action: "status_changed", // or custom action name
         entityType: "project",
         entityId: project._id,
         title: project.projectName,
         description: `Initialized project sequence ${projectCode}`,
         metadata: { projectCode }
       });
    }

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: project
    })

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    })

  }

}

// get all projects
const getAllProject = async (req, res) => {
  try {
    const projects = await Project.find().populate({
      path: "createdBy developers testers",
      select: "name email role profilePicture"
    });

    const result = await Promise.all(
      projects.map(async (proj) => {

        const modules = await Module.countDocuments({
          projectId: proj._id
        });

        const tasks = await Task.countDocuments({
          projectId: proj._id
        });

        const completedTasks = await Task.countDocuments({
          projectId: proj._id,
          status: "done"
        });

        const progress =
          tasks === 0 ? 0 : Math.round((completedTasks / tasks) * 100);

        return {
          ...proj._doc,
          moduleCount: modules,
          taskCount: tasks,
          progress
        };
      })
    );

    res.status(200).json({
      success: true,
      message: "Projects fetched successfully",
      data: result
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// get project by id

const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("createdBy developers testers", "name email role profilePicture");
    res.status(200).json({
      success: true,
      data: project
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })

  }
}

// update project
const updateProject = async (req, res) => {

  try {

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )

    const ActivityLog = require("../models/activityLogModel");
    const currentUserId = req.user?.id || req.user?._id;
    if (currentUserId && project) {
       await ActivityLog.create({
         userId: currentUserId,
         action: "comment_added", // or just generalized to 'edit' or 'update'
         entityType: "project",
         entityId: project._id,
         title: project.projectName,
         description: `Modified project parameters`,
         metadata: {}
       });
    }

    res.status(200).json({
      success: true,
      message: "Project updated successfully",
      data: project
    })

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    })

  }

}

// delete project
const deleteProject = async (req, res) => {

  try {

    await Project.findByIdAndDelete(req.params.id)

    res.status(200).json({
      success: true,
      message: "Project deleted successfully"
    })

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    })

  }

}

module.exports = {
  createProject,
  getAllProject,
  getProjectById,
  updateProject,
  deleteProject
}
