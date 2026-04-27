const Review = require("../models/reviewModel");

// PUBLIC — Submit a new review (unauthenticated)
const submitReview = async (req, res) => {
    try {
        const { name, role, company, rating, message, avatar } = req.body;

        if (!name || !rating || !message) {
            return res.status(400).json({
                success: false,
                message: "Name, rating, and message are required"
            });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: "Rating must be between 1 and 5"
            });
        }

        const review = await Review.create({
            name,
            role: role || "",
            company: company || "",
            rating,
            message,
            avatar: avatar || "",
            isApproved: false
        });

        return res.status(201).json({
            success: true,
            message: "Review submitted successfully! It will appear after admin approval.",
            data: review
        });
    } catch (error) {
        console.error("Submit review error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to submit review"
        });
    }
};

// PUBLIC — Get only approved reviews (for landing page)
const getApprovedReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ isApproved: true })
            .sort({ createdAt: -1 })
            .limit(20);

        return res.status(200).json({
            success: true,
            data: reviews
        });
    } catch (error) {
        console.error("Get approved reviews error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch reviews"
        });
    }
};

// PUBLIC — Get review stats (average rating + count)
const getReviewStats = async (req, res) => {
    try {
        const stats = await Review.aggregate([
            { $match: { isApproved: true } },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: "$rating" },
                    totalReviews: { $sum: 1 }
                }
            }
        ]);

        const result = stats.length > 0
            ? { averageRating: Math.round(stats[0].averageRating * 10) / 10, totalReviews: stats[0].totalReviews }
            : { averageRating: 0, totalReviews: 0 };

        return res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error("Get review stats error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch review stats"
        });
    }
};

// ADMIN (Auth) — Get all reviews for moderation
const getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.find().sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            data: reviews
        });
    } catch (error) {
        console.error("Get all reviews error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch reviews"
        });
    }
};

// ADMIN (Auth) — Approve a review
const approveReview = async (req, res) => {
    try {
        const review = await Review.findByIdAndUpdate(
            req.params.id,
            { isApproved: true },
            { new: true }
        );

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Review approved successfully",
            data: review
        });
    } catch (error) {
        console.error("Approve review error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to approve review"
        });
    }
};

// ADMIN (Auth) — Reject a review (set isApproved to false)
const rejectReview = async (req, res) => {
    try {
        const review = await Review.findByIdAndUpdate(
            req.params.id,
            { isApproved: false },
            { new: true }
        );

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Review rejected",
            data: review
        });
    } catch (error) {
        console.error("Reject review error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to reject review"
        });
    }
};

// ADMIN (Auth) — Delete a review permanently
const deleteReview = async (req, res) => {
    try {
        const review = await Review.findByIdAndDelete(req.params.id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Review deleted successfully"
        });
    } catch (error) {
        console.error("Delete review error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete review"
        });
    }
};

module.exports = {
    submitReview,
    getApprovedReviews,
    getReviewStats,
    getAllReviews,
    approveReview,
    rejectReview,
    deleteReview
};
