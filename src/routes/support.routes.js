const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const rbacMiddleware = require("../middlewares/rbac.middleware");
const pool = require("../config/database");
const { sendEmail } = require("../services/mail.service"); // Import the mailer

// --- 1. GET ALL TICKETS (Inbox) ---
// Requires 'ticket.read' permission
router.get("/tickets", authMiddleware, rbacMiddleware("ticket.read"), async (req, res) => {
    try {
        // Fetch tickets with Contact info
        const query = `
            SELECT t.id, t.issue, t.subject, t.priority, t.status, t.ai_response, t.created_at, 
                   c.name as contact_name, c.email as contact_email
            FROM support_tickets t
            JOIN contacts c ON t.contact_id = c.id
            ORDER BY 
                CASE WHEN t.status = 'open' THEN 1 ELSE 2 END, -- Show Open first
                t.created_at DESC
        `;
        const result = await pool.query(query);
        res.json({ message: "Success", data: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
});

// --- 2. RESOLVE TICKET (Action) ---
// Requires 'ticket.reply' permission
router.put("/tickets/:id/resolve", authMiddleware, rbacMiddleware("ticket.reply"), async (req, res) => {
    try {
        const { id } = req.params;
        
        const exist = await pool.query("SELECT * FROM support_tickets WHERE id=$1", [id]);
        if (exist.rowCount === 0) return res.status(404).json({ message: "Ticket not found" });

        const updated = await pool.query(
            "UPDATE support_tickets SET status = 'resolved' WHERE id = $1 RETURNING *", 
            [id]
        );
        
        res.json({ message: "Ticket Resolved", updatedData: updated.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
});

// --- 3. SEND REPLY (The New Feature) ---
// Requires 'ticket.reply' permission
router.post("/tickets/:id/reply", authMiddleware, rbacMiddleware("ticket.reply"), async (req, res) => {
    try {
        const { id } = req.params;
        const { message } = req.body; // The edited AI draft

        // 1. Get Ticket Details
        const ticket = await pool.query(
            "SELECT t.subject, c.email, c.name FROM support_tickets t JOIN contacts c ON t.contact_id = c.id WHERE t.id = $1", 
            [id]
        );

        if (ticket.rows.length === 0) return res.status(404).json({ message: "Ticket not found" });
        const { email, name, subject } = ticket.rows[0];

        // 2. Send Email
        const emailSent = await sendEmail(
            email, 
            `Re: ${subject || "Support Ticket"}`, 
            `<p>Hi ${name},</p><p>${message}</p><p>Best,<br>Support Team</p>`
        );

        if (!emailSent) return res.status(500).json({ message: "Failed to send email" });

        // 3. Update Database (Close Ticket & timestamp)
        await pool.query(
            "UPDATE support_tickets SET status = 'resolved', last_response_time = NOW() WHERE id = $1", 
            [id]
        );

        res.json({ message: "Reply Sent & Ticket Resolved" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;