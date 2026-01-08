// src/middlewares/rbac.middleware.js
const pool = require("../config/database");

const rbacMiddleware = (requiredPermission) => {
  return async (req, res, next) => {
    const userRole = req.user.role;

    const query = `
      SELECT p.name
      FROM role_permissions rp
      JOIN roles r ON rp.role_id = r.id
      JOIN permissions p ON rp.permission_id = p.id
      WHERE r.name = $1
    `;

    const result = await pool.query(query, [userRole]);

    const permissions = result.rows.map((row) => row.name);

    if (!permissions.includes(requiredPermission)) {
      return res.status(403).json({ message: "Access denied" });
    }

    next(); // permission allowed
  };
};

module.exports = rbacMiddleware;