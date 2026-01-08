const API_URL = "http://localhost:3000";
const token = localStorage.getItem("token");

// 1. Security Check
if (!token) {
    window.location.href = "login.html";
}

// Display User Role
try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    document.getElementById("userEmailDisplay").innerText = payload.role.toUpperCase();

    // ✅ NEW: Show "Back to Admin" button only if user is Admin
    if (payload.role === 'admin') {
        const backBtn = document.getElementById("backToAdminBtn");
        if (backBtn) backBtn.style.display = "inline-flex"; // Make it visible
    }
} catch (e) {
    console.error("Token decode failed");
}

// 2. Fetch & Display Data
async function fetchMarketingData() {
    try {
        // Pointing to the Marketing Route
        const res = await fetch(`${API_URL}/marketing/data`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        const tbody = document.getElementById("marketingTableBody");

        if (data.data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted py-3">No campaigns found. Start one!</td></tr>`;
            return;
        }

        tbody.innerHTML = data.data.map((item, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${item.message}</td>
                <td class="text-muted small">${new Date(item.created_at).toLocaleString()}</td>
                <td class="text-end">
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
        document.getElementById("marketingTableBody").innerHTML = `<tr><td colspan="4" class="text-danger text-center">Error! loading data</td></tr>`;
    }
}

// 3. Create Record
document.getElementById("createMarketingForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const messageInput = document.getElementById("marketingMessage");
    const msgBox = document.getElementById("msgBox");

    try {
        const res = await fetch(`${API_URL}/marketing/data`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}` 
            },
            body: JSON.stringify({ message: messageInput.value })
        });

        if (res.ok) {
            messageInput.value = "";
            fetchMarketingData(); 
            msgBox.innerHTML = `<span class="text-success small fw-bold">Record Added Successfully!</span>`;
        } else {
            msgBox.innerHTML = `<span class="text-danger">Failed to add campaign</span>`;
        }
    } catch (err) {
        console.error(err);
    }
});

// 4. Delete Record
async function deleteRecord(id) {
    if(!confirm("Delete this campaign?")) return;

    try {
        const res = await fetch(`${API_URL}/marketing/data/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (res.ok) {
            fetchMarketingData();
        } else {
            alert("Failed to delete");
        }
    } catch (err) {
        console.error(err);
    }
}

// 5. Update Record (Modal Logic)
const editModal = new bootstrap.Modal(document.getElementById('editModal'));

function openEditModal(id, currentMessage) {
    document.getElementById("editId").value = id;
    document.getElementById("editMessage").value = currentMessage;
    editModal.show();
}

document.getElementById("saveEditBtn").addEventListener("click", async () => {
    const id = document.getElementById("editId").value;
    const newMessage = document.getElementById("editMessage").value;

    try {
        const res = await fetch(`${API_URL}/marketing/data/${id}`, {
            method: "PUT",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}` 
            },
            body: JSON.stringify({ message: newMessage })
        });

        if (res.ok) {
            editModal.hide();
            fetchMarketingData();
        } else {
            alert("Failed to update");
        }
    } catch (err) {
        console.error(err);
    }
});

// 6. Logout
document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "login.html";
});

// Initialize
fetchMarketingData();