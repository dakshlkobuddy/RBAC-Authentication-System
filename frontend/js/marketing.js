const API_URL = "http://localhost:3000";
const token = localStorage.getItem("token");
let allLeads = [];

if (!token) window.location.href = "login.html";

// Check for Admin
try {
    const p = JSON.parse(atob(token.split('.')[1]));
    if(p.role === 'admin') document.getElementById('backToAdminBtn').style.display = 'inline-flex';
} catch(e){}

// 1. Fetch AI Leads
async function fetchLeads() {
    try {
        const res = await fetch(`${API_URL}/marketing/enquiries`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        allLeads = data.data || [];
        const tbody = document.getElementById("leadsTableBody");

        if (allLeads.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" class="text-center py-3">No leads yet.</td></tr>`;
            return;
        }

        tbody.innerHTML = allLeads.map(lead => {
            const isNew = lead.status === 'new';
            // Determine Badge Color based on Client Type
            let badgeClass = "bg-secondary";
            if(lead.contact_type === 'new_client') badgeClass = "bg-success";
            if(lead.contact_type === 'old_prospect') badgeClass = "bg-warning text-dark";
            if(lead.contact_type === 'old_client') badgeClass = "bg-primary";

            return `
            <tr>
                <td class="ps-4">
                    <div class="fw-bold">${lead.contact_name}</div>
                    <div class="small text-muted">${lead.contact_email}</div>
                </td>
                <td style="max-width:300px">
                    <div class="text-dark small fw-bold">${lead.subject || "Enquiry"}</div>
                    <div class="text-muted small text-truncate">${lead.message}</div>
                    ${lead.ai_response ? `<div class="p-1 mt-1 bg-light border rounded small fst-italic text-success">🤖 ${lead.ai_response.substring(0,50)}...</div>` : ''}
                </td>
                <td>
                    <span class="badge ${badgeClass}">${lead.contact_type.replace('_', ' ').toUpperCase()}</span>
                </td>
                <td class="text-end pe-4">
                    ${isNew ? 
                        `<button class="btn btn-sm btn-outline-success" onclick="openReplyModal(${lead.id})">Reply</button>` : 
                        `<span class="text-muted small"><i class="bi bi-check-all"></i> Closed</span>`
                    }
                </td>
            </tr>
            `;
        }).join("");
    } catch (err) { console.error(err); }
}

// 2. Reply Modal Logic
const replyModal = new bootstrap.Modal(document.getElementById('replyModal'));

function openReplyModal(id) {
    const lead = allLeads.find(l => l.id === id);
    if(!lead) return;

    document.getElementById("replyId").value = id;
    document.getElementById("replyEmail").innerText = lead.contact_email;
    document.getElementById("replyMessage").value = lead.ai_response || "Hi, thanks for your interest!";
    replyModal.show();
}

async function sendReply() {
    const id = document.getElementById("replyId").value;
    const message = document.getElementById("replyMessage").value;
    
    if(!confirm("Send reply?")) return;

    try {
        const res = await fetch(`${API_URL}/marketing/enquiries/${id}/reply`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({ message })
        });
        if(res.ok) {
            alert("Sent!");
            replyModal.hide();
            fetchLeads();
        } else {
            alert("Error sending email");
        }
    } catch(err) { console.error(err); }
}

// 3. Campaign Logic (Old)
async function fetchCampaigns() {
    try {
        const res = await fetch(`${API_URL}/marketing/data`, { headers: { "Authorization": `Bearer ${token}` } });
        const data = await res.json();
        document.getElementById("campaignList").innerHTML = data.data.map(item => `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                ${item.message}
                <button class="btn btn-sm btn-outline-danger" onclick="deleteCampaign(${item.id})">Del</button>
            </li>
        `).join("");
    } catch (err) { console.error(err); }
}
document.getElementById("createMarketingForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const message = document.getElementById("marketingMessage").value;
    await fetch(`${API_URL}/marketing/data`, {
        method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ message })
    });
    document.getElementById("marketingMessage").value = "";
    fetchCampaigns();
});
async function deleteCampaign(id) {
    if(!confirm("Delete?")) return;
    await fetch(`${API_URL}/marketing/data/${id}`, { method: "DELETE", headers: { "Authorization": `Bearer ${token}` } });
    fetchCampaigns();
}

document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "login.html";
});

// Load Data
fetchLeads();
fetchCampaigns();