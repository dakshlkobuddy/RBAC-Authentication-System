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

const sendResetEmail = async (email, token) => {
  const resetLink = `${process.env.FRONTEND_URL}/auth/set-password/${token}`;

  await transporter.sendMail({
    from: `"RBAC System" <${process.env.MAIL_USER}>`,
    to: email,
    subject: "Set your password",
    html: `
      <h3>Welcome to RBAC System</h3>
      <p>Click the link below to set your password:</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>This link is valid for 1 hour.</p>
    `,
  });
};

module.exports = { sendResetEmail };
