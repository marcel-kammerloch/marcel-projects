const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

function toEnvKey(identifier) {
  return identifier.toUpperCase().replace(/[^A-Z0-9]/g, "_");
}

function extractIdentifiersFromFile(filePath) {
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const m = raw.match(
      /export\s+const\s+validIdentifiers\s*=\s*\[([\s\S]*?)\]/m
    );
    if (!m) return null;
    const arrayBody = m[1];
    const idMatches = [...arrayBody.matchAll(/['"]([A-Za-z0-9:-]+)['"]/g)];
    return idMatches.map((mm) => mm[1]);
  } catch (e) {
    return null;
  }
}

function generateRandomSecret(bytes) {
  return crypto.randomBytes(bytes).toString("base64url");
}

function getSecretLength(id) {
  if (id === "marcel-projects") return 12;
  if (id === "marcel-projects:temp") return 10;
  if (id.includes(":temp")) return 6;
  return 8;
}

async function main() {
  console.log("🔐 Generating bcrypt hashes for auth environment variables...");
  const scriptDir = __dirname;
  const credentialsPath = path.join(
    scriptDir,
    "..",
    "app",
    "_data",
    "credentials.ts"
  );

  let identifiers = extractIdentifiersFromFile(credentialsPath);
  if (!identifiers || identifiers.length === 0) {
    // fallback to CLI args
    const args = process.argv.slice(2);
    if (args.length === 0) {
      console.error(
        "No identifiers found in credentials.ts and no args provided."
      );
      console.error("Usage: node generate-auth-hash.js [identifier ...]");
      process.exit(2);
    }
    identifiers = args;
  }

  const saltRounds = 12;

  console.log(
    `Found ${identifiers.length} identifier(s). Using ${saltRounds} bcrypt salt rounds.`
  );
  console.log("");

  const outputs = [];
  for (const id of identifiers) {
    const secret = generateRandomSecret(getSecretLength(id));
    const hash = await bcrypt.hash(secret, saltRounds);
    const key = `AUTH_HASH_${toEnvKey(id)}`;
    outputs.push({ id, key, hash, secret });
  }

  // Print shell-friendly export lines and a Windows PowerShell setx example.
  console.log("# Copy these into your environment (.env or CI variables)");
  for (const o of outputs) {
    console.log(`${o.key}='${o.hash.replace(/\$/g, "\\$")}'`);
  }

  console.log("");
  console.log("# Plaintext secrets (store securely if you need them):");
  for (const o of outputs) {
    console.log(`${o.id} secret: ${o.secret}`);
  }

  console.log("");
  console.log(
    "✅ Done. Keep the secrets safe and avoid committing them to source control."
  );
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
