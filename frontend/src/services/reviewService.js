import API from "../api/axios";

// Public — Submit a review
export const submitReview = (data) => {
    return API.post("/review/submit", data);
};

// Public — Get approved reviews for landing page
export const getApprovedReviews = () => {
    return API.get("/review/approved");
};

// Public — Get review stats (average rating + count)
export const getReviewStats = () => {
    return API.get("/review/stats");
};

// Admin — Get all reviews for moderation
export const getAllReviews = () => {
    return API.get("/review/all");
};

// Admin — Approve a review
export const approveReview = (id) => {
    return API.put(`/review/approve/${id}`);
};

// Admin — Reject a review
export const rejectReview = (id) => {
    return API.put(`/review/reject/${id}`);
};

// Admin — Delete a review
export const deleteReview = (id) => {
    return API.delete(`/review/${id}`);
};
