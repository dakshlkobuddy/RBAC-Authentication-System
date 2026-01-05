const express = require("express");
const router = express.Router();

const { loginUser } = require("../services/auth.service");
const { hashPassword } = require("../utils/password.util");
const pool = require("../config/database");

/**
 * =================================
 * SET PASSWORD (FROM EMAIL LINK)
 * =================================
 */
router.post("/set-password/:token", async (req, res) => {
  try {
    const { password, confirmPassword } = req.body;
    const { token } = req.params;

    // 1. Validation
    if (!password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    // 2. Find User by Token (Check if valid & not expired)
    const userResult = await pool.query(
      `
      SELECT id FROM users
      WHERE reset_token = $1
        AND reset_token_expiry > NOW()
      `,
      [token]
    );

    if (userResult.rows.length === 0) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // 3. Hash New Password
    const hashedPassword = await hashPassword(password);

    // 4. Update User (Clear token so link can't be used again)
    await pool.query(
      `
      UPDATE users
      SET password = $1,
          reset_token = NULL,
          reset_token_expiry = NULL
      WHERE id = $2
      `,
      [hashedPassword, userResult.rows[0].id]
    );

    res.json({ message: "Password set successfully ✅" });
  } catch (error) {
    console.error("Set password error:", error);
    res.status(500).json({ message: "Failed to set password" });
  }
});

/**
 * =================================
 * LOGIN
 * =================================
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const token = await loginUser(email, password);

    res.json({
      message: "Login successful ✅",
      token
    });
  } catch (error) {
    res.status(401).json({
      message: error.message || "Invalid credentials"
    });
  }
});

module.exports = router;