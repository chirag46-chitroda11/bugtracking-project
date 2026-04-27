const express = require("express");
const router = express.Router();

const {
    submitReview,
    getApprovedReviews,
    getReviewStats,
    getAllReviews,
    approveReview,
    rejectReview,
    deleteReview
} = require("../controller/reviewController");

const authMiddleware = require("../middleware/authMiddleware");

// Public routes
router.post("/submit", submitReview);
router.get("/approved", getApprovedReviews);
router.get("/stats", getReviewStats);

// Admin routes (protected)
router.get("/all", authMiddleware, getAllReviews);
router.put("/approve/:id", authMiddleware, approveReview);
router.put("/reject/:id", authMiddleware, rejectReview);
router.delete("/:id", authMiddleware, deleteReview);

module.exports = router;
