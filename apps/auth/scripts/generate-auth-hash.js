const bcrypt = require("bcryptjs");

async function generateSecureCredentials() {
  const args = process.argv.slice(2);
  const email = "admin@marcel-projects";
  const password = args[0];

  console.log("🔐 Generating secure authentication credentials...");
  console.log("");

  try {
    const saltRounds = 12;

    console.log(`⏳ Hashing password with ${saltRounds} salt rounds...`);

    const passwordHash = await bcrypt.hash(password, saltRounds);

    console.log("✅ Credentials generated successfully!");
    console.log("");
    console.log("Add these to your .env.local file:");
    console.log("=".repeat(50));
    console.log(`AUTH_EMAIL='${email}'`);
    console.log(`AUTH_PASSWORD_HASH='${passwordHash.replace(/\$/g, "\\$")}'`);
    console.log("=".repeat(50));
    console.log("");
  } catch (error) {
    console.error("❌ Error generating credentials:", error);
    process.exit(1);
  }
}

generateSecureCredentials();

// npm run gen-auth 5xmoosRCapjDaHsZodFtftrVM1
