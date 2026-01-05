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
 * Sends an email to the new user to SET their password.
 */
const sendSetPasswordEmail = async (email, token) => {
  // Variable renamed to 'setLink'
  const setLink = `${process.env.FRONTEND_URL}/set-password.html?token=${token}`;

  await transporter.sendMail({
    from: `"RBAC System" <${process.env.MAIL_USER}>`,
    to: email,
    subject: "Set your Account Password", // Subject updated
    html: `
      <h3>Welcome to the Team!</h3>
      <p>Your account has been created.</p>
      <p>Please click the link below to set your password and access the system:</p>
      <a href="${setLink}">${setLink}</a>
      <p>This link is valid for 1 hour.</p>
    `,
  });
};

module.exports = { sendSetPasswordEmail };  