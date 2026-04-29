const templates = require('./utils/emailTemplates');

console.log("🔍 Verifying Email Templates...");

const testData = {
  name: "John Doe",
  resetUrl: "https://fixify46.vercel.app/reset-password/abc123"
};

const checks = [
  { name: "welcomeEmail", fn: templates.welcomeEmail, args: [testData.name] },
  { name: "approvalEmail", fn: templates.approvalEmail, args: [testData.name] },
  { name: "rejectionEmail", fn: templates.rejectionEmail, args: [testData.name] },
  { name: "resetPasswordEmail", fn: templates.resetPasswordEmail, args: [testData.name, testData.resetUrl] },
  { name: "pendingEmail", fn: templates.pendingEmail, args: [testData.name] },
  { name: "deletedEmail", fn: templates.deletedEmail, args: [testData.name] }
];

checks.forEach(check => {
  try {
    const html = check.fn(...check.args);
    if (html && html.includes("FIXIFY") && html.includes(testData.name)) {
      console.log(`✅ ${check.name} generated successfully.`);
    } else {
      console.error(`❌ ${check.name} generation failed: HTML content invalid.`);
    }
  } catch (err) {
    console.error(`❌ ${check.name} threw an error:`, err.message);
  }
});

console.log("✨ All template checks completed.");
