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
            background: linear-gradient(135deg, #0f172a, #1e293b);
            padding: 34px 30px;
            text-align: center;
        }

        .logo-wrap {
            display: inline-flex;
            align-items: center;
            gap: 14px;
        }

        .logo-icon {
            width: 52px;
            height: 52px;
            border-radius: 16px;
            background: linear-gradient(135deg, #a0b5f9, #7f98f5);
            color: #ffffff;
            font-size: 24px;
            font-weight: 800;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 12px 24px rgba(160,181,249,0.28);
        }

        .header-logo {
            color: #ffffff;
            font-size: 30px;
            font-weight: 800;
            letter-spacing: -1px;
            margin: 0;
            line-height: 1;
        }

        .header-sub {
            margin-top: 6px;
            color: #cbd5e1;
            font-size: 13px;
            font-weight: 600;
            letter-spacing: 0.2px;
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
            background: linear-gradient(135deg, #a0b5f9, #7f98f5);
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 14px;
            font-weight: 700;
            font-size: 16px;
            transition: 0.3s;
            box-shadow: 0 8px 20px rgba(160,181,249,0.35);
        }

        .footer-text {
            font-size: 13px;
            color: #94a3b8;
            margin: 0;
            font-weight: 600;
        }

        .highlight {
            color: #7f98f5;
            font-weight: 700;
        }

        @media (max-width: 600px) {
            .container {
                margin: 0;
                border-radius: 0;
            }

            .content {
                padding: 30px 20px;
            }

            .header {
                padding: 28px 20px;
            }

            .header-logo {
                font-size: 24px;
            }

            .logo-icon {
                width: 44px;
                height: 44px;
                font-size: 20px;
            }
        }
    </style>
</head>

<body>
    <div class="container">

        <div class="header">
            <div class="logo-wrap">
                <div class="logo-icon">F</div>
                <div>
                    <h1 class="header-logo">FIXIFY</h1>
                    <div class="header-sub">Track Bugs Faster. Build Better Products.</div>
                </div>
            </div>
        </div>

        <div class="content">
            <h2 class="title">${title}</h2>
            ${content}
        </div>

        <div class="footer">
            <p class="footer-text">© 2026 Fixify. All rights reserved By Chirag Chitroda.</p>
            <p class="footer-text" style="margin-top: 5px;">Fixify • Bug Tracking & Team Collaboration</p>
        </div>

    </div>
</body>
</html>
`;

const welcomeEmail = (name) => {
    return generateEmailTemplate(`
        <p class="text">Hello <span class="highlight">${name}</span>,</p>

        <p class="text">
            Welcome to the future of bug tracking! We're thrilled to have you on board with
            <span class="highlight">Fixify</span>.
        </p>

        <p class="text">
            Your account has been created successfully. A faster, smarter way to manage your
            development cycle, collaborate with your team, and squash bugs is just a click away.
        </p>

        <div style="text-align:center; margin:40px 0;">
            <a href="${process.env.FRONTEND_URL || 'https://fixify46.vercel.app'}/login" class="button">
                Access Your Workspace
            </a>
        </div>

        <p class="text">Get ready to transform your productivity!</p>

        <p class="text" style="margin-bottom:0;">
            Regards,<br><strong>Team Fixify</strong>
        </p>
    `, "Welcome to Fixify! 🔥");
};

const approvalEmail = (name) => {
    return generateEmailTemplate(`
        <p class="text">Great news, <span class="highlight">${name}</span>!</p>

        <p class="text">
            Your registration request for <span class="highlight">Fixify</span> has been
            <span class="highlight" style="color:#10b981;">Approved</span>.
        </p>

        <p class="text">
            You can now sign in to your dashboard and start collaborating with your team.
        </p>

        <div style="text-align:center; margin:40px 0;">
            <a href="${process.env.FRONTEND_URL || 'https://fixify46.vercel.app'}/login"
               class="button"
               style="background:#10b981; box-shadow:0 8px 20px rgba(16,185,129,.25);">
               Go to Dashboard
            </a>
        </div>

        <p class="text">Happy bug hunting!</p>

        <p class="text" style="margin-bottom:0;">
            Regards,<br><strong>Team Fixify</strong>
        </p>
    `, "Account Approved ✅");
};

const rejectionEmail = (name) => {
    return generateEmailTemplate(`
        <p class="text">Hello <span class="highlight">${name}</span>,</p>

        <p class="text">
            Thank you for your interest in joining <span class="highlight">Fixify</span>.
        </p>

        <p class="text">
            After review, your registration request has been
            <span class="highlight" style="color:#ef4444;">Declined</span>.
        </p>

        <p class="text" style="color:#64748b; font-size:14px; background:#f8fafc; padding:15px; border-radius:10px; border:1px solid #e2e8f0;">
            <strong>Note:</strong> If you believe this is a mistake, please contact your administrator.
        </p>

        <p class="text" style="margin-bottom:0;">
            Regards,<br><strong>Team Fixify</strong>
        </p>
    `, "Registration Update");
};

const resetPasswordEmail = (name, resetUrl) => {
    return generateEmailTemplate(`
        <p class="text">Hello <span class="highlight">${name}</span>,</p>

        <p class="text">
            We received a request to reset the password for your
            <span class="highlight">Fixify</span> account.
        </p>

        <p class="text">
            Click below to create a new password. This link expires in
            <span class="highlight">15 minutes</span>.
        </p>

        <div style="text-align:center; margin:40px 0;">
            <a href="${resetUrl}"
               class="button"
               style="background:#f59e0b; box-shadow:0 8px 20px rgba(245,158,11,.25);">
               Reset My Password
            </a>
        </div>

        <p class="text" style="font-size:14px; color:#94a3b8;">
            If you didn't request this, you can safely ignore this email.
        </p>

        <p class="text" style="margin-bottom:0;">
            Regards,<br><strong>Team Fixify</strong>
        </p>
    `, "Password Reset 🔐");
};

const pendingEmail = (name) => {
    return generateEmailTemplate(`
        <p class="text">Hello <span class="highlight">${name}</span>,</p>

        <p class="text">
            Thank you for registering with <span class="highlight">Fixify</span>.
        </p>

        <p class="text">
            Your account request has been received and is currently under review.
        </p>

        <p class="text" style="color:#64748b; font-size:14px; background:#f8fafc; padding:15px; border-radius:10px; border:1px solid #e2e8f0;">
            <strong>Status:</strong> Under Review<br>
            <strong>Next Steps:</strong> You will receive another email once approved.
        </p>

        <p class="text" style="margin-bottom:0;">
            Thank you for your patience!<br><strong>Team Fixify</strong>
        </p>
    `, "Registration Received 📨");
};

module.exports = {
    welcomeEmail,
    approvalEmail,
    rejectionEmail,
    resetPasswordEmail,
    pendingEmail
};