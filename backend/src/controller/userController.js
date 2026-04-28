const User = require("../models/userModel")
const uploadToCloudinary = require("../utils/CloudinaryUtil")
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");
const { createAndEmitNotification } = require("../utils/notificationHelper");
const crypto = require("crypto");

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
      return res.status(400).json({
        message: "User already exists"
      });
    }

    let imageUrl = "";
    if (req.file) {
      const cloudinaryResponse = await uploadToCloudinary(req.file.path);
      imageUrl = cloudinaryResponse.secure_url;
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
      status: initialStatus
      // imagePath: imageUrl
    });

    // ================= 📧 EMAIL FUNCTIONALITY ADDED =================
    const FRONTEND_URL = process.env.FRONTEND_URL || "https://fixify46.vercel.app";
    const html = `
  <div style="font-family: 'Inter', Arial, sans-serif; background:#0f172a; padding:40px 20px;">
    <div style="max-width:500px; margin:auto; background:#1e293b; padding:30px; border-radius:16px; border: 1px solid #334155;">
      <h2 style="color:#38bdf8; text-align:center; margin-bottom: 24px; font-size: 28px;">
        Fixify
      </h2>
      <p style="color:#f8fafc; font-size: 16px;">Hello <b>${name}</b>,</p>
      <p style="color:#cbd5e1; font-size: 16px; line-height: 1.6;">Your Fixify account is ready.</p>
      <p style="color:#cbd5e1; font-size: 16px; line-height: 1.6;">A faster, smarter way to manage bugs, teams, and productivity starts now.</p>
      
      <div style="text-align: center; margin: 32px 0;">
        <a href="${FRONTEND_URL}/login" style="background:#38bdf8; color:#0f172a; padding:12px 24px; text-decoration:none; border-radius:8px; font-weight:bold; display:inline-block;">Access Workspace</a>
      </div>

      <p style="color:#94a3b8; font-size: 14px;">Regards,<br/>The Fixify Team</p>
    </div>
  </div>
`;
    await sendEmail(email, "Welcome to the Future of Bug Tracking — Fixify 🔥", html);
    // ===============================================================

    // Create notification for new user
    await createAndEmitNotification(req.app, {
      title: "New User Registered",
      message: `${name} (${role.replace('_', ' ')}) has joined the system`,
      type: "user_registered",
      targetRoles: ["admin", "project_manager"],
      referenceId: user._id
    });

    res.status(201).json({
      message: "User created successfully",
      data: user
    })

  } catch (error) {
    console.log("REGISTER ERROR:", error)

    res.status(500).json({
      message: "Error creating user",
      error: error.message
    })
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

    // Send Approval Email
    const FRONTEND_URL = process.env.FRONTEND_URL || "https://fixify46.vercel.app";
    const html = `
  <div style="font-family: 'Inter', Arial, sans-serif; background:#0f172a; padding:40px 20px;">
    <div style="max-width:500px; margin:auto; background:#1e293b; padding:30px; border-radius:16px; border: 1px solid #334155;">
      <h2 style="color:#22c55e; text-align:center; margin-bottom: 24px; font-size: 24px;">
        Account Approved ✅
      </h2>
      <p style="color:#f8fafc; font-size: 16px;">Hello <b>${user.name}</b>,</p>
      <p style="color:#cbd5e1; font-size: 16px; line-height: 1.6;">Congratulations! Your Fixify account has been approved.</p>
      <p style="color:#cbd5e1; font-size: 16px; line-height: 1.6;">You can now access your dashboard and start working.</p>
      
      <div style="text-align: center; margin: 32px 0;">
        <a href="${FRONTEND_URL}/login" style="background:#22c55e; color:#ffffff; padding:12px 24px; text-decoration:none; border-radius:8px; font-weight:bold; display:inline-block;">Go to Dashboard</a>
      </div>

      <p style="color:#94a3b8; font-size: 14px;">Regards,<br/>The Fixify Team</p>
    </div>
  </div>
`;
    await sendEmail(user.email, "Your Fixify Account is Approved 🎉", html);

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

    // Send Rejection Email before deleting
    try {
      const html = `
  <div style="font-family: 'Inter', Arial, sans-serif; background:#0f172a; padding:40px 20px;">
    <div style="max-width:500px; margin:auto; background:#1e293b; padding:30px; border-radius:16px; border: 1px solid #334155;">
      <h2 style="color:#ef4444; text-align:center; margin-bottom: 24px; font-size: 24px;">
        Registration Request Declined
      </h2>
      <p style="color:#f8fafc; font-size: 16px;">Hello <b>${user.name}</b>,</p>
      <p style="color:#cbd5e1; font-size: 16px; line-height: 1.6;">We're sorry, but your Fixify account request has been declined by the admin.</p>
      <p style="color:#cbd5e1; font-size: 16px; line-height: 1.6;">If you believe this is a mistake, please contact the administrator or try registering again.</p>
      <p style="color:#94a3b8; font-size: 14px; margin-top: 24px;">Regards,<br/>The Fixify Team</p>
    </div>
  </div>
`;
      await sendEmail(user.email, "Your Fixify Registration Request Was Declined", html);
    } catch (emailErr) {
      console.log("Rejection email failed (non-blocking):", emailErr.message);
    }

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

    const html = `
  <div style="font-family: 'Inter', Arial, sans-serif; background:#0f172a; padding:40px 20px;">
    <div style="max-width:500px; margin:auto; background:#1e293b; padding:30px; border-radius:16px; border: 1px solid #334155;">
      <h2 style="color:#eab308; text-align:center; margin-bottom: 24px; font-size: 24px;">
        Password Reset Request 🔐
      </h2>
      <p style="color:#f8fafc; font-size: 16px;">We received a request to reset your password.</p>
      <p style="color:#cbd5e1; font-size: 16px; line-height: 1.6;">Click below to create a new password:</p>
      
      <div style="text-align: center; margin: 32px 0;">
        <a href="${resetUrl}" style="background:#eab308; color:#0f172a; padding:12px 24px; text-decoration:none; border-radius:8px; font-weight:bold; display:inline-block;">Reset Password</a>
      </div>

      <p style="color:#94a3b8; font-size: 14px;">This link expires soon.</p>
      <p style="color:#94a3b8; font-size: 14px;">If you didn’t request this, ignore this email.</p>
      <hr style="border:none; border-top: 1px solid #334155; margin: 24px 0;" />
      <p style="color:#64748b; font-size: 12px; text-align:center;">Team Fixify</p>
    </div>
  </div>
`;

    try {
      await sendEmail(user.email, "Password Reset Request - Fixify", html);
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
  changePassword
}