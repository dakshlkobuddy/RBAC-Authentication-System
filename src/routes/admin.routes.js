const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const rbacMiddleware = require("../middlewares/rbac.middleware");
const pool = require("../config/database");
const { createUser } = require("../services/user.service");

// CREATE USER (Invite)
router.post(
  "/users",
  authMiddleware,
  rbacMiddleware("user.create"), // Matches typical 'user.create' permission
  async (req, res) => {
    try {
      const { name, email, role } = req.body;

      if (!name || !email || !role) return res.status(400).json({ message: "All fields required" });

      const emailRegex = /^(?=.{1,64}@)[a-zA-Z0-9]+(?:[._-][a-zA-Z0-9]+)*@[a-zA-Z]+(?:-[a-zA-Z]+)*\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(email)) return res.status(400).json({ message: "Invalid email format" });

      await createUser(name, email, role);

      res.json({ message: "User created & invite sent ✅" });
    } catch (err) {
      console.error(err);
      if (err.code === '23505' || (err.message && err.message.includes("duplicate"))) {
          return res.status(400).json({ message: "Email already exists" });
      }
      res.status(400).json({ message: "Server Error" });
    }
  }
);

// VIEW USERS
router.get(
  "/users",
  authMiddleware,
  rbacMiddleware("admin.read"), // ✅ FIXED: 'read' instead of 'view'
  async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT u.id, u.name, u.email, r.name AS role
        FROM users u
        JOIN roles r ON u.role_id = r.id
        WHERE r.name != 'admin'
        ORDER BY u.id
      `);
      res.json({ users: result.rows });
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  }
);

// UPDATE USER
router.put(
  "/users/:id",
  authMiddleware,
  rbacMiddleware("admin.update"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { name, email, role } = req.body;
      
      const fields = []; const values = []; let index = 1;
      if (name) { fields.push(`name=$${index++}`); values.push(name); }
      if (email) { fields.push(`email=$${index++}`); values.push(email); }
      if (role) {
        const rRes = await pool.query("SELECT id FROM roles WHERE name=$1", [role]);
        if(rRes.rowCount===0) return res.status(400).json({message:"Invalid role"});
        fields.push(`role_id=$${index++}`); values.push(rRes.rows[0].id);
      }
      values.push(id);
      
      await pool.query(`UPDATE users SET ${fields.join(", ")} WHERE id=$${index}`, values);
      res.json({ message: "User updated successfully ✅" });
    } catch (err) {
      if (err.code === '23505') return res.status(400).json({ message: "Email already exists" });
      res.status(500).json({ message: "Failed to update" });
    }
  }
);

// DELETE USER
router.delete(
  "/users/:id",
  authMiddleware,
  rbacMiddleware("admin.delete"),
  async (req, res) => {
    try {
      await pool.query("DELETE FROM users WHERE id = $1", [req.params.id]);
      res.json({ message: "User deleted successfully ✅" });
    } catch (err) {
      res.status(500).json({ message: "Failed to delete" });
    }
  }
);

module.exports = router;