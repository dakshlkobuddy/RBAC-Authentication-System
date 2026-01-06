const API_URL = "http://localhost:3000";

// --- Eye Icon Logic ---
const passwordInput = document.getElementById('password');
const toggleBtn = document.getElementById('togglePasswordBtn');
const eyeIcon = document.getElementById('eyeIcon');

toggleBtn.addEventListener('click', function() {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    eyeIcon.classList.toggle('bi-eye');
    eyeIcon.classList.toggle('bi-eye-slash');
});

// --- Login Logic ---
document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const alertBox = document.getElementById("alertBox");

    // Clear previous messages
    alertBox.innerHTML = "";

    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (res.ok) {
            // 1. Save token
            localStorage.setItem("token", data.token);
            
            // 2. Show Success Message
            alertBox.innerHTML = `<div class="alert alert-success text-center">Login Successful! ✅</div>`;
            setTimeout(() => { alertBox.innerHTML = ""; }, 3000);

            // 3. Decode token and Redirect based on Role
            const payload = JSON.parse(atob(data.token.split('.')[1]));
            
            setTimeout(() => {
                if (payload.role === 'admin') {
                    window.location.href = "admin.html";
                } else if (payload.role === 'finance') {
                    // Redirect Finance users
                    window.location.href = "finance.html";
                } else if (payload.role === 'marketing') {
                    // ✅ NEW: Redirect Marketing users to their dashboard
                    window.location.href = "marketing.html";
                } else {
                    console.log("Unknown role logged in");
                }
            }, 2000); 

        } else {
            // Show Error
            alertBox.innerHTML = `<div class="alert alert-danger text-center">${data.message}</div>`;
            setTimeout(() => { alertBox.innerHTML = ""; }, 3000);
        }
    } catch (err) {
        console.error(err);
        alertBox.innerHTML = `<div class="alert alert-danger text-center">Failed to connect to server</div>`;
        setTimeout(() => { alertBox.innerHTML = ""; }, 3000);
    }
});