const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const {
    getDashboardSummary,
    getDeveloperTasks,
    getDeveloperProjects,
    getDeveloperWorklogs,
    getDeveloperBugs,
    getDeveloperProjectsHierarchy
} = require("../controller/developerController");

router.use(authMiddleware);

router.get("/dashboard", getDashboardSummary);
router.get("/tasks", getDeveloperTasks);
router.get("/projects", getDeveloperProjects);
router.get("/projects-hierarchy", getDeveloperProjectsHierarchy);
router.get("/worklogs", getDeveloperWorklogs);
router.get("/bugs", getDeveloperBugs);

module.exports = router;
