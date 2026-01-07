const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const rbacMiddleware = require("../middlewares/rbac.middleware");
const pool = require("../config/database");
const { createUser } = require("../services/user.service");

/**
 * =====================================
 * ADMIN: CREATE USER (finance / marketing)
 * =====================================
 */
router.post(
  "/users",
  authMiddleware,
  rbacMiddleware("admin.create"),
  async (req, res) => {
    try {
      const { name, email, role } = req.body;

      // 1. Basic Check
      if (!name || !email || !role) {
        return res.status(400).json({ message: "All fields are required" });
      }

      // 2. Titanium Strict Regex (Matches Frontend)
      const emailRegex = /^(?=.{1,64}@)[a-zA-Z0-9]+(?:[._-][a-zA-Z0-9]+)*@[a-zA-Z]+(?:-[a-zA-Z]+)*\.[a-zA-Z]{2,}$/;
      
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email format detected by server" });
      }

      // 3. Create User
      await createUser(name, email, role);

      res.json({
        message: "User created successfully and password setup email sent ✅",
      });

    } catch (err) {
      console.error("Create User Error:", err); // Helps debugging in terminal

      // ✅ FIX: Catch Duplicate Email Error (Postgres Code 23505)
      // We check for the code '23505' OR the specific constraint name
      if (err.code === '23505' || err.constraint === 'users_email_key') {
          return res.status(400).json({ message: "Email already exists" });
      }

      // Fallback: Check the error message text
      if (err.message && err.message.includes("duplicate key")) {
          return res.status(400).json({ message: "Email already exists" });
      }

      // Other errors
      res.status(400).json({ message: "Server Error: " + err.message });
    }
  }
);

/**
 * ============================
 * ADMIN: VIEW ALL USERS
 * ============================
 */
router.get(
  "/users",
  authMiddleware,
  rbacMiddleware("admin.view"),
  async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT 
          u.id,
          u.name,
          u.email,
          r.name AS role
        FROM users u
        JOIN roles r ON u.role_id = r.id
        WHERE r.name != 'admin'
        ORDER BY u.id
      `);

      res.json({
        message: "Users fetched successfully ✅",
        users: result.rows,
      });
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  }
);

/**
 * ============================
 * ADMIN: UPDATE USER
 * ============================
 */
router.put(
  "/users/:id",
  authMiddleware,
  rbacMiddleware("admin.update"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { name, email, role } = req.body;

      if (!name && !email && !role) {
        return res.status(400).json({
          message: "At least one field is required to update",
        });
      }

      const fields = [];
      const values = [];
      let index = 1;

      if (name) {
        fields.push(`name = $${index++}`);
        values.push(name);
      }

      if (email) {
        fields.push(`email = $${index++}`);
        values.push(email);
      }

      if (role) {
        const roleResult = await pool.query(
          "SELECT id FROM roles WHERE name = $1",
          [role]
        );

        if (roleResult.rows.length === 0) {
          return res.status(400).json({ message: "Invalid role" });
        }

        fields.push(`role_id = $${index++}`);
        values.push(roleResult.rows[0].id);
      }

      values.push(id);

      const query = `
        UPDATE users
        SET ${fields.join(", ")}
        WHERE id = $${index}
      `;

      await pool.query(query, values);

      res.json({ message: "User updated successfully ✅" });
    } catch (err) {
      // ✅ FIX: Also handle duplicates during Update
      if (err.code === '23505' || err.constraint === 'users_email_key') {
          return res.status(400).json({ message: "Email already exists" });
      }
      console.error(err);
      res.status(500).json({ message: "Failed to update user" });
    }
  }
);


/**
 * ============================
 * ADMIN: DELETE USER
 * ============================
 */
router.delete(
  "/users/:id",
  authMiddleware,
  rbacMiddleware("admin.delete"),
  async (req, res) => {
    try {
      const { id } = req.params;

      await pool.query("DELETE FROM users WHERE id = $1", [id]);

      res.json({ message: "User deleted successfully by admin ✅" });
    } catch (err) {
      res.status(500).json({ message: "Failed to delete user" });
    }
  }
);

module.exports = router;