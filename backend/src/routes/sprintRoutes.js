const express = require("express");
const {
  createSprint,
  getAllSprints,
  getSprintById,
  updateSprint,
  deleteSprint,
  assignTaskToSprint
} = require("../controller/sprintController");

const router = express.Router();

router.post("/", createSprint);
router.get("/", getAllSprints);
router.get("/:id", getSprintById);
router.put("/:id", updateSprint);
router.delete("/:id", deleteSprint);
router.post("/assign-task", assignTaskToSprint);

module.exports = router;