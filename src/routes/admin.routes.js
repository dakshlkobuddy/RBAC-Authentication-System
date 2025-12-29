const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const rbacMiddleware = require("../middlewares/rbac.middleware");
const { createUser } = require("../services/user.service");

router.post(
  "/users",
  authMiddleware,
  rbacMiddleware("user.create"),
  async (req, res) => {
    try {
      const { name, email, role } = req.body;

      await createUser(name, email, role);

      res.json({
        message: "User created and password setup email sent",
      });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
);

module.exports = router;
