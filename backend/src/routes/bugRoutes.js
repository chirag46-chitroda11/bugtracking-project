const express = require("express")

const router = express.Router()

const authMiddleware = require("../middleware/authMiddleware");

const { createBug, getAllBugs, getBugById, updateBugStatus, deleteBug, updateBug, addBugComment, getAdminDashboard, getManagerBugs, getOpenBugCount, getTesterBugs } = require("../controller/bugController")

router.post("/", authMiddleware, createBug)

router.get("/", getAllBugs)

// Static routes MUST come before /:id routes
router.get("/admin/dashboard", getAdminDashboard);
router.get("/manager/bugs", getManagerBugs);
router.get("/open-count", getOpenBugCount);
router.get("/my-bugs", authMiddleware, getTesterBugs);

router.get("/:id", getBugById)

router.put("/:id/status", authMiddleware, updateBugStatus)
router.put("/:id", authMiddleware, updateBug);
router.post("/:id/comments", authMiddleware, addBugComment);

router.delete("/:id", authMiddleware, deleteBug)

module.exports = router