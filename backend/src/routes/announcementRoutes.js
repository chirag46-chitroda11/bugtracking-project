const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { getAnnouncements, createAnnouncement, deleteAnnouncement } = require("../controller/announcementController");

// Mount routes
router.get("/", authMiddleware, getAnnouncements);
router.post("/", authMiddleware, createAnnouncement);
router.delete("/:id", authMiddleware, deleteAnnouncement);

module.exports = router;
