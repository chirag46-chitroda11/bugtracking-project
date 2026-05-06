const express = require("express");
const router = express.Router();
const {
  createContactRequest,
  getAllContactRequests,
  updateRequestStatus,
  deleteContactRequest
} = require("../controller/contactController");
const authMiddleware = require("../middleware/authMiddleware");

// Public route for form submission
router.post("/submit", createContactRequest);

// Protected routes (Admin only logic usually handled in controller or by adding role check)
router.get("/all", authMiddleware, getAllContactRequests);
router.patch("/status/:id", authMiddleware, updateRequestStatus);
router.delete("/:id", authMiddleware, deleteContactRequest);

module.exports = router;
