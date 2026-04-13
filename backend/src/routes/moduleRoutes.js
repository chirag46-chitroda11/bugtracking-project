const express = require("express");
const router = express.Router();

const {
  createModule,
  getAllModule,
  getModuleById,
  updateModule,
  deleteModule,
  getModulesByProject
} = require("../controller/moduleController");

// CREATE MODULE
router.post("/", createModule);

// GET ALL MODULES
router.get("/", getAllModule);

// GET MODULE BY ID
router.get("/:id", getModuleById);

// UPDATE MODULE
router.put("/:id", updateModule);

// DELETE MODULE
router.delete("/:id", deleteModule);

router.get("/project/:projectId", getModulesByProject);

module.exports = router;