const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const rbacMiddleware = require("../middlewares/rbac.middleware");
const pool = require("../config/database");

// GET DATA
router.get("/data", authMiddleware, rbacMiddleware("marketing.read"), async (req, res) => {
    try {
        let result;
        if(req.user.role === 'admin'){
            result = await pool.query("SELECT * FROM marketing_data ORDER BY created_at DESC");
        } else {
            // ✅ FIXED: req.user.id
            result = await pool.query("SELECT * FROM marketing_data WHERE created_by = $1 ORDER BY created_at DESC", [req.user.id]);
        }
        res.json({ message: "Success", data: result.rows });
    } catch(err) { res.status(500).json({message: "Server Error"}); }
});

// CREATE DATA
router.post("/data", authMiddleware, rbacMiddleware("marketing.create"), async (req, res) => {
    try {
        const { message } = req.body;
        // ✅ FIXED: req.user.id
        const result = await pool.query("INSERT INTO marketing_data (message, created_by) VALUES ($1, $2) RETURNING *", [message, req.user.id]);
        res.json({ message: "Created", createdData: result.rows[0] });
    } catch(err) { res.status(500).json({message: "Server Error"}); }
});

// UPDATE DATA
router.put("/data/:id", authMiddleware, rbacMiddleware("marketing.update"), async (req, res) => {
    try {
        const { id } = req.params; const { message } = req.body;
        const exist = await pool.query("SELECT * FROM marketing_data WHERE id=$1", [id]);
        if(exist.rowCount===0) return res.status(404).json({message:"Not found"});
        
        // ✅ FIXED: req.user.id
        if(req.user.role !== 'admin' && exist.rows[0].created_by !== req.user.id) return res.status(403).json({message:"Not allowed"});
        
        const updated = await pool.query("UPDATE marketing_data SET message=$1 WHERE id=$2 RETURNING *", [message, id]);
        res.json({ message: "Updated", updatedData: updated.rows[0] });
    } catch(err) { res.status(500).json({message: "Server Error"}); }
});

// DELETE DATA
router.delete("/data/:id", authMiddleware, rbacMiddleware("marketing.delete"), async (req, res) => {
    try {
        const { id } = req.params;
        const exist = await pool.query("SELECT * FROM marketing_data WHERE id=$1", [id]);
        if(exist.rowCount===0) return res.status(404).json({message:"Not found"});
        
        // ✅ FIXED: req.user.id
        if(req.user.role !== 'admin' && exist.rows[0].created_by !== req.user.id) return res.status(403).json({message:"Not allowed"});
        
        await pool.query("DELETE FROM marketing_data WHERE id=$1", [id]);
        res.json({ message: "Deleted", deletedId: id });
    } catch(err) { res.status(500).json({message: "Server Error"}); }
});

module.exports = router;