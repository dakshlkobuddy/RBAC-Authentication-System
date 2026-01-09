document.getElementById('contactForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value;
    const resultBox = document.getElementById('resultBox');

    // Show loading state
    resultBox.style.display = 'block';
    resultBox.innerHTML = '<p class="text-center text-muted">🤖 AI is analyzing your request...</p>';

    try {
        const response = await fetch('http://localhost:3000/ai/incoming', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, subject, message })
        });

        const data = await response.json();
        
        console.log("Frontend Received:", data); // Check console if issues persist

        // --- THE FIX: Check for BOTH naming styles ---
        // If backend sends 'client_type', use it. If it sends 'clientType', use that.
        const rawClientType = data.client_type || data.clientType || "Unknown";
        
        // Clean up the text (remove underscores, make uppercase)
        const displayClientType = rawClientType.replace(/_/g, ' ').toUpperCase();

        // Determine badge colors
        const intentClass = data.action && data.action.includes("Ticket") ? "tag-support" : "tag-enquiry";
        const intentLabel = data.action && data.action.includes("Ticket") ? "SUPPORT TICKET" : "SALES ENQUIRY";

        // Update UI
        resultBox.innerHTML = `
            <h5 class="fw-bold mb-3">🧠 AI Analysis Result:</h5>
            <p><strong>Intent:</strong> <span class="tag ${intentClass}">${intentLabel}</span></p>
            <p><strong>Client Status:</strong> <span class="tag tag-client">${displayClientType}</span></p>
            <p><strong>Action:</strong> ${data.action}</p>
            <hr>
            <p class="small text-muted mb-0"><strong>🤖 AI Draft:</strong> ${data.ai_draft}</p>
        `;

    } catch (error) {
        console.error(error);
        resultBox.innerHTML = `<p class="text-danger text-center">Error connecting to server.</p>`;
    }
});