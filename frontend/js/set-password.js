// ✅ FIXED: Point to Backend
const API_URL = "http://localhost:3000";

function setupPasswordToggle(inputId, buttonId, iconId) {
    const input = document.getElementById(inputId);
    const button = document.getElementById(buttonId);
    const icon = document.getElementById(iconId);
    button.addEventListener('click', function() {
        const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
        input.setAttribute('type', type);
        icon.classList.toggle('bi-eye');
        icon.classList.toggle('bi-eye-slash');
    });
}
setupPasswordToggle('password', 'togglePasswordBtn', 'eyeIcon1');
setupPasswordToggle('confirmPassword', 'toggleConfirmPasswordBtn', 'eyeIcon2');

const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get("token");

if (!token) {
    document.getElementById("alertBox").innerHTML = `<div class="alert alert-danger">Invalid Link: Token missing.</div>`;
    document.querySelector("button[type='submit']").disabled = true;
}

document.getElementById("setPasswordForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (password !== confirmPassword) {
        document.getElementById("alertBox").innerHTML = `<div class="alert alert-warning">Passwords do not match!</div>`;
        return;
    }

    try {
        const res = await fetch(`${API_URL}/auth/set-password/${token}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password, confirmPassword })
        });
        const data = await res.json();

        if (res.ok) {
            document.body.innerHTML = `
                <div class="card shadow p-5 text-center auth-card">
                    <h3 class="text-success">Success! ✅</h3>
                    <p>Your password has been set successfully.</p>
                    <a href="login.html" class="btn btn-primary w-100">Go to Login</a>
                </div>
            `;
        } else {
            document.getElementById("alertBox").innerHTML = `<div class="alert alert-danger">${data.message}</div>`;
        }
    } catch (err) {
        console.error(err);
        document.getElementById("alertBox").innerHTML = `<div class="alert alert-danger">Server connection failed.</div>`;
    }
});