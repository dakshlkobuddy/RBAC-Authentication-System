const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const rbacMiddleware = require("../middlewares/rbac.middleware");

router.get(
  "/data",
  authMiddleware,
  rbacMiddleware("finance.view"),
  (req, res) => {
    res.json({ message: "Finance data accessed ✅" });
  }
);

router.post(
  "/data",
  authMiddleware,
  rbacMiddleware("finance.create"),
  (req, res) => {
    res.json({ message: "Finance data created ✅" });
  }
);

module.exports = router;
