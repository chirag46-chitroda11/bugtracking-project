const User = require("../models/userModel")
const uploadToCloudinary = require("../utils/CloudinaryUtil")
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("../services/mailService");
const { createAndEmitNotification } = require("../utils/notificationHelper");
const ActivityLog = require("../models/activityLogModel");
const crypto = require("crypto");
const { 
  welcomeEmail, 
  approvalEmail, 
  rejectionEmail, 
  resetPasswordEmail,
  pendingEmail,
  deletedEmail
} = require("../utils/emailTemplates");

// ================= ROLE HIERARCHY =================
const ROLE_HIERARCHY = { admin: 4, project_manager: 3, developer: 2, tester: 1 };
const getRoleLevel = (role) => ROLE_HIERARCHY[role] || 0;

// ================= REGISTER USER =================
const registerUser = async (req, res) => {
  try {
    let { name, email, password, role, designation } = req.body;

    let isPublic = true;
    let creatorRole = null;

    if (req.headers.authorization) {
      try {
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        creatorRole = decoded.role;
        if (creatorRole === "admin" || creatorRole === "project_manager") {
          isPublic = false;
        }
      } catch (err) { }
    }

    // Public registration always defaults to tester role
    if (isPublic) {
      role = "tester";
    } else {
      // Role hierarchy enforcement
      if (creatorRole === "project_manager") {
        if (role === "admin" || role === "project_manager") {
          return res.status(403).json({ message: "Project Managers can only create developers and testers." });
        }
      }
    }

    // Validate required fields
    if (!name || !email || !password) {
      const missing = [];
      if (!name) missing.push("name");
      if (!email) missing.push("email");
      if (!password) missing.push("password");
      return res.status(400).json({
        message: `Required fields missing: ${missing.join(", ")}`
      });
    }

    if (!role) {
      return res.status(400).json({
        message: "Role is required"
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered"
      });
    }

    let imageUrl = "";
    if (req.file) {
      try {
        const cloudinaryResponse = await uploadToCloudinary(req.file.path);
        imageUrl = cloudinaryResponse.secure_url;
      } catch (cloudErr) {
        console.error("Cloudinary Upload Error (Non-blocking):", cloudErr.message);
      }
    }

    // ✅ HASH PASSWORD
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ DETERMINE STATUS: Admin creates active users, everyone else (Public/PM) creates pending
    const initialStatus = (creatorRole === "admin") ? "active" : "pending";

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      designation,
      status: initialStatus,
      profilePicture: imageUrl
    });

    // ================= 📧 EMAIL FUNCTIONALITY ADDED (NON-BLOCKING) =================
    // Removed await to prevent blocking the registration response
    (async () => {
      try {
        const html = (initialStatus === "active") ? welcomeEmail(name) : pendingEmail(name);
        const subject = (initialStatus === "active") 
          ? "Welcome to the Future of Bug Tracking — Fixify 🔥" 
          : "Registration Received — Verification Pending 📨";
        const emailResult = await sendEmail({ to: email, subject, html });
        
        await ActivityLog.create({
          userId: user._id, // Use new user ID
          action: emailResult.success ? "email_sent" : "email_failed",
          entityType: "email",
          entityId: user._id,
          title: emailResult.success ? `Email Sent: Registration` : `Email Failed: Registration`,
          description: emailResult.success ? `Successfully sent to ${email}` : `Failed to send to ${email}. Error: ${emailResult.error || "Unknown"}`,
        });
      } catch (emailErr) {
        console.error("Registration Email Error (Non-blocking):", emailErr.message);
      }
    })();
    // ===============================================================

    // Create notification for new user (Non-blocking)
    try {
      await createAndEmitNotification(req.app, {
        title: "New User Registered",
        message: `${name} (${role.replace('_', ' ')}) has joined the system`,
        type: "user_registered",
        targetRoles: ["admin", "project_manager"],
        referenceId: user._id
      });
    } catch (notifErr) {
      console.error("Notification Error (Non-blocking):", notifErr.message);
    }

    res.status(201).json({
      message: "User created successfully",
      data: user
    })

  } catch (error) {
    console.error("REGISTER ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message
    });
  }
}


// ================= LOGIN USER =================
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password required"
      })
    }

    const user = await User.findOne({ email })

    if (!user) {
      return res.status(400).json({
        message: "User not found"
      })
    }

    // ✅ SAFETY CHECK
    if (!user.password) {
      return res.status(400).json({
        message: "Password missing in DB"
      });
    }

    // ✅ PASSWORD MATCH
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid password"
      })
    }

    // ✅ JWT TOKEN (ENV BASED)
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role, status: user.status },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // ✅ REMOVE PASSWORD FROM RESPONSE
    const { password: _, ...safeUser } = user.toObject();

    res.status(200).json({
      message: "Login success",
      token,
      data: safeUser
    });

  } catch (err) {
    console.log("LOGIN ERROR:", err)

    res.status(500).json({
      message: "Error in login",
      error: err.message
    })
  }
}

// ================GET ALL USERS (ADMIN ONLY)===================
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password"); // 🔥 remove password

    res.json({
      success: true,
      data: users
    });

  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
};

// ====================BLOCK / UNBLOCK USER (ADMIN ONLY )==
const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🔒 Role hierarchy check — cannot toggle users with same or higher role
    if (req.user && getRoleLevel(user.role) >= getRoleLevel(req.user.role)) {
      return res.status(403).json({ message: "You cannot modify a user with equal or higher role" });
    }

    // 🔥 toggle logic
    const newStatus = user.status === "blocked" ? "active" : "blocked";

    user.status = newStatus;
    await user.save();

    res.json({
      success: true,
      message: `User ${newStatus}`,
      data: user
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//================= DELETE USER (SELF or ADMIN) ======
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isSelfDelete = req.user && req.user.id === req.params.id;

    // 🔒 Role hierarchy check — skip if user is deleting their own account
    if (!isSelfDelete && req.user && getRoleLevel(user.role) >= getRoleLevel(req.user.role)) {
      return res.status(403).json({ message: "You cannot delete a user with equal or higher role" });
    }

    // 🧹 Clean up related data from all collections
    const Task = require("../models/taskModel");
    const Bug = require("../models/bugModel");
    const TimeLog = require("../models/timelogModel");
    const Notification = require("../models/notificationModel");
    const ActivityLog = require("../models/activityLogModel");

    const userId = req.params.id;
    const deletedRole = user.role;

    // ═══ REASSIGNMENT LOGIC ═══
    // Find another active user with the same role to reassign work to
    const findReplacement = async (role) => {
      const candidates = await User.find({
        _id: { $ne: userId },
        role: role,
        status: { $in: ["active", "approved"] }
      }).select("_id").lean();

      if (candidates.length === 0) return null;

      // Pick the one with fewest task assignments (load balancing)
      let bestCandidate = candidates[0]._id;
      let minCount = Infinity;

      for (const c of candidates) {
        const taskCount = await Task.countDocuments({
          $or: [
            { assignedDeveloper: c._id },
            { assignedTester: c._id }
          ]
        });
        if (taskCount < minCount) {
          minCount = taskCount;
          bestCandidate = c._id;
        }
      }

      return bestCandidate;
    };

    // Reassign developer tasks & bugs
    if (deletedRole === "developer") {
      const replacement = await findReplacement("developer");
      if (replacement) {
        await Task.updateMany(
          { assignedDeveloper: userId },
          { $set: { assignedDeveloper: replacement } }
        );
        await Bug.updateMany(
          { assignedDeveloper: userId },
          { $set: { assignedDeveloper: replacement } }
        );
      } else {
        // No other developer available — unassign
        await Task.updateMany(
          { assignedDeveloper: userId },
          { $unset: { assignedDeveloper: "" } }
        );
        await Bug.updateMany(
          { assignedDeveloper: userId },
          { $unset: { assignedDeveloper: "" } }
        );
      }
    }

    // Reassign tester tasks & bugs
    if (deletedRole === "tester") {
      const replacement = await findReplacement("tester");
      if (replacement) {
        await Task.updateMany(
          { assignedTester: userId },
          { $set: { assignedTester: replacement } }
        );
        await Bug.updateMany(
          { qaTesterId: userId },
          { $set: { qaTesterId: replacement } }
        );
      } else {
        // No other tester available — unassign
        await Task.updateMany(
          { assignedTester: userId },
          { $unset: { assignedTester: "" } }
        );
        await Bug.updateMany(
          { qaTesterId: userId },
          { $unset: { qaTesterId: "" } }
        );
      }
    }

    // For project managers — reassign their "assignBy" references
    if (deletedRole === "project_manager") {
      const replacement = await findReplacement("project_manager");
      if (replacement) {
        await Task.updateMany(
          { assignBy: userId },
          { $set: { assignBy: replacement } }
        );
        await Bug.updateMany(
          { assignedBy: userId },
          { $set: { assignedBy: replacement } }
        );
      } else {
        await Task.updateMany(
          { assignBy: userId },
          { $unset: { assignBy: "" } }
        );
        await Bug.updateMany(
          { assignedBy: userId },
          { $unset: { assignedBy: "" } }
        );
      }
    }

    // For any role — handle cross-role assignments
    // (e.g. a developer who was also assigned as tester somewhere, or vice versa)
    const devTaskCount = await Task.countDocuments({ assignedDeveloper: userId });
    if (devTaskCount > 0) {
      const devReplacement = await findReplacement("developer");
      if (devReplacement) {
        await Task.updateMany({ assignedDeveloper: userId }, { $set: { assignedDeveloper: devReplacement } });
      } else {
        await Task.updateMany({ assignedDeveloper: userId }, { $unset: { assignedDeveloper: "" } });
      }
    }

    const testerTaskCount = await Task.countDocuments({ assignedTester: userId });
    if (testerTaskCount > 0) {
      const testerReplacement = await findReplacement("tester");
      if (testerReplacement) {
        await Task.updateMany({ assignedTester: userId }, { $set: { assignedTester: testerReplacement } });
      } else {
        await Task.updateMany({ assignedTester: userId }, { $unset: { assignedTester: "" } });
      }
    }

    // Bug reportById — clear this (reporter is historical, don't reassign)
    await Bug.updateMany(
      { reportById: userId },
      { $unset: { reportById: "" } }
    );

    // Remaining bug developer assignments
    const devBugCount = await Bug.countDocuments({ assignedDeveloper: userId });
    if (devBugCount > 0) {
      const devReplacement = await findReplacement("developer");
      if (devReplacement) {
        await Bug.updateMany({ assignedDeveloper: userId }, { $set: { assignedDeveloper: devReplacement } });
      } else {
        await Bug.updateMany({ assignedDeveloper: userId }, { $unset: { assignedDeveloper: "" } });
      }
    }

    const qaBugCount = await Bug.countDocuments({ qaTesterId: userId });
    if (qaBugCount > 0) {
      const testerReplacement = await findReplacement("tester");
      if (testerReplacement) {
        await Bug.updateMany({ qaTesterId: userId }, { $set: { qaTesterId: testerReplacement } });
      } else {
        await Bug.updateMany({ qaTesterId: userId }, { $unset: { qaTesterId: "" } });
      }
    }

    // Delete user's time logs
    await TimeLog.deleteMany({ developerId: userId });

    // Delete user's notifications
    await Notification.deleteMany({
      $or: [{ targetUserId: userId }, { userId: userId }]
    });

    // Delete user's activity logs
    await ActivityLog.deleteMany({ userId: userId });

    // Send Deletion Email (Non-blocking)
    (async () => {
      try {
        const html = deletedEmail(user.name);
        const emailResult = await sendEmail({ to: user.email, subject: "Account Removed - Fixify", html });
        
        await ActivityLog.create({
          userId: req.user ? req.user.id : user._id,
          action: emailResult.success ? "email_sent" : "email_failed",
          entityType: "email",
          entityId: user._id,
          title: emailResult.success ? `Email Sent: Account Removed` : `Email Failed: Account Removed`,
          description: emailResult.success ? `Successfully sent to ${user.email}` : `Failed to send to ${user.email}. Error: ${emailResult.error || "Unknown"}`,
        });
      } catch (emailErr) {
        console.error("Deletion Email Error (Non-blocking):", emailErr.message);
      }
    })();

    // Finally delete the user
    await User.findByIdAndDelete(userId);

    res.json({
      success: true,
      message: "User deleted. Tasks and bugs reassigned to available team members."
    });

  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
};

//====================GET SINGLE USER (ADMIN ONLY )======
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password");

    res.json({
      success: true,
      data: user
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ==================== UPDATE USER PROFILE ====================
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🔒 Role hierarchy check — cannot edit users with same or higher role (unless editing self)
    if (req.user && req.user.id !== req.params.id && getRoleLevel(user.role) >= getRoleLevel(req.user.role)) {
      return res.status(403).json({ message: "You cannot edit a user with equal or higher role" });
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.country = req.body.country !== undefined ? req.body.country : user.country;
    user.state = req.body.state !== undefined ? req.body.state : user.state;
    user.city = req.body.city !== undefined ? req.body.city : user.city;
    if (req.body.profilePicture) {
      user.profilePicture = req.body.profilePicture;
    }

    const updatedUser = await user.save();

    const { password: _, ...safeUser } = updatedUser.toObject();

    res.json({
      success: true,
      data: safeUser
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== APPROVE USER (ADMIN / PM ONLY) ====================
const approveUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.status = "approved";
    user.approvedBy = req.user.id;
    user.approvedAt = new Date();
    await user.save();

    // Send Approval Email (Non-blocking)
    (async () => {
      try {
        const html = approvalEmail(user.name);
        const emailResult = await sendEmail({ to: user.email, subject: "Your Fixify Account is Approved 🎉", html });
        
        await ActivityLog.create({
          userId: req.user ? req.user.id : user._id,
          action: emailResult.success ? "email_sent" : "email_failed",
          entityType: "email",
          entityId: user._id,
          title: emailResult.success ? `Email Sent: Account Approved` : `Email Failed: Account Approved`,
          description: emailResult.success ? `Successfully sent to ${user.email}` : `Failed to send to ${user.email}. Error: ${emailResult.error || "Unknown"}`,
        });
      } catch (emailErr) {
        console.error("Approval Email Error (Non-blocking):", emailErr.message);
      }
    })();

    res.json({
      success: true,
      message: "User approved successfully",
      data: user
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== REJECT USER (ADMIN / PM ONLY) ====================
const rejectUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Send Rejection Email before deleting (Non-blocking)
    (async () => {
      try {
        const html = rejectionEmail(user.name);
        const emailResult = await sendEmail({ to: user.email, subject: "Your Fixify Registration Request Was Declined", html });
        
        await ActivityLog.create({
          userId: req.user ? req.user.id : user._id,
          action: emailResult.success ? "email_sent" : "email_failed",
          entityType: "email",
          entityId: user._id,
          title: emailResult.success ? `Email Sent: Account Rejected` : `Email Failed: Account Rejected`,
          description: emailResult.success ? `Successfully sent to ${user.email}` : `Failed to send to ${user.email}. Error: ${emailResult.error || "Unknown"}`,
        });
      } catch (emailErr) {
        console.log("Rejection email failed (non-blocking):", emailErr.message);
      }
    })();

    // Clean up related data
    const Notification = require("../models/notificationModel");
    await Notification.deleteMany({
      $or: [{ targetUserId: user._id }, { userId: user._id }, { referenceId: user._id }]
    });

    // Delete the user permanently from DB
    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "User rejected and removed from system"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== FORGOT PASSWORD ====================
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({ message: "If account exists, reset link sent" });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
    await user.save();

    const FRONTEND_URL = process.env.FRONTEND_URL || "https://fixify46.vercel.app";
    const resetUrl = `${FRONTEND_URL}/reset-password/${resetToken}`;

    const html = resetPasswordEmail(user.name, resetUrl);

    try {
      const emailResult = await sendEmail({ to: user.email, subject: "Password Reset Request - Fixify", html });
      
      await ActivityLog.create({
        userId: user._id,
        action: emailResult.success ? "email_sent" : "email_failed",
        entityType: "email",
        entityId: user._id,
        title: emailResult.success ? `Email Sent: Password Reset` : `Email Failed: Password Reset`,
        description: emailResult.success ? `Successfully sent to ${user.email}` : `Failed to send to ${user.email}. Error: ${emailResult.error || "Unknown"}`,
      });

      if (!emailResult.success) {
         throw new Error("Email could not be sent");
      }
      res.status(200).json({ success: true, message: "If account exists, reset link sent" });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      return res.status(500).json({ message: "Email could not be sent" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== RESET PASSWORD ====================
const resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    if (!req.body.password || req.body.password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    user.password = await bcrypt.hash(req.body.password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ success: true, message: "Password reset successfully. Please login." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== CHANGE PASSWORD ====================
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Please provide both current and new passwords" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect current password" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== TEST EMAIL ====================
const testEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const html = welcomeEmail("Test User");
    const result = await sendEmail({
      to: email,
      subject: "Test Email from Fixify 🚀",
      html
    });

    if (result.success) {
      res.json({ success: true, message: "Test email sent successfully!" });
    } else {
      res.status(500).json({ success: false, message: "Failed to send email", error: result.error });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= EXPORT =================
module.exports = {
  registerUser,
  loginUser,
  getAllUsers,
  toggleUserStatus,
  deleteUser,
  getUserById,
  updateUserProfile,
  approveUser,
  rejectUser,
  forgotPassword,
  resetPassword,
  changePassword,
  testEmail
}