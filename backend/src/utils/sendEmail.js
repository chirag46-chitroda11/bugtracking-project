const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // ✅ ENV
        pass: process.env.EMAIL_PASS, // ✅ ENV
      },
    });

    await transporter.sendMail({
      from: `"Fixify 🚀" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log("✅ Email sent");
  } catch (error) {
    console.log("❌ Email error:", error);
  }
};

module.exports = sendEmail;