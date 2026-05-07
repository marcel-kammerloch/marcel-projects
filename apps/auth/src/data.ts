export interface Credential {
  identifier: string;
  passwordHash: string; // bcrypt hash
}

export const validIdentifiers = ["marcel-projects", "marcel-projects:temp"];

function toEnvKey(identifier: string) {
  // Normalize identifier into a safe env var name fragment
  return identifier.toUpperCase().replace(/[^A-Z0-9]/g, "_");
}

// Returns the credential (identifier + bcrypt hash) for a given identifier
// or undefined if not configured. Hashes must be provided via environment
// variables named `AUTH_HASH_<NORMALIZED_IDENTIFIER>`.
export function getCredential(identifier: string): Credential | undefined {
  if (!validIdentifiers.includes(identifier)) return undefined;

  const key = `AUTH_HASH_${toEnvKey(identifier)}`;
  const hash = process.env[key];

  if (!hash || typeof hash !== "string" || hash.trim().length === 0)
    return undefined;

  return { identifier, passwordHash: hash };
}
