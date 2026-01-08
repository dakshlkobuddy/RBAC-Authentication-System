
const pool = require("../config/database");
const crypto = require("crypto");
// Import the renamed function
const { sendSetPasswordEmail } = require("./mail.service");

const createUser = async (name, email, role) => {
  const roleResult = await pool.query(
    "SELECT id FROM roles WHERE name = $1",
    [role]
  );

  if (roleResult.rows.length === 0) {
    throw new Error("Invalid role");
  }

  const roleId = roleResult.rows[0].id;

  // Renamed variable: 'setToken' instead of 'resetToken'
  const setToken = crypto.randomBytes(32).toString("hex");
  const tokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  // Note: We still save into the 'reset_token' DB column to avoid changing the Database Schema
  await pool.query(
    `
    INSERT INTO users (name, email, role_id, reset_token, reset_token_expiry)
    VALUES ($1, $2, $3, $4, $5)
    `,
    [name, email, roleId, setToken, tokenExpiry]
  );

  // Call the renamed function
  await sendSetPasswordEmail(email, setToken);
};

module.exports = { createUser };
