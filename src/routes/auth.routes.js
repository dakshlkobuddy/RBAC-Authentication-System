const express = require("express");
const router = express.Router();
const { loginUser } = require("../services/auth.service");
const { hashPassword } = require("../utils/password.util");
const pool = require("../config/database");

router.post("/set-password/:token", async (req, res) => {
  const { password } = req.body;
  const { token } = req.params;

  const userResult = await pool.query(
    `
    SELECT id FROM users
    WHERE reset_token = $1 AND reset_token_expiry > NOW()
    `,
    [token]
  );

  if (userResult.rows.length === 0) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }

  const hashed = await hashPassword(password);

  await pool.query(
    `
    UPDATE users
    SET password = $1, reset_token = NULL, reset_token_expiry = NULL
    WHERE id = $2
    `,
    [hashed, userResult.rows[0].id]
  );

  res.json({ message: "Password set successfully" });
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const token = await loginUser(email, password);

    res.json({
      message: "Login successful",
      token,
    });
  } catch (err) {
    res.status(401).json({
      message: err.message,
    });
  }
});

module.exports = router;
