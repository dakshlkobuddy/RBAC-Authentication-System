const pool = require("../config/database");
const crypto = require("crypto");
const { sendResetEmail } = require("./mail.service");

const createUser = async (name, email, role) => {
  const roleResult = await pool.query(
    "SELECT id FROM roles WHERE name = $1",
    [role]
  );

  if (roleResult.rows.length === 0) {
    throw new Error("Invalid role");
  }

  const roleId = roleResult.rows[0].id;

  const resetToken = crypto.randomBytes(32).toString("hex");
  const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await pool.query(
    `
    INSERT INTO users (name, email, role_id, reset_token, reset_token_expiry)
    VALUES ($1, $2, $3, $4, $5)
    `,
    [name, email, roleId, resetToken, expiry]
  );

  await sendResetEmail(email, resetToken);
};

module.exports = { createUser };
