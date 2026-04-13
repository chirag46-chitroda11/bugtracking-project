const Module = require("../models/moduleModel");

// CREATE
const createModule = async (req, res) => {
  try {
    const { moduleName, projectId, description, createdBy } = req.body;

    // ✅ VALIDATION (correct place)
    if (!moduleName || !projectId || !description) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    const module = await Module.create({
      moduleName,
      projectId,
      description,
      createdBy
    });

    res.status(201).json({
      success: true,
      message: "Module created successfully",
      data: module
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// GET ALL
const getAllModule = async (req, res) => {
  try {
    const modules = await Module.find()
      .populate("projectId", "projectName")
      .populate("createdBy", "name email");

    res.status(200).json({
      success: true,
      message: "Modules fetched successfully",
      data: modules   // ✅ FIX
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// GET BY ID
const getModuleById = async (req, res) => {
  try {
    const module = await Module.findById(req.params.id)
      .populate("projectId", "projectName")
      .populate("createdBy", "name email");

    res.status(200).json({
      success: true,
      data: module
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// UPDATE
const updateModule = async (req, res) => {
  try {
    const module = await Module.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Module updated successfully",
      data: module
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// DELETE
const deleteModule = async (req, res) => {
  try {
    const module = await Module.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Module deleted successfully",
      data: module
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
const getModulesByProject = async (req, res) => {
  try {
    const modules = await Module.find({
      projectId: req.params.projectId
    })
    .populate("createdBy", "name");

    res.status(200).json({
      success: true,
      data: modules
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createModule,
  getAllModule,
  getModuleById,
  updateModule,
  deleteModule,
  getModulesByProject
};