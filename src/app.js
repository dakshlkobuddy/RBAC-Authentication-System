const express = require("express");
const cors = require("cors");
const path = require("path"); // Import path
require("dotenv").config();

const app = express();
app.use(cors());

// Import Routes
const authRoutes = require("./routes/auth.routes");
const financeRoutes = require("./routes/finance.routes");
const marketingRoutes = require("./routes/marketing.routes");
const adminRoutes = require("./routes/admin.routes");

app.use(express.json());

// ✅ SERVE FRONTEND: This allows the server to host your HTML/JS
app.use(express.static(path.join(__dirname, "../frontend")));

// Routes
app.use("/auth", authRoutes);
app.use("/finance", financeRoutes);
app.use("/marketing", marketingRoutes);
app.use("/admin", adminRoutes);

// Redirect root URL to login page
app.get("/", (req, res) => {
  res.redirect("/html/login.html");
});

module.exports = app;