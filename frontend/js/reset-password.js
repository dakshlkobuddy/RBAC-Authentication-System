// const API_URL = "http://localhost:3000"; // Update to your Render URL if deployed
// const API_URL = "https://19dc01e0f3ca.ngrok-free.app";
const API_URL = "";

// --- Eye Toggle Helper ---
function setupPasswordToggle(inputId, buttonId, iconId) {
    const input = document.getElementById(inputId);
    const button = document.getElementById(buttonId);
    const icon = document.getElementById(iconId);

    if(button && input && icon) {
        button.addEventListener('click', function() {
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
            icon.classList.toggle('bi-eye');
            icon.classList.toggle('bi-eye-slash');
        });
    }
}

// Initialize Eye Toggles
setupPasswordToggle('password', 'togglePasswordBtn', 'eyeIcon1');
setupPasswordToggle('confirmPassword', 'toggleConfirmBtn', 'eyeIcon2');


// --- 1. Get Token from URL ---
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');
const msgBox = document.getElementById("msgBox");
const submitBtn = document.querySelector("button[type='submit']");

// If link is broken or token missing
if (!token) {
    msgBox.innerHTML = `<div class="alert alert-danger text-center">Invalid or missing token.</div>`;
    submitBtn.disabled = true;
}


// --- 2. Handle Form Submit ---
document.getElementById("resetPasswordForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    // Client-side Validation
    if (password !== confirmPassword) {
        msgBox.innerHTML = `<div class="alert alert-warning text-center">Passwords do not match!</div>`;
        return;
    }

    if (password.length < 6) {
        msgBox.innerHTML = `<div class="alert alert-warning text-center">Password must be at least 6 characters.</div>`;
        return;
    }

    // Show loading state
    submitBtn.disabled = true;
    submitBtn.innerText = "Updating...";
    msgBox.innerHTML = "";

    try {
        // Reuse the existing /set-password endpoint
        const res = await fetch(`${API_URL}/auth/set-password/${token}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password, confirmPassword })
        });

        const data = await res.json();

        if (res.ok) {
            msgBox.innerHTML = `<div class="alert alert-success text-center">Password updated! Redirecting...</div>`;
            setTimeout(() => {
                window.location.href = "login.html";
            }, 2000);
        } else {
            msgBox.innerHTML = `<div class="alert alert-danger text-center">${data.message}</div>`;
            submitBtn.disabled = false;
            submitBtn.innerText = "Update Password";
        }

    } catch (err) {
        console.error(err);
        msgBox.innerHTML = `<div class="alert alert-danger text-center">Server Error. Please try again.</div>`;
        submitBtn.disabled = false;
        submitBtn.innerText = "Update Password";
    }
});