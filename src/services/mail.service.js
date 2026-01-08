const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: false, // TLS
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// ✅ HARDCODED: Points to your VS Code Live Server
const FRONTEND_URL = "http://127.0.0.1:5500/frontend/html";

/**
 * Sends an email to SET or RESET the password.
 * @param {string} email - Recipient email
 * @param {string} token - The reset/invite token
 * @param {string} type - 'welcome' (default) or 'reset'
 */
const sendSetPasswordEmail = async (email, token, type = 'welcome') => {
  let subject, htmlContent, link;

  if (type === 'reset') {
    // Forgot Password
    subject = "Password Reset Request";
    link = `${FRONTEND_URL}/reset-password.html?token=${token}`;
    
    htmlContent = `
      <h3>Password Reset</h3>
      <p>You requested to reset your password.</p>
      <p>Click the link below to create a new password:</p>
      <a href="${link}">${link}</a>
      <p>This link expires in 1 hour.</p>
    `;
  } else {
    // New User Invite
    subject = "Welcome! Set your Account Password";
    link = `${FRONTEND_URL}/set-password.html?token=${token}`;
    
    htmlContent = `
      <h3>Welcome to the Team!</h3>
      <p>Your account has been created.</p>
      <p>Please click the link below to set your password and access the system:</p>
      <a href="${link}">${link}</a>
      <p>This link is valid for 1 hour.</p>
    `;
  }

  try {
    await transporter.sendMail({
      from: `"RBAC System" <${process.env.MAIL_USER}>`,
      to: email,
      subject: subject,
      html: htmlContent,
    });
    console.log(`✅ Email sent to ${email}`);
  } catch (err) {
    console.error("❌ Email failed:", err);
    // Don't crash the server if email fails, just log it
  }
};

module.exports = { sendSetPasswordEmail };