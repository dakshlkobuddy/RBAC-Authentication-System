// ✅ FIXED: Points to Backend Port 3000
const API_URL = "http://localhost:3000"; 
const token = localStorage.getItem("token");

// 1. Security Check
if (!token) {
    window.location.href = "login.html";
}

// Decode token
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

// 2. Fetch & Display Data
async function fetchFinanceData() {
    try {
        const res = await fetch(`${API_URL}/finance/data`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        const tbody = document.getElementById("financeTableBody");

        tbody.innerHTML = "";

        if (!data.data || data.data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted py-3">No records found. Add one above!</td></tr>`;
            return;
        }

        tbody.innerHTML = data.data.map((item, index) => `
            <tr>
                <td class="ps-4 fw-bold text-secondary">${index + 1}</td>
                <td>${item.message}</td>
                <td class="text-muted small">${new Date(item.created_at).toLocaleString()}</td>
                <td class="text-end pe-4">
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="openEditModal(${item.id}, '${item.message}')">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteRecord(${item.id})">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `).join("");

    } catch (err) {
        console.error(err);
        document.getElementById("financeTableBody").innerHTML = `<tr><td colspan="4" class="text-danger text-center">Error loading data</td></tr>`;
    }
}

// 3. Create Record
document.getElementById("createFinanceForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const messageInput = document.getElementById("financeMessage");
    const msgBox = document.getElementById("msgBox");

    try {
        const res = await fetch(`${API_URL}/finance/data`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}` 
            },
            body: JSON.stringify({ message: messageInput.value })
        });

        if (res.ok) {
            messageInput.value = ""; 
            fetchFinanceData(); // Refresh list immediately
            msgBox.innerHTML = `<span class="text-success small fw-bold">Record Added!</span>`;
            setTimeout(() => msgBox.innerHTML = "", 3000);
        } else {
            const err = await res.json();
            msgBox.innerHTML = `<span class="text-danger small fw-bold">${err.message || "Failed"}</span>`;
        }
    } catch (err) {
        console.error(err);
        msgBox.innerHTML = `<span class="text-danger small fw-bold">Server Error</span>`;
    }
});

// 4. Delete Record
async function deleteRecord(id) {
    if(!confirm("Are you sure?")) return;
    try {
        const res = await fetch(`${API_URL}/finance/data/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) fetchFinanceData();
        else alert("Failed to delete");
    } catch (err) { console.error(err); }
}

// 5. Update Record
const editModal = new bootstrap.Modal(document.getElementById('editModal'));
window.openEditModal = (id, currentMessage) => {
    document.getElementById("editId").value = id;
    document.getElementById("editMessage").value = currentMessage;
    editModal.show();
};

document.getElementById("saveEditBtn").addEventListener("click", async () => {
    const id = document.getElementById("editId").value;
    const newMessage = document.getElementById("editMessage").value;
    try {
        const res = await fetch(`${API_URL}/finance/data/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({ message: newMessage })
        });
        if (res.ok) { editModal.hide(); fetchFinanceData(); }
        else alert("Failed to update");
    } catch (err) { console.error(err); }
});

document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "login.html";
});

fetchFinanceData();