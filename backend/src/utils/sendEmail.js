const { sendEmail: mailServiceSendEmail } = require("../services/mailService");

/**
 * Legacy sendEmail utility
 * Delegates to the new mailService
 */
const sendEmail = async (to, subject, html) => {
  return await mailServiceSendEmail({ to, subject, html });
};

module.exports = sendEmail;