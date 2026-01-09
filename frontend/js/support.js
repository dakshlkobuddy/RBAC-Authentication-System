const API_URL = "http://localhost:3000";
const token = localStorage.getItem("token");
let allTickets = []; // Store tickets globally to access data easily

// 1. Security Check
if (!token) {
    window.location.href = "login.html";
}

// Display User Role & Admin Back Button
try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    document.getElementById("userEmailDisplay").innerText = payload.role.toUpperCase();

    if (payload.role === 'admin') {
        const backBtn = document.getElementById("backToAdminBtn");
        if (backBtn) backBtn.style.display = "inline-flex";
    }
} catch (e) {
    console.error("Token decode failed");
}

// 2. Fetch & Display Tickets
async function fetchTickets() {
    const tbody = document.getElementById("ticketTableBody");
    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-4">Loading...</td></tr>`;

    try {
        const res = await fetch(`${API_URL}/support/tickets`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (res.status === 403) {
            alert("Access Denied.");
            window.location.href = "login.html";
            return;
        }

        const data = await res.json();
        allTickets = data.data || []; // Save to global variable

        if (allTickets.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-3">No tickets found. Good job! 🎉</td></tr>`;
            return;
        }

        tbody.innerHTML = allTickets.map(ticket => {
            const statusClass = ticket.status === 'open' ? 'status-open' : 'status-resolved';
            
            return `
            <tr>
                <td class="ps-4 fw-bold">#${ticket.id}</td>
                <td>
                    <div class="fw-bold">${ticket.contact_name}</div>
                    <div class="text-muted small">${ticket.contact_email}</div>
                </td>
                <td style="max-width: 350px;">
                    <div class="text-dark mb-1 fw-bold small">${ticket.subject || "No Subject"}</div>
                    <div class="text-secondary mb-2" style="font-size: 0.9rem;">${ticket.issue}</div>
                    ${ticket.ai_response ? `<div class="p-2 bg-light border rounded small text-muted fst-italic"><i class="bi bi-robot me-1"></i> "${ticket.ai_response.substring(0, 60)}..."</div>` : ''}
                </td>
                <td><span class="${statusClass}">${ticket.status.toUpperCase()}</span></td>
                <td class="text-end pe-4">
                    ${ticket.status === 'open' ? `
                        <button class="btn btn-sm btn-outline-primary shadow-sm" onclick="openReplyModal(${ticket.id})">
                            <i class="bi bi-reply-fill"></i> Reply
                        </button>
                    ` : `
                        <span class="text-success small fw-bold"><i class="bi bi-check-circle-fill"></i> Resolved</span>
                    `}
                </td>
            </tr>
            `;
        }).join("");

    } catch (err) {
        console.error(err);
        tbody.innerHTML = `<tr><td colspan="5" class="text-danger text-center">Error loading tickets. Check console.</td></tr>`;
    }
}

// 3. Open Modal & Load AI Draft
const replyModal = new bootstrap.Modal(document.getElementById('replyModal'));

function openReplyModal(id) {
    // Find the specific ticket data from our global array
    const ticket = allTickets.find(t => t.id === id);
    if (!ticket) return;

    document.getElementById("replyTicketId").value = id;
    document.getElementById("replyEmail").innerText = ticket.contact_email;
    
    // Pre-fill the textarea with the AI Draft
    document.getElementById("replyMessage").value = ticket.ai_response || "Hi, \n\nWe have received your request and are looking into it.\n\nBest regards,\nSupport Team";
    
    replyModal.show();
}

// 4. Send Reply Logic
async function sendReply() {
    const id = document.getElementById("replyTicketId").value;
    const message = document.getElementById("replyMessage").value;
    
    if(!message.trim()) {
        alert("Please write a message!");
        return;
    }

    if(!confirm("Are you sure you want to send this email and close the ticket?")) return;

    try {
        const res = await fetch(`${API_URL}/support/tickets/${id}/reply`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}` 
            },
            body: JSON.stringify({ message })
        });

        if (res.ok) {
            alert("✅ Reply sent successfully! Ticket marked as Resolved.");
            replyModal.hide();
            fetchTickets(); // Refresh table
        } else {
            const err = await res.json();
            alert("❌ Failed to send: " + err.message);
        }
    } catch (err) {
        console.error(err);
        alert("Error connecting to server.");
    }
}

// 5. Logout Logic
document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "login.html";
});

// Initialize
fetchTickets();