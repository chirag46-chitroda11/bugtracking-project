const ContactRequest = require("../models/contactRequestModel");
const ActivityLog = require("../models/activityLogModel");
const { createAndEmitNotification } = require("../utils/notificationHelper");

// Create new contact request
const createContactRequest = async (req, res) => {
  try {
    const { name, email, phone, inquiryType, message } = req.body;

    if (!name || !email || !phone || !inquiryType || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    const contactRequest = await ContactRequest.create({
      name,
      email,
      phone,
      inquiryType,
      message,
      status: "new"
    });

    // Create Admin Notification
    await createAndEmitNotification(req.app, {
      title: "New Contact Request",
      message: `"${name}" sent a new ${inquiryType} request.`,
      type: "general",
      targetRoles: ["admin"],
      referenceId: contactRequest._id
    });

    // Create Activity Log (System level since it's from unauth user)
    // We'll find an admin to associate it with or just use a system placeholder if needed
    // But usually activity logs need a userId. Let's see if we can find the main admin.
    const User = require("../models/userModel");
    const admin = await User.findOne({ role: "admin" });
    
    if (admin) {
      await ActivityLog.create({
        userId: admin._id,
        action: "email", // Use "email" as it's a contact request
        entityType: "user", // Associating with user entity for now
        entityId: contactRequest._id,
        title: "New Let's Talk Request",
        description: `New contact request received from ${name} (${email})`,
        metadata: { inquiryType }
      });
    }

    res.status(201).json({
      success: true,
      message: "Request submitted successfully! We'll get back to you soon.",
      data: contactRequest
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all contact requests (Admin only)
const getAllContactRequests = async (req, res) => {
  try {
    const requests = await ContactRequest.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: requests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update status (mark read/replied)
const updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const request = await ContactRequest.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found"
      });
    }

    // Log Activity
    await ActivityLog.create({
      userId: req.user.id || req.user._id,
      action: "user",
      entityType: "user",
      entityId: request._id,
      title: "Contact Request Updated",
      description: `Marked contact request from ${request.name} as ${status}`,
      metadata: { status }
    });

    res.status(200).json({
      success: true,
      message: `Request marked as ${status}`,
      data: request
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete request
const deleteContactRequest = async (req, res) => {
  try {
    const request = await ContactRequest.findByIdAndDelete(req.params.id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found"
      });
    }

    // Log Activity
    await ActivityLog.create({
      userId: req.user.id || req.user._id,
      action: "user",
      entityType: "user",
      entityId: req.params.id,
      title: "Contact Request Deleted",
      description: `Deleted contact request from ${request.name}`,
    });

    res.status(200).json({
      success: true,
      message: "Request deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createContactRequest,
  getAllContactRequests,
  updateRequestStatus,
  deleteContactRequest
};
