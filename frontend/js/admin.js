const API_URL = "http://localhost:3000";
const token = localStorage.getItem("token");

// Redirect if not logged in
if (!token) window.location.href = "login.html";

// --- Create User Logic ---
document.getElementById("createUserForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const role = document.getElementById("role").value;
    const msgBox = document.getElementById("msgBox");

    msgBox.innerHTML = "";

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
            msgBox.innerHTML = `<div class="alert alert-success">${data.message}</div>`;
            document.getElementById("createUserForm").reset();
            setTimeout(() => { msgBox.innerHTML = ""; }, 2000);
        } else {
            msgBox.innerHTML = `<div class="alert alert-danger">${data.message}</div>`;
            setTimeout(() => { msgBox.innerHTML = ""; }, 3000);
        }
    } catch (err) {
        console.error(err);
        msgBox.innerHTML = `<div class="alert alert-danger">Error connecting to server</div>`;
        setTimeout(() => { msgBox.innerHTML = ""; }, 3000);
    }
});

// --- Logout Logic ---
document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "login.html";
});