// ✅ FIXED: Point to Backend
const API_URL = "http://localhost:3000";
const token = localStorage.getItem("token");

if (!token) window.location.href = "login.html";

// ... [Keep your existing Toggle Logic] ...
const toggleBtn = document.getElementById("toggleUserFormBtn");
const cancelBtn = document.getElementById("cancelBtn");
const formCard = document.getElementById("createUserCard");

if (toggleBtn && formCard) {
    toggleBtn.addEventListener("click", () => {
        formCard.style.display = "block";
        toggleBtn.style.display = "none";
    });
    if (cancelBtn) {
        cancelBtn.addEventListener("click", () => {
            formCard.style.display = "none";
            toggleBtn.style.display = "block";
        });
    }
}

function isValidEmail(email) {
    const re = /^(?=.{1,64}@)[a-zA-Z0-9]+(?:[._-][a-zA-Z0-9]+)*@[a-zA-Z]+(?:-[a-zA-Z]+)*\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase());
}

function isValidName(name) {
    const re = /^[a-zA-Z\s'-]{2,50}$/;
    return re.test(name.trim());
}

document.getElementById("createUserForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const role = document.getElementById("role").value;
    const msgBox = document.getElementById("msgBox");

    msgBox.innerHTML = `<div class="alert alert-info">Processing...</div>`;

    if (!isValidName(name)) { msgBox.innerHTML = `<div class="alert alert-warning">Invalid Name!</div>`; return; }
    if (!isValidEmail(email)) { msgBox.innerHTML = `<div class="alert alert-warning">Invalid Email!</div>`; return; }

    try {
        const res = await fetch(`${API_URL}/admin/users`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({ name, email, role })
        });
        const data = await res.json();

        if (res.ok) {
            msgBox.innerHTML = `<div class="alert alert-success">${data.message}</div>`;
            document.getElementById("createUserForm").reset();
            fetchUsers();
            setTimeout(() => {
                msgBox.innerHTML = "";
                if(formCard) { formCard.style.display = "none"; toggleBtn.style.display = "block"; }
            }, 2000);
        } else {
            msgBox.innerHTML = `<div class="alert alert-danger">${data.message}</div>`;
        }
    } catch (err) {
        console.error(err);
        msgBox.innerHTML = `<div class="alert alert-danger">Error connecting to server</div>`;
    }
});

async function fetchUsers() {
    try {
        const res = await fetch(`${API_URL}/admin/users`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        const tbody = document.getElementById("userTableBody");

        if (!data.users || data.users.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4">No users found.</td></tr>`;
            return;
        }

        tbody.innerHTML = data.users.map((user, index) => `
            <tr>
                <td class="ps-4">${index + 1}</td>
                <td class="fw-bold">${user.name}</td>
                <td>${user.email}</td>
                <td><span class="badge bg-${user.role === 'finance' ? 'success' : 'info'} text-uppercase">${user.role}</span></td>
                <td class="text-end pe-4">
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteUser(${user.id})"><i class="bi bi-trash"></i> Delete</button>
                </td>
            </tr>
        `).join("");
    } catch (err) { console.error("Failed to load users", err); }
}

async function deleteUser(id) {
    if(!confirm("Are you sure?")) return;
    try {
        const res = await fetch(`${API_URL}/admin/users/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) fetchUsers();
        else alert("Failed to delete user");
    } catch (err) { console.error(err); }
}

document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "login.html";
});

fetchUsers();