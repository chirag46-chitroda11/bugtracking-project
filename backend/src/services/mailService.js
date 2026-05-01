const axios = require("axios");

/**
 * Mail Service
 * Centralized email sending logic using Brevo API
 */

const sendEmail = async ({ to, subject, html }) => {
  const isProduction = process.env.NODE_ENV === "production";

  console.log(`[EmailService] Attempting to send email to: ${to} | Subject: ${subject}`);

  // ✅ ENV validation (like your old code)
  if (!process.env.BREVO_API_KEY || !process.env.EMAIL_FROM) {
    const missing = !process.env.BREVO_API_KEY ? "BREVO_API_KEY" : "EMAIL_FROM";
    console.error(`❌ [EmailService] Configuration Error: ${missing} is missing`);
    return { success: false, error: `${missing} not configured` };
  }

  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "Fixify Bug Tracker",
          email: process.env.EMAIL_FROM,
        },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
        timeout: 20000, // same reliability
      }
    );

    console.log(`✅ [EmailService] Email sent to ${to}`);
    return { success: true, messageId: response.data?.messageId };

  } catch (error) {
    let errorMessage = error.response?.data || error.message;

    // ✅ Smart error handling (like your old code)
    if (error.response?.status === 401) {
      errorMessage = "Invalid API key (check BREVO_API_KEY)";
    } else if (error.code === "ECONNABORTED") {
      errorMessage = "Request timeout while sending email";
    }

    console.error(`❌ [EmailService] Error for ${to}:`, errorMessage);

    if (isProduction) {
      console.error("[EmailService Debug]:", error.response?.data);
    }

    return { success: false, error: errorMessage };
  }
};

module.exports = {
  sendEmail,
};