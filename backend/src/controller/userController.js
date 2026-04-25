const User = require("../models/userModel")
const uploadToCloudinary = require("../utils/CloudinaryUtil")
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");
const { createAndEmitNotification } = require("../utils/notificationHelper");
const crypto = require("crypto");

// ================= REGISTER USER =================
const registerUser = async (req, res) => {
  try {
    let { name, email, password, role, designation } = req.body;

    let isPublic = true;
    if (req.headers.authorization) {
      try {
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role === "admin") {
          isPublic = false;
        }
      } catch (err) { }
    }

    if (isPublic) {
      role = "tester";
    }

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: "All required fields missing"
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

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      designation,
      status: isPublic ? "pending" : "active"
      // imagePath: imageUrl
    });

    // ================= 📧 EMAIL FUNCTIONALITY ADDED =================
    const html = `
  <div style="font-family: Arial, sans-serif; background:#f5f6fa; padding:20px;">
    
    <div style="max-width:500px; margin:auto; background:#fff; padding:20px; border-radius:10px;">
      
      <h2 style="color:#4cafef; text-align:center;">
        🚀 Fixify
      </h2>

      <h3 style="text-align:center;">Welcome to Fixify</h3>

      <p>Hello <b>${name}</b>,</p>

      <p>Your account has been successfully created.</p>

      <div style="background:#f1f1f1; padding:10px; border-radius:8px;">
        <p><b>Email:</b> ${email}</p>
        <p><b>Password:</b> (your entered password)</p>
      </div>

      <p style="margin-top:15px;">
        Please login and start managing your tasks.
      </p>

      <hr />

      <p style="font-size:12px; color:gray; text-align:center;">
        © Fixify - Bug Tracking System
      </p>

    </div>
  </div>
`;
    await sendEmail(email, "Welcome to Fixify 🚀", html);
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

//================= SOFT DELETE USER (ADMIN ONLY )======
const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "User deleted permanently"
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

    user.status = "rejected";
    await user.save();

    res.json({
      success: true,
      message: "User rejected",
      data: user
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

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    const html = `
      <div style="font-family: Arial, sans-serif; background:#f5f6fa; padding:20px;">
        <div style="max-width:500px; margin:auto; background:#fff; padding:20px; border-radius:10px;">
          <h2 style="color:#4cafef; text-align:center;">🚀 Fixify</h2>
          <h3 style="text-align:center;">Password Reset Request</h3>
          <p>Hello <b>${user.name}</b>,</p>
          <p>You requested a password reset. Click the button below to reset your password. This link is valid for 15 minutes.</p>
          <div style="text-align:center; margin: 25px 0;">
            <a href="${resetUrl}" style="background:#4f46e5; color:#fff; padding:12px 24px; text-decoration:none; border-radius:8px; font-weight:bold;">Reset Password</a>
          </div>
          <p>If you did not request this, please ignore this email.</p>
          <hr />
          <p style="font-size:12px; color:gray; text-align:center;">© Fixify - Bug Tracking System</p>
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