const pool = require("../config/database");
const { comparePassword } = require("../utils/password.util");
const { generateToken } = require("../utils/token.util");

const loginUser = async (email, password) => {
  const userQuery = `
    SELECT users.id, users.email, users.password, roles.name AS role
    FROM users
    JOIN roles ON users.role_id = roles.id
    WHERE users.email = $1 AND users.is_active = true
  `;

  const result = await pool.query(userQuery, [email]);

  if (result.rows.length === 0) {
    throw new Error("User not found");
  }

  const user = result.rows[0];

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid password");
  }

  const token = generateToken({
    userId: user.id,
    role: user.role,
  });

  return token;
};

module.exports = { loginUser };
