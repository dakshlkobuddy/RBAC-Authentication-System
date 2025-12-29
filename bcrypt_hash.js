const bcrypt = require("bcrypt");

const plainPassword = "admin123";
const saltRounds = 10;

async function hashPassword() {
  const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
  console.log("Hashed Password:", hashedPassword);
}

hashPassword();