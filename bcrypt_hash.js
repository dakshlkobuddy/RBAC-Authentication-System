const bcrypt = require("bcrypt");

const plainPassword = "support123";
const saltRounds = 5;

async function hashPassword() {
  const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
  console.log("Hashed Password:", hashedPassword);
}

hashPassword();