// src/middlewares/auth.middleware.js
const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Token nahi aaya
  if (!authHeader) {
    return res.status(401).json({ message: "Token missing" });
  }

  // "Bearer <token>"
  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // token se user info attach kar rahe hain
    req.user = decoded; // { userId, role }

    next(); // aage jaane do
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = authMiddleware;
