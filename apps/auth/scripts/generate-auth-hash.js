const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

function toEnvKey(identifier) {
  return identifier.toUpperCase().replace(/[^A-Z0-9]/g, "_");
}

function generateRandomSecret(bytes) {
  return crypto.randomBytes(bytes).toString("base64url");
}

function getSecretLength(id) {
  if (id.includes(":temp")) return 8;
  return 12;
}

async function main() {
  console.log("Generating bcrypt hashes for auth environment variables...");

  const outputs = [];
  for (const id of ["marcel-projects", "marcel-projects:temp"]) {
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
    "Done. Keep the secrets safe and avoid committing them to source control.",
  );
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
