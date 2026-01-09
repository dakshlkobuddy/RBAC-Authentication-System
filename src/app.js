// src/app.js
const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json()); // Make sure this is above the routes

// Import Routes
const authRoutes = require("./routes/auth.routes");
const financeRoutes = require("./routes/finance.routes");
const marketingRoutes = require("./routes/marketing.routes");
const adminRoutes = require("./routes/admin.routes");
const aiRoutes = require("./routes/ai.routes");
const supportRoutes = require("./routes/support.routes");

// Serve Frontend
app.use(express.static(path.join(__dirname, "../frontend")));

// Routes
app.use("/auth", authRoutes);
app.use("/finance", financeRoutes);
app.use("/marketing", marketingRoutes);
app.use("/admin", adminRoutes);
app.use("/ai", aiRoutes);
app.use("/support", supportRoutes);

app.get("/", (req, res) => {
  res.redirect("/html/login.html");
});

module.exports = app;