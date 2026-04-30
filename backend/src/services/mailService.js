const nodemailer = require("nodemailer");

/**
 * Mail Service
 * Centralized transporter and email sending logic
 */

let transporter;

const createTransporter = () => {
  if (transporter) return transporter;

  const config = {
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // Use STARTTLS on port 587
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    // 🔥 Fix for ENETUNREACH: Force IPv4 instead of IPv6
    family: 4, 
    // Production reliability settings
    connectionTimeout: 20000, // Increased to 20s
    greetingTimeout: 10000,
    socketTimeout: 30000,
    tls: {
      rejectUnauthorized: false // Helps with some restricted environments
    }
  };

  // If generic SMTP host/port are provided, use them instead of Gmail service
  if (process.env.SMTP_HOST && process.env.SMTP_PORT) {
    delete config.service;
    config.host = process.env.SMTP_HOST;
    config.port = parseInt(process.env.SMTP_PORT);
    config.secure = config.port === 465; // true for 465, false for other ports
  }

  transporter = nodemailer.createTransport(config);
  return transporter;
};

/**
 * Send an email
 * @param {Object} options - { to, subject, html }
 */
const sendEmail = async ({ to, subject, html }) => {
  const isProduction = process.env.NODE_ENV === "production";
  
  // 🔍 Diagnostic logging for Production
  console.log(`[EmailService] Attempting to send email to: ${to} | Subject: ${subject}`);
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    const missing = !process.env.EMAIL_USER ? "EMAIL_USER" : "EMAIL_PASS";
    console.error(`❌ [EmailService] Configuration Error: ${missing} is missing in environment variables.`);
    return { success: false, error: `${missing} not configured` };
  }

  try {
    const mailTransporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || `"Fixify Bug Tracker" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    // Log the transporter config (securely) if in debug mode or on failure
    const info = await mailTransporter.sendMail(mailOptions);
    console.log(`✅ [EmailService] Email sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    let errorMessage = error.message;
    const smtpHost = process.env.SMTP_HOST || "Gmail (Service)";
    
    // Descriptive errors for common SMTP issues
    if (error.code === 'ECONNREFUSED') {
      errorMessage = `Could not connect to SMTP server (${smtpHost}). Port might be blocked by provider.`;
    } else if (error.code === 'ENETUNREACH') {
      errorMessage = `Network unreachable. This often happens in production when IPv6 is used. I have forced IPv4 to fix this.`;
    } else if (error.code === 'EAUTH' || error.message.includes('Invalid login')) {
      errorMessage = "Authentication failed. Verify EMAIL_USER and EMAIL_PASS (App Password).";
    } else if (error.code === 'ETIMEDOUT') {
      errorMessage = `Connection to SMTP server (${smtpHost}) timed out. Your hosting provider might be blocking Port 587/465.`;
    }

    console.error(`❌ [EmailService] Error for ${to}:`, errorMessage);
    
    // Log technical details in production for remote debugging
    if (isProduction) {
      console.error(`[EmailService Debug] Code: ${error.code} | Command: ${error.command} | Response: ${error.response}`);
    }

    return { success: false, error: errorMessage };
  }
};

module.exports = {
  sendEmail,
  createTransporter
};
