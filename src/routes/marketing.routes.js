const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const rbacMiddleware = require("../middlewares/rbac.middleware");

router.get(
  "/data",
  authMiddleware,
  rbacMiddleware("marketing.view"),
  (req, res) => {
    res.json({ message: "Marketing data accessed ✅" });
  }
);

router.post(
  "/data",
  authMiddleware,
  rbacMiddleware("marketing.create"),
  (req, res) => {
    res.json({ message: "Marketing data created ✅" });
  }
);

module.exports = router;
