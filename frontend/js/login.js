const API_URL = "http://localhost:3000"; // Update this if deployed

// --- Eye Icon Logic (Toggle Password Visibility) ---
const passwordInput = document.getElementById('password');
const toggleBtn = document.getElementById('togglePasswordBtn');
const eyeIcon = document.getElementById('eyeIcon');

if (toggleBtn) {
    toggleBtn.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        eyeIcon.classList.toggle('bi-eye');
        eyeIcon.classList.toggle('bi-eye-slash');
    });
}

// --- Email Validation Helper ---
function isValidEmail(email) {
    // Checks for: chars + @ + chars + . + 2 or more chars
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase());
}

// --- Login Logic ---
const loginForm = document.getElementById("loginForm");
const loginBtn = document.querySelector("button[type='submit']"); // Select the button

if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault(); // Stop page reload

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const alertBox = document.getElementById("alertBox");

        // Clear previous messages
        alertBox.innerHTML = "";

        // --- 🛑 VALIDATION CHECK ---
        if (!isValidEmail(email)) {
            console.log("Validation Failed: Invalid Email Format");
            alertBox.innerHTML = `<div class="alert alert-warning text-center">Please enter a valid email address</div>`;
            return; 
        }

        // Disable button to prevent double-clicks
        if(loginBtn) {
            loginBtn.disabled = true;
            loginBtn.innerText = "Signing In...";
        }

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
                alertBox.innerHTML = `<div class="alert alert-success text-center">Login Successful! Redirecting...</div>`;

                // 3. Decode token and Redirect
                const payload = JSON.parse(atob(data.token.split('.')[1]));
                
                setTimeout(() => {
                    if (payload.role === 'admin') {
                        window.location.href = "admin.html";
                    } else if (payload.role === 'finance') {
                        window.location.href = "finance.html";
                    } else if (payload.role === 'marketing') {
                        window.location.href = "marketing.html";
                    } else if (payload.role === 'support') {
                        window.location.href = "support.html"; // <-- ADDED THIS
                    } else {
                        console.log("Unknown role logged in");
                        alertBox.innerHTML = `<div class="alert alert-warning text-center">Role not recognized. Contact Admin.</div>`;
                    }
                }, 1000); 

            } else {
                // Backend Error (e.g. Invalid Credentials)
                alertBox.innerHTML = `<div class="alert alert-danger text-center">${data.message}</div>`;
                setTimeout(() => { alertBox.innerHTML = ""; }, 3000);
            }
        } catch (err) {
            console.error(err);
            alertBox.innerHTML = `<div class="alert alert-danger text-center">Failed to connect to server</div>`;
            setTimeout(() => { alertBox.innerHTML = ""; }, 3000);
        } finally {
            // Re-enable button
            if(loginBtn) {
                loginBtn.disabled = false;
                loginBtn.innerText = "Sign In";
            }
        }
    });
}