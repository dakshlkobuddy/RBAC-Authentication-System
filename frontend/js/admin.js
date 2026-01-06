const API_URL = "http://localhost:3000";
const token = localStorage.getItem("token");

// 1. Redirect if not logged in
if (!token) window.location.href = "login.html";

// ==========================================
// ✅ TOGGLE FORM LOGIC (Fixes the button issue)
// ==========================================
const toggleBtn = document.getElementById("toggleUserFormBtn");
const cancelBtn = document.getElementById("cancelBtn");
const formCard = document.getElementById("createUserCard");

// Only run if elements exist to prevent errors
if (toggleBtn && formCard) {
    // Show Form when "Create New User" is clicked
    toggleBtn.addEventListener("click", () => {
        formCard.style.display = "block"; 
        toggleBtn.style.display = "none"; // Hide the big button while form is open
    });

    // Hide Form when "Cancel" is clicked
    if (cancelBtn) {
        cancelBtn.addEventListener("click", () => {
            formCard.style.display = "none";
            toggleBtn.style.display = "block"; // Show the big button again
        });
    }
}

// ==========================================
// CREATE USER LOGIC
// ==========================================
document.getElementById("createUserForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const role = document.getElementById("role").value;
    const msgBox = document.getElementById("msgBox");

    msgBox.innerHTML = `<div class="alert alert-info">Processing...</div>`;

    try {
        const res = await fetch(`${API_URL}/admin/users`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}` 
            },
            body: JSON.stringify({ name, email, role })
        });

        const data = await res.json();

        if (res.ok) {
            // Success
            msgBox.innerHTML = `<div class="alert alert-success">${data.message}</div>`;
            document.getElementById("createUserForm").reset();
            
            // Refresh the user list immediately
            fetchUsers(); 
            
            // Optional: Auto-hide the form after 2 seconds
            setTimeout(() => {
                msgBox.innerHTML = "";
                if(formCard) {
                    formCard.style.display = "none";
                    toggleBtn.style.display = "block";
                }
            }, 2000);
        } else {
            // Error from backend
            msgBox.innerHTML = `<div class="alert alert-danger">${data.message}</div>`;
        }
    } catch (err) {
        console.error(err);
        msgBox.innerHTML = `<div class="alert alert-danger">Error connecting to server</div>`;
    }
});

// ==========================================
// FETCH & DISPLAY USERS LOGIC
// ==========================================
async function fetchUsers() {
    try {
        const res = await fetch(`${API_URL}/admin/users`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        const tbody = document.getElementById("userTableBody");

        // If no users found (or empty array)
        if (!data.users || data.users.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4">No users found.</td></tr>`;
            return;
        }

        // Render rows
        tbody.innerHTML = data.users.map((user, index) => `
            <tr>
                <td class="ps-4">${index + 1}</td>
                <td class="fw-bold">${user.name}</td>
                <td>${user.email}</td>
                <td>
                    <span class="badge bg-${user.role === 'finance' ? 'success' : 'info'} text-uppercase">
                        ${user.role}
                    </span>
                </td>
                <td class="text-end pe-4">
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteUser(${user.id})">
                        <i class="bi bi-trash"></i> Delete
                    </button>
                </td>
            </tr>
        `).join("");

    } catch (err) {
        console.error("Failed to load users", err);
        const tbody = document.getElementById("userTableBody");
        if(tbody) tbody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Error loading data</td></tr>`;
    }
}

// ==========================================
// DELETE USER LOGIC
// ==========================================
async function deleteUser(id) {
    if(!confirm("Are you sure you want to delete this user?")) return;

    try {
        const res = await fetch(`${API_URL}/admin/users/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (res.ok) {
            fetchUsers(); // Refresh list to remove deleted user
        } else {
            alert("Failed to delete user");
        }
    } catch (err) {
        console.error(err);
        alert("Error connecting to server");
    }
}

// ==========================================
// LOGOUT LOGIC
// ==========================================
document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "login.html";
});

// Load users when page opens
fetchUsers();