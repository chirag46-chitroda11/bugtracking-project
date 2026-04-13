const Sprint = require("../models/sprintModel");

// CREATE
const createSprint = async (req, res) => {
  try {
    const { sprintName, projectId, startDate, endDate, status } = req.body;

    // ✅ VALIDATION
    if (!sprintName || !projectId) {
      return res.status(400).json({
        success: false,
        message: "Sprint name and project are required"
      });
    }

    // ✅ CREATE WITH STATUS INCLUDED
const sprint = new Sprint({
  sprintName,
  projectId,
  startDate,
  endDate,
  status: (status || "planned").toLowerCase()
});

    await sprint.save();

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

    const updated = await Sprint.findByIdAndUpdate(
      id,
      req.body,   // ✅ includes status
      { new: true }
    );

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
      { $push: { tasks: taskId } },
      { new: true }
    );

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