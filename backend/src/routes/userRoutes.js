const express = require("express")
const router = express.Router()

const { registerUser, loginUser, getAllUsers, getUserById, toggleUserStatus, deleteUser, updateUserProfile, approveUser, rejectUser, forgotPassword, resetPassword, changePassword, testEmail } = require("../controller/userController")
const authMiddleware = require("../middleware/authMiddleware")

router.post("/register", registerUser)
router.post("/login", loginUser)
router.post("/test-email", testEmail)

router.get("/users", authMiddleware, getAllUsers);
router.get("/users/:id", authMiddleware, getUserById);
router.put("/users/profile/:id", authMiddleware, updateUserProfile);
router.put("/users/toggle/:id", authMiddleware, toggleUserStatus);
router.delete("/users/:id", authMiddleware, deleteUser);

// New Approval Routes
router.put("/users/approve/:id", authMiddleware, approveUser);
router.put("/users/reject/:id", authMiddleware, rejectUser);

// Password Management Routes
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);
router.put("/change-password", authMiddleware, changePassword);

module.exports = router