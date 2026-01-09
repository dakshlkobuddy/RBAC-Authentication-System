const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const rbacMiddleware = require("../middlewares/rbac.middleware");
const pool = require("../config/database");
const { sendEmail } = require("../services/mail.service");

// --- 1. GET INCOMING LEADS (Inbox) ---
router.get("/enquiries", authMiddleware, rbacMiddleware("enquiry.read"), async (req, res) => {
    try {
        const query = `
            SELECT e.id, e.message, e.subject, e.ai_response, e.status, e.created_at,
                   c.name as contact_name, c.email as contact_email, c.contact_type
            FROM enquiries e
            JOIN contacts c ON e.contact_id = c.id
            ORDER BY 
                CASE WHEN e.status = 'new' THEN 1 ELSE 2 END, 
                e.created_at DESC
        `;
        const result = await pool.query(query);
        res.json({ message: "Success", data: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
});

// --- 2. SEND REPLY (The Voice) ---
router.post("/enquiries/:id/reply", authMiddleware, rbacMiddleware("enquiry.reply"), async (req, res) => {
    try {
        const { id } = req.params;
        const { message } = req.body;

        // Get Lead Details
        const lead = await pool.query(
            "SELECT e.subject, c.email, c.name FROM enquiries e JOIN contacts c ON e.contact_id = c.id WHERE e.id = $1", 
            [id]
        );

        if (lead.rows.length === 0) return res.status(404).json({ message: "Lead not found" });
        const { email, name, subject } = lead.rows[0];

        // Send Email
        const sent = await sendEmail(
            email, 
            `Re: ${subject || "Your Enquiry"}`, 
            `<p>Hi ${name},</p><p>${message}</p><p>Best,<br>Sales Team</p>`
        );

        if (!sent) return res.status(500).json({ message: "Email failed to send" });

        // Update DB (Close Enquiry)
        await pool.query("UPDATE enquiries SET status = 'closed' WHERE id = $1", [id]);

        res.json({ message: "Reply Sent & Lead Closed" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
});

// --- 3. OLD CAMPAIGN ROUTES (Keep these) ---
router.get("/data", authMiddleware, rbacMiddleware("marketing.read"), async (req, res) => {
    try {
        let result;
        if(req.user.role === 'admin'){
            result = await pool.query("SELECT * FROM marketing_data ORDER BY created_at DESC");
        } else {
            result = await pool.query("SELECT * FROM marketing_data WHERE created_by = $1 ORDER BY created_at DESC", [req.user.id]);
        }
        res.json({ message: "Success", data: result.rows });
    } catch(err) { res.status(500).json({message: "Server Error"}); }
});

router.post("/data", authMiddleware, rbacMiddleware("marketing.create"), async (req, res) => {
    try {
        const { message } = req.body;
        const result = await pool.query("INSERT INTO marketing_data (message, created_by) VALUES ($1, $2) RETURNING *", [message, req.user.id]);
        res.json({ message: "Created", createdData: result.rows[0] });
    } catch(err) { res.status(500).json({message: "Server Error"}); }
});

router.delete("/data/:id", authMiddleware, rbacMiddleware("marketing.delete"), async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("DELETE FROM marketing_data WHERE id=$1", [id]);
        res.json({ message: "Deleted", deletedId: id });
    } catch(err) { res.status(500).json({message: "Server Error"}); }
});

module.exports = router;