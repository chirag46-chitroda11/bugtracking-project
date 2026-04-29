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
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || `"Fixify 🚀" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    const info = await mailTransporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Email error for ${to}:`, error.message);
    // Log more details in non-production
    if (process.env.NODE_ENV !== 'production') {
      console.error(error);
    }
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendEmail,
  createTransporter
};
