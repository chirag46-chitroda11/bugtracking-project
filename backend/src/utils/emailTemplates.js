const generateEmailTemplate = (content, title) => `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">

<style>
body{
    margin:0;
    padding:0;
    background:#f1f5f9;
    font-family:'Plus Jakarta Sans','Inter',Arial,sans-serif;
    -webkit-font-smoothing:antialiased;
}

.container{
    max-width:600px;
    margin:40px auto;
    background:#ffffff;
    border-radius:24px;
    overflow:hidden;
    box-shadow:0 10px 30px rgba(0,0,0,0.05);
}

.header{
    padding:38px 30px;
    text-align:center;
    background:linear-gradient(135deg,#f8faff,#eef2ff);
    border-bottom:1px solid #e5e7eb;
}

.header-logo{
    margin:0;
    font-size:34px;
    font-weight:800;
    color:#111827;
    letter-spacing:-1.4px;
    line-height:1;
}

.header-logo span{
    color:#a0b5f9;
}

.header-tag{
    margin-top:10px;
    font-size:13px;
    color:#64748b;
    font-weight:600;
}

.content{
    padding:40px;
}

.title{
    margin:0 0 22px;
    font-size:24px;
    font-weight:800;
    color:#0f172a;
    letter-spacing:-0.4px;
}

.text{
    font-size:16px;
    line-height:1.7;
    color:#475569;
    margin:0 0 22px;
    font-weight:500;
}

.highlight{
    color:#7f98f5;
    font-weight:700;
}

.button{
    display:inline-block;
    padding:14px 30px;
    background:linear-gradient(135deg,#a0b5f9,#7f98f5);
    color:#ffffff !important;
    text-decoration:none;
    border-radius:14px;
    font-size:15px;
    font-weight:700;
    box-shadow:0 10px 22px rgba(160,181,249,.35);
}

.footer{
    padding:28px 24px;
    background:#f8fafc;
    text-align:center;
    border-top:1px solid #e2e8f0;
}

.footer-text{
    margin:0;
    font-size:13px;
    color:#94a3b8;
    font-weight:600;
    line-height:1.7;
}

@media(max-width:600px){

.container{
    margin:0;
    border-radius:0;
}

.header{
    padding:28px 20px;
}

.header-logo{
    font-size:28px;
}

.content{
    padding:30px 20px;
}

.title{
    font-size:22px;
}

.text{
    font-size:15px;
}

.button{
    width:100%;
    box-sizing:border-box;
    text-align:center;
}
}
</style>
</head>

<body>

<div class="container">

<div class="header">
    <h1 class="header-logo">FIXIFY<span>.</span></h1>
    <div class="header-tag">Track Bugs Faster. Build Better Products.</div>
</div>

<div class="content">
    <h2 class="title">${title}</h2>
    ${content}
</div>

<div class="footer">
    <p class="footer-text">© 2026 Fixify. All rights reserved.</p>
    <p class="footer-text">Bug Tracking • Sprint Planning • Team Collaboration</p>
</div>

</div>

</body>
</html>
`;

const welcomeEmail = (name) => {
return generateEmailTemplate(`
<p class="text">Hello <span class="highlight">${name}</span>,</p>

<p class="text">
Welcome to <span class="highlight">Fixify</span>! Your account has been created successfully.
</p>

<p class="text">
Start managing bugs, tasks, sprints and collaboration with a faster and smarter workflow.
</p>

<div style="text-align:center;margin:38px 0;">
<a href="${process.env.FRONTEND_URL || 'https://fixify46.vercel.app'}/login" class="button">
Access Your Workspace
</a>
</div>

<p class="text" style="margin-bottom:0;">
Regards,<br><strong>Team Fixify</strong>
</p>
`, "Welcome to Fixify 🚀");
};

const approvalEmail = (name) => {
return generateEmailTemplate(`
<p class="text">Hello <span class="highlight">${name}</span>,</p>

<p class="text">
Your account request has been
<span class="highlight" style="color:#10b981;">Approved</span>.
</p>

<p class="text">
You can now login and access your dashboard.
</p>

<div style="text-align:center;margin:38px 0;">
<a href="${process.env.FRONTEND_URL || 'https://fixify46.vercel.app'}/login"
class="button"
style="background:#10b981;box-shadow:0 10px 22px rgba(16,185,129,.25);">
Go to Dashboard
</a>
</div>

<p class="text" style="margin-bottom:0;">
Regards,<br><strong>Team Fixify</strong>
</p>
`, "Account Approved ✅");
};

const rejectionEmail = (name) => {
return generateEmailTemplate(`
<p class="text">Hello <span class="highlight">${name}</span>,</p>

<p class="text">
Thank you for registering with <span class="highlight">Fixify</span>.
</p>

<p class="text">
After review, your request has been
<span class="highlight" style="color:#ef4444;">Declined</span>.
</p>

<p class="text" style="font-size:14px;background:#f8fafc;padding:14px;border-radius:12px;border:1px solid #e2e8f0;">
If you think this was a mistake, please contact our administrator and try again.
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
We received a request to reset your password.
</p>

<p class="text">
Use the secure button below. This link expires in
<span class="highlight">15 minutes</span>.
</p>

<div style="text-align:center;margin:38px 0;">
<a href="${resetUrl}"
class="button"
style="background:#f59e0b;box-shadow:0 10px 22px rgba(245,158,11,.25);">
Reset Password
</a>
</div>

<p class="text" style="font-size:14px;color:#94a3b8;">
If you did not request this, please ignore this email.
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
Your registration request has been received successfully.
</p>

<p class="text">
Our admin team is reviewing your account.
</p>

<p class="text" style="font-size:14px;background:#f8fafc;padding:14px;border-radius:12px;border:1px solid #e2e8f0;">
<strong>Status:</strong> Under Review
</p>

<p class="text" style="margin-bottom:0;">
Thank you for your patience.<br><strong>Team Fixify</strong>
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