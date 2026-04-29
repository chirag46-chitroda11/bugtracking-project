const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { createTransporter } = require('./services/mailService');

async function testConnection() {
  console.log("🔍 Checking Email Transporter Configuration...");
  console.log("EMAIL_USER:", process.env.EMAIL_USER);
  console.log("SMTP_HOST:", process.env.SMTP_HOST || 'Gmail (Service)');
  
  try {
    const transporter = createTransporter();
    console.log("⌛ Verifying connection to mail server...");
    
    // verify() checks the transporter configuration and connectivity
    await transporter.verify();
    
    console.log("✅ Mail server connection successful! Transporter is ready.");
  } catch (error) {
    console.error("❌ Mail server connection failed:");
    console.error(error.message);
    if (error.code === 'EAUTH') {
      console.error("💡 Hint: Authentication failed. Check your EMAIL_USER and EMAIL_PASS (App Password if using Gmail).");
    }
    process.exit(1);
  }
}

testConnection();
