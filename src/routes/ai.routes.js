const express = require("express");
const router = express.Router();
const pool = require("../config/database");
const aiService = require("../services/ai.service");

router.post("/incoming", async (req, res) => {
  const { email, name, message, subject } = req.body;

  try {
    // 1. Get Analysis from Service
    const analysis = await aiService.analyzeRequest(email, name || "Unknown", message, subject || "");

    // 🔬 DEBUG LOG: Check your terminal when you send a message!
    console.log("------------------------------------------------");
    console.log("🧠 AI SERVICE OUTPUT:", analysis); 
    console.log("------------------------------------------------");

    // 2. Save to Database
    if (analysis.intent === "support") {
      await pool.query(
        "INSERT INTO support_tickets (contact_id, issue, subject, priority, ai_response, status) VALUES ($1, $2, $3, 'medium', $4, 'open')",
        [analysis.contactId, message, subject || "No Subject", analysis.aiDraft]
      );
    } else {
      await pool.query(
        "INSERT INTO enquiries (contact_id, message, subject, ai_response, status) VALUES ($1, $2, $3, $4, 'new')",
        [analysis.contactId, message, subject || "General Enquiry", analysis.aiDraft]
      );
    }

    // 3. Send Response to Frontend (Ensuring names match!)
    res.json({ 
        success: true, 
        action: analysis.intent === "support" ? "Ticket Created" : "Enquiry Logged",
        
        // 👉 THIS IS THE FIX: We map 'clientType' to 'client_type'
        client_type: analysis.clientType || "Unknown", 
        
        ai_draft: analysis.aiDraft
    });

  } catch (error) {
    console.error("❌ AI ROUTE ERROR:", error);
    res.status(500).json({ error: "AI Processing Failed" });
  }
});

module.exports = router;