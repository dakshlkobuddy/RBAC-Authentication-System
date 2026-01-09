const API_URL = "http://localhost:3000";
const token = localStorage.getItem("token");

if (!token) window.location.href = "login.html";

async function fetchClients() {
    try {
        const res = await fetch(`${API_URL}/finance/clients`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        const tbody = document.getElementById("clientTableBody");

        if (!data.data || data.data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center py-3">No clients found yet.</td></tr>`;
            return;
        }

        tbody.innerHTML = data.data.map(client => `
            <tr>
                <td class="ps-4 fw-bold">${client.name}</td>
                <td class="text-muted">${client.domain || "N/A"}</td>
                <td>
                    <span class="badge ${client.status === 'client' ? 'bg-success' : 'bg-secondary'}">
                        ${client.status.toUpperCase()}
                    </span>
                </td>
                <td>${new Date(client.created_at).toLocaleDateString()}</td>
                <td class="text-end pe-4">
                    <button class="btn btn-sm btn-outline-dark" onclick="alert('Generate Invoice for ${client.name}')">
                        Generate Invoice
                    </button>
                </td>
            </tr>
        `).join("");
    } catch (err) {
        console.error(err);
    }
}

document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "login.html";
});

fetchClients();