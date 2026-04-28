
const generateEmailTemplate = (content, title) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Plus Jakarta Sans', 'Inter', Arial, sans-serif;
            background-color: #f1f5f9;
            -webkit-font-smoothing: antialiased;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.05);
        }
        .header {
            background-color: #4f46e5;
            padding: 40px;
            text-align: center;
        }
        .header-logo {
            color: #ffffff;
            font-size: 32px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: -1px;
            margin: 0;
        }
        .header-logo span {
            color: #818cf8;
        }
        .content {
            padding: 40px;
            color: #1e293b;
            line-height: 1.6;
        }
        .footer {
            padding: 30px;
            background-color: #f8fafc;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }
        .title {
            font-size: 24px;
            font-weight: 800;
            color: #0f172a;
            margin-bottom: 20px;
            letter-spacing: -0.5px;
        }
        .text {
            font-size: 16px;
            color: #475569;
            margin-bottom: 24px;
            font-weight: 500;
        }
        .button {
            display: inline-block;
            padding: 14px 32px;
            background-color: #4f46e5;
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 14px;
            font-weight: 700;
            font-size: 16px;
            transition: 0.3s;
            box-shadow: 0 4px 15px rgba(79, 70, 229, 0.2);
        }
        .footer-text {
            font-size: 13px;
            color: #94a3b8;
            margin: 0;
            font-weight: 600;
        }
        .highlight {
            color: #4f46e5;
            font-weight: 700;
        }
        @media (max-width: 600px) {
            .container { margin: 0; border-radius: 0; }
            .content { padding: 30px 20px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="header-logo">FIXIFY<span>.</span></h1>
        </div>
        <div class="content">
            <h2 class="title">${title}</h2>
            ${content}
        </div>
        <div class="footer">
            <p class="footer-text">© 2024 Fixify. All rights reserved.</p>
            <p class="footer-text" style="margin-top: 5px;">Modernized Bug Tracking & Team Collaboration</p>
        </div>
    </div>
</body>
</html>
`;

const welcomeEmail = (name) => {
    return generateEmailTemplate(`
        <p class="text">Hello <span class="highlight">${name}</span>,</p>
        <p class="text">Welcome to the future of bug tracking! We're thrilled to have you on board with <span class="highlight">Fixify</span>.</p>
        <p class="text">Your account has been created successfully. A faster, smarter way to manage your development cycle, collaborate with your team, and squash bugs is just a click away.</p>
        <div style="text-align: center; margin: 40px 0;">
            <a href="${process.env.FRONTEND_URL || 'https://fixify46.vercel.app'}/login" class="button">Access Your Workspace</a>
        </div>
        <p class="text">Get ready to transform your productivity!</p>
        <p class="text" style="margin-bottom: 0;">Regards,<br><strong>Team Fixify</strong></p>
    `, "Welcome to Fixify! 🔥");
};

const approvalEmail = (name) => {
    return generateEmailTemplate(`
        <p class="text">Great news, <span class="highlight">${name}</span>!</p>
        <p class="text">Your registration request for <span class="highlight">Fixify</span> has been <span class="highlight" style="color: #10b981;">Approved</span> by the administrator.</p>
        <p class="text">You can now sign in to your dashboard and start collaborating with your team. All features are now unlocked and ready for you.</p>
        <div style="text-align: center; margin: 40px 0;">
            <a href="${process.env.FRONTEND_URL || 'https://fixify46.vercel.app'}/login" class="button" style="background-color: #10b981; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.2);">Go to Dashboard</a>
        </div>
        <p class="text">Happy bug hunting!</p>
        <p class="text" style="margin-bottom: 0;">Regards,<br><strong>Team Fixify</strong></p>
    `, "Account Approved ✅");
};

const rejectionEmail = (name) => {
    return generateEmailTemplate(`
        <p class="text">Hello <span class="highlight">${name}</span>,</p>
        <p class="text">Thank you for your interest in joining <span class="highlight">Fixify</span>.</p>
        <p class="text">After reviewing your registration request, we regret to inform you that it has been <span class="highlight" style="color: #ef4444;">Declined</span> by the administrator at this time.</p>
        <p class="text" style="color: #64748b; font-size: 14px; background: #f8fafc; padding: 15px; border-radius: 10px; border: 1px solid #e2e8f0;">
            <strong>Note:</strong> If you believe this is a mistake or have additional information to provide, please reach out to your project manager or administrator directly.
        </p>
        <p class="text" style="margin-top: 24px; margin-bottom: 0;">Regards,<br><strong>Team Fixify</strong></p>
    `, "Registration Update");
};

const resetPasswordEmail = (name, resetUrl) => {
    return generateEmailTemplate(`
        <p class="text">Hello <span class="highlight">${name}</span>,</p>
        <p class="text">We received a request to reset the password for your <span class="highlight">Fixify</span> account.</p>
        <p class="text">Click the button below to set up a new password. This link is secure and will expire in <span class="highlight">15 minutes</span>.</p>
        <div style="text-align: center; margin: 40px 0;">
            <a href="${resetUrl}" class="button" style="background-color: #f59e0b; box-shadow: 0 4px 15px rgba(245, 158, 11, 0.2);">Reset My Password</a>
        </div>
        <p class="text" style="font-size: 14px; color: #94a3b8;">If you didn't request a password reset, you can safely ignore this email. Your current password will remain unchanged.</p>
        <p class="text" style="margin-bottom: 0;">Regards,<br><strong>Team Fixify</strong></p>
    `, "Password Reset Request 🔐");
};

const pendingEmail = (name) => {
    return generateEmailTemplate(`
        <p class="text">Hello <span class="highlight">${name}</span>,</p>
        <p class="text">Thank you for registering with <span class="highlight">Fixify</span>!</p>
        <p class="text">We've received your request to join our platform. For security and quality purposes, all new accounts are reviewed by our administration team.</p>
        <p class="text" style="color: #64748b; font-size: 14px; background: #f8fafc; padding: 15px; border-radius: 10px; border: 1px solid #e2e8f0;">
            <strong>Status:</strong> Under Review<br>
            <strong>Next Steps:</strong> You will receive another email as soon as your account has been verified and approved.
        </p>
        <p class="text" style="margin-top: 24px; margin-bottom: 0;">Thank you for your patience!<br><strong>Team Fixify</strong></p>
    `, "Registration Received 📨");
};

module.exports = {
    welcomeEmail,
    approvalEmail,
    rejectionEmail,
    resetPasswordEmail,
    pendingEmail
};
