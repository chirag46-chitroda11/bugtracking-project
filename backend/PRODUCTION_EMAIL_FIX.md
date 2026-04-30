# Production Email Troubleshooting Guide

If emails work locally but fail in production, follow these steps:

## 1. Environment Variables
Ensure the following are set in your deployment platform (Render, Vercel, VPS):
- `EMAIL_USER`: Your Gmail address.
- `EMAIL_PASS`: Your 16-character **Gmail App Password** (not your regular password).
- `NODE_ENV`: Should be set to `production`.
- `FRONTEND_URL`: Your live frontend URL (e.g., `https://fixify46.vercel.app`).

## 2. Gmail Security
- **App Password**: You MUST use an App Password. Regular passwords will be blocked by Google.
- **Unlock Captcha**: Sometimes Google blocks new server IPs. Go to [https://accounts.google.com/DisplayUnlockCaptcha](https://accounts.google.com/DisplayUnlockCaptcha) while logged into the `EMAIL_USER` account to allow access.

## 3. Network & Ports
- **Port 25**: Most cloud providers block Port 25. Our system defaults to Gmail's internal port handling.
- **Port 465/587**: If you use a custom SMTP, ensure these ports are open.
- **E-CONREFUSED Error**: If you see this in logs, it means your server provider is blocking the SMTP connection.

## 4. Check Logs
I have added detailed logging. Check your server logs for:
- `[EmailService] Attempting to send email...`
- `❌ [EmailService] Error for ...`
- `[EmailService Debug] Code: ...` (This will show the exact SMTP error code).

## 5. Fallback Recommendation
If your server provider blocks all SMTP traffic (common on some free tiers), consider using an API-based service like **SendGrid** or **Postmark**. I can help you switch to their official SDKs if needed.
