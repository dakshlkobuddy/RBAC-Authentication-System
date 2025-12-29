const express = require("express");
require("dotenv").config();

const authRoutes = require("./routes/auth.routes");
const financeRoutes = require("./routes/finance.routes");
const marketingRoutes = require("./routes/marketing.routes");
const adminRoutes = require("./routes/admin.routes");

const app = express();
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/finance", financeRoutes);
app.use("/marketing", marketingRoutes);
app.use("/admin", adminRoutes);

app.get("/", (req, res) => {
  res.send("RBAC Auth System Running 🚀");
});

module.exports = app;
