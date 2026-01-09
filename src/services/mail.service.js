const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: false, 
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const FRONTEND_URL = "http://127.0.0.1:5500/frontend/html";

// 1. (Existing) Password Emails
const sendSetPasswordEmail = async (email, token, type = 'welcome') => {
  let subject, htmlContent, link;
  if (type === 'reset') {
    subject = "Password Reset Request";
    link = `${FRONTEND_URL}/reset-password.html?token=${token}`;
    htmlContent = `<h3>Password Reset</h3><p>Click here: <a href="${link}">${link}</a></p>`;
  } else {
    subject = "Welcome! Set your Password";
    link = `${FRONTEND_URL}/set-password.html?token=${token}`;
    htmlContent = `<h3>Welcome!</h3><p>Set password here: <a href="${link}">${link}</a></p>`;
  }
  await sendEmail(email, subject, htmlContent);
};

// 2. (NEW) Generic Email Sender for Replies
const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: `"RBAC System" <${process.env.MAIL_USER}>`,
      to: to,
      subject: subject,
      html: html,
    });
    console.log(`✅ Email sent to ${to}`);
    return true;
  } catch (err) {
    console.error("❌ Email failed:", err.message);
    return false;
  }
};

module.exports = { sendSetPasswordEmail, sendEmail };