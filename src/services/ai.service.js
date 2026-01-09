const { NlpManager } = require('node-nlp');
const pool = require('../config/database');

const manager = new NlpManager({ languages: ['en'], forceNER: true });

async function trainModel() {
    manager.addDocument('en', 'not working', 'support');
    manager.addDocument('en', 'login failed', 'support');
    manager.addDocument('en', 'system error', 'support');
    manager.addDocument('en', 'bug', 'support');
    
    manager.addDocument('en', 'pricing', 'enquiry');
    manager.addDocument('en', 'quote', 'enquiry');
    manager.addDocument('en', 'demo', 'enquiry');
    manager.addDocument('en', 'buy', 'enquiry');
    
    await manager.train();
    manager.save();
    console.log('🧠 AI Brain Ready!');
}
trainModel();

const aiService = {
  analyzeRequest: async (email, name, message, subject = "") => {
    
    const emailDomain = email.split('@')[1]; 
    const fullText = (subject + " " + message).toLowerCase();

    // 1. Initialize Default
    let clientType = 'new_client'; 
    let companyId = null;
    let contactId = null;

    // 2. Handle Company
    const companyRes = await pool.query("SELECT id, status FROM companies WHERE domain = $1", [emailDomain]);
    
    if (companyRes.rows.length > 0) {
        companyId = companyRes.rows[0].id;
        if (companyRes.rows[0].status === 'client') clientType = 'old_client';
    } else {
        const newComp = await pool.query(
            "INSERT INTO companies (name, domain, status) VALUES ($1, $2, 'prospect') RETURNING id",
            [emailDomain.split('.')[0], emailDomain] 
        );
        companyId = newComp.rows[0].id;
    }

    // 3. Handle Contact
    const contactRes = await pool.query("SELECT id FROM contacts WHERE email = $1", [email]);

    if (contactRes.rows.length > 0) {
        contactId = contactRes.rows[0].id;
        // Check history to decide if they are a "Prospect" or "Client"
        const history = await pool.query(`
            SELECT (SELECT COUNT(*) FROM enquiries WHERE contact_id = $1) as enquiries,
                   (SELECT COUNT(*) FROM support_tickets WHERE contact_id = $1) as tickets
        `, [contactId]);
        
        // If they have history OR their company is a client, mark as old_client
        if (history.rows[0].enquiries > 0 || history.rows[0].tickets > 0 || clientType === 'old_client') {
            clientType = 'old_client';
        } else {
            clientType = 'old_prospect';
        }

        // Update DB
        await pool.query("UPDATE contacts SET contact_type = $1, company_id = $2 WHERE id = $3", [clientType, companyId, contactId]);
    } else {
        const newContact = await pool.query(
            "INSERT INTO contacts (name, email, company_id, contact_type) VALUES ($1, $2, $3, 'new_client') RETURNING id",
            [name, email, companyId]
        );
        contactId = newContact.rows[0].id;
        clientType = 'new_client';
    }

    // 4. Intent Detection
    const nlpResult = await manager.process('en', fullText);
    const intent = nlpResult.intent === 'None' ? 'enquiry' : nlpResult.intent;

    // 5. AI Reply
    let aiDraft = intent === 'support' 
        ? `Hi ${name}, thanks for reporting this. We've opened a ticket.` 
        : `Hi ${name}, thanks for your interest! A sales rep will contact you.`;

    // --- CRITICAL RETURN STATEMENT ---
    return {
        intent,
        clientType, // <--- MUST BE HERE
        contactId,
        companyId,
        aiDraft
    };
  }
};

module.exports = aiService;