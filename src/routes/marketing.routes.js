const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const rbacMiddleware = require("../middlewares/rbac.middleware");
const pool = require("../config/database");

/**
 * ============================
 * GET: View Marketing Data
 * Allowed:
 * - admin
 * - marketing
 */
router.get(
  "/data",
  authMiddleware,
  rbacMiddleware("marketing.view"),
  async (req, res) => {
    let result;
    if(req.user.role === 'admin'){
      result = await pool.query(
        "Select * from marketing_data ORDER BY created_at DESC"
      );
    } else {
      result = await pool.query(
        "select * from marketing_data where created_by = $1 ORDER BY created_at DESC",
        [req.user.userId]
      );
    }

    res.json({
      message: "Marketing data fetched successfully ✅",
      data: result.rows
    });
  }
);

/**
 * ============================
 * POST: Create Marketing Data
 * Allowed:
 * - admin
 * - marketing
 */
router.post(
  "/data",
  authMiddleware,
  rbacMiddleware("marketing.create"),
  async (req, res) => {
    const { message } = req.body;

    const result = await pool.query(
      `
      INSERT INTO marketing_data (message, created_by)
      VALUES ($1, $2)
      RETURNING *
      `,
      [message, req.user.userId]
    );

    res.json({
      message: "Marketing data created successfully ✅",
      createdData: result.rows[0]
    });
  }
);

/**
 * ============================
 * PUT: Update Marketing Data
 * Allowed:
 * - admin
 * - marketing
 */
router.put(
  "/data/:id",
  authMiddleware,
  rbacMiddleware("marketing.update"),
  async (req, res) => {
    const { id } = req.params;
    const { message } = req.body;

    const existing = await pool.query(
      "SELECT * FROM marketing_data WHERE id = $1",
      [id]
    );
    if (existing.rows.length === 0) {
      return res.status(404).json({ message: "Marketing data not found ❌" });
    }

    const record = existing.rows[0];
    if (
      req.user.role !== "admin" &&
      record.created_by !== req.user.userId
    ) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const updated = await pool.query(
      `
      UPDATE marketing_data
      SET message = $1
      WHERE id = $2
      RETURNING *
      `,
      [message, id]
    );

    res.json({
      message: "Marketing data updated successfully ✅",
      id,
      updatedData: updated.rows[0],
    });
  }
);

/**
 * ============================
 * DELETE: Delete Marketing Data
 * Allowed:
 * - admin
 * - marketing
 */
router.delete(
  "/data/:id",
  authMiddleware,
  rbacMiddleware("marketing.delete"),
  async (req, res) => {
    const { id } = req.params;

    const existing = await pool.query(
      "SELECT * FROM marketing_data WHERE id = $1",
      [id]
    );
    if (existing.rows.length === 0) {
      return res.status(404).json({ message: "Marketing data not found ❌" });
    }

    const record = existing.rows[0];
    if (
      req.user.role !== "admin" &&
      record.created_by !== req.user.userId
    ) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await pool.query(
      "DELETE FROM marketing_data WHERE id = $1",
      [id]
    );

    res.json({
      message: "Marketing data deleted successfully ✅",
      deletedId: id
    });
  }
);

module.exports = router;
