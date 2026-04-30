const nodemailer = require("nodemailer");

/**
 * Mail Service
 * Centralized transporter and email sending logic
 */

let transporter;

const createTransporter = () => {
  if (transporter) return transporter;

  const config = {
    service: "gmail", // Default to Gmail
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    // Production reliability settings
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 5000,
    socketTimeout: 15000,
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
  try {
    const mailTransporter = createTransporter();

    // Verify connection before sending in case it's stale
    // (Optional: can be heavy if many emails are sent, but good for debugging)
    // await mailTransporter.verify(); 

    const mailOptions = {
      from: process.env.EMAIL_FROM || `"Fixify Bug Tracker" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    const info = await mailTransporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    let errorMessage = error.message;
    
    // Descriptive errors for common SMTP issues
    if (error.code === 'ECONNREFUSED') {
      errorMessage = "Could not connect to SMTP server. Check host and port.";
    } else if (error.code === 'EAUTH' || error.message.includes('Invalid login')) {
      errorMessage = "Authentication failed. Check EMAIL_USER and EMAIL_PASS (App Password).";
    } else if (error.code === 'ETIMEDOUT') {
      errorMessage = "Connection to SMTP server timed out.";
    }

    console.error(`❌ Email error for ${to}:`, errorMessage);
    return { success: false, error: errorMessage };
  }
};

module.exports = {
  sendEmail,
  createTransporter
};
