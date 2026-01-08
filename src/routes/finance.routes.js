const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const rbacMiddleware = require("../middlewares/rbac.middleware");
const pool = require("../config/database");

/**
 * ============================
 * GET: View Finance Data
 * Permission: 'finance.read'
 * ============================
 */
router.get(
  "/data",
  authMiddleware,
  rbacMiddleware("finance.read"), // ✅ FIXED: 'read' permission
  async (req, res) => {
    try {
      let result;
      // Admin sees ALL records
      if(req.user.role === 'admin'){
        result = await pool.query(
          "SELECT * FROM finance_data ORDER BY created_at DESC"
        );
      } else {
        // ✅ FIXED: Uses req.user.id to find YOUR records
        result = await pool.query(
          "SELECT * FROM finance_data WHERE created_by = $1 ORDER BY created_at DESC",
          [req.user.id] 
        );
      }

      res.json({
        message: "Finance data fetched successfully ✅",
        data: result.rows,
      });
    } catch (err) {
      console.error("Finance GET Error:", err);
      res.status(500).json({ message: "Server Error fetching data" });
    }
  }
);

/**
 * ============================
 * POST: Create Finance Data
 * Permission: 'finance.create'
 * ============================
 */
router.post(
  "/data",
  authMiddleware,
  rbacMiddleware("finance.create"),
  async (req, res) => {
    try {
      const { message } = req.body;

      if (!message) {
          return res.status(400).json({ message: "Message is required" });
      }

      // ✅ FIXED: Uses req.user.id to save correct owner
      const result = await pool.query(
        `
        INSERT INTO finance_data (message, created_by)
        VALUES ($1, $2)
        RETURNING *
        `,
        [message, req.user.id]
      );

      res.json({
        message: "Finance data created successfully ✅",
        createdData: result.rows[0],
      });
    } catch (err) {
      console.error("Finance POST Error:", err);
      res.status(500).json({ message: "Failed to add record" });
    }
  }
);

/**
 * ============================
 * PUT: Update Finance Data
 * Permission: 'finance.update'
 * ============================
 */
router.put(
  "/data/:id",
  authMiddleware,
  rbacMiddleware("finance.update"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { message } = req.body;

      const existing = await pool.query("SELECT * FROM finance_data WHERE id = $1", [id]);
      if (existing.rows.length === 0) {
        return res.status(404).json({ message: "Record not found ❌" });
      }

      const record = existing.rows[0];
      
      // ✅ FIXED: Checks req.user.id
      if (req.user.role !== "admin" && record.created_by !== req.user.id) {
        return res.status(403).json({ message: "Not allowed to edit this record" });
      }

      const updated = await pool.query(
        "UPDATE finance_data SET message = $1 WHERE id = $2 RETURNING *",
        [message, id]
      );

      res.json({
        message: "Updated successfully ✅",
        updatedData: updated.rows[0],
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server Error" });
    }
  }
);

/**
 * ============================
 * DELETE: Delete Finance Data
 * Permission: 'finance.delete'
 * ============================
 */
router.delete(
  "/data/:id",
  authMiddleware,
  rbacMiddleware("finance.delete"),
  async (req, res) => {
    try {
      const { id } = req.params;

      const existing = await pool.query("SELECT * FROM finance_data WHERE id = $1", [id]);
      if (existing.rows.length === 0) {
        return res.status(404).json({ message: "Record not found ❌" });
      }

      const record = existing.rows[0];
      
      // ✅ FIXED: Checks req.user.id
      if (req.user.role !== "admin" && record.created_by !== req.user.id) {
        return res.status(403).json({ message: "Not allowed to delete this record" });
      }

      await pool.query("DELETE FROM finance_data WHERE id = $1", [id]);

      res.json({ message: "Deleted successfully ✅", deletedId: id });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server Error" });
    }
  }
);

module.exports = router;