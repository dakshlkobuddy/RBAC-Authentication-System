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

/**
 * Sends an email to SET or RESET the password.
 * Added 'type' parameter to switch between Welcome email and Reset email.
 * * @param {string} email - Recipient email
 * @param {string} token - The reset/invite token
 * @param {string} type - 'welcome' (default) or 'reset'
 */
const sendSetPasswordEmail = async (email, token, type = 'welcome') => {
  const baseUrl = process.env.FRONTEND_URL;
  let subject, htmlContent, link;

  if (type === 'reset') {
    // --- Logic for Forgot Password Email ---
    subject = "Password Reset Request";
    // Points to the NEW reset-password.html page
    link = `${baseUrl}/reset-password.html?token=${token}`;
    
    htmlContent = `
      <h3>Password Reset</h3>
      <p>You requested to reset your password.</p>
      <p>Click the link below to create a new password:</p>
      <a href="${link}">${link}</a>
      <p>This link expires in 1 hour.</p>
    `;
  } else {
    // --- Logic for New User Invite (Default) ---
    subject = "Welcome! Set your Account Password";
    // Points to the existing set-password.html page
    link = `${baseUrl}/set-password.html?token=${token}`;
    
    htmlContent = `
      <h3>Welcome to the Team!</h3>
      <p>Your account has been created.</p>
      <p>Please click the link below to set your password and access the system:</p>
      <a href="${link}">${link}</a>
      <p>This link is valid for 1 hour.</p>
    `;
  }

  await transporter.sendMail({
    from: `"RBAC System" <${process.env.MAIL_USER}>`,
    to: email,
    subject: subject,
    html: htmlContent,
  });
};

module.exports = { sendSetPasswordEmail };