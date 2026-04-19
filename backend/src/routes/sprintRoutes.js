const express = require("express");
const {
  createSprint,
  getAllSprints,
  getSprintById,
  updateSprint,
  deleteSprint,
  assignTaskToSprint
} = require("../controller/sprintController");

const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/", authMiddleware, createSprint);
router.get("/", getAllSprints);
router.get("/:id", getSprintById);
router.put("/:id", authMiddleware, updateSprint);
router.delete("/:id", authMiddleware, deleteSprint);
router.post("/assign-task", authMiddleware, assignTaskToSprint);

module.exports = router;