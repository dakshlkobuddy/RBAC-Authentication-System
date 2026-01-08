// frontend/js/forgot-password.js
const API_URL = "http://localhost:3000";

const forgotForm = document.getElementById("forgotPasswordForm");
const msgBox = document.getElementById("msgBox");

if (forgotForm) {
    forgotForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("email").value;
        const submitBtn = forgotForm.querySelector("button[type='submit']");

        msgBox.innerHTML = "";
        submitBtn.disabled = true;
        submitBtn.innerText = "Sending...";

        try {
            const res = await fetch(`${API_URL}/auth/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            });

            const data = await res.json();

            if (res.ok) {
                msgBox.innerHTML = `<div class="alert alert-success text-center">Reset link sent! Check your email.</div>`;
                forgotForm.reset();
            } else {
                msgBox.innerHTML = `<div class="alert alert-danger text-center">${data.message || "Failed to send link"}</div>`;
            }
        } catch (err) {
            console.error(err);
            msgBox.innerHTML = `<div class="alert alert-danger text-center">Server Connection Error</div>`;
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerText = "Send Reset Link";
        }
    });
}