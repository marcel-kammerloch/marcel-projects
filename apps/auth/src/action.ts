"use server";

import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { cookies } from "next/headers";
import { getCredential } from "./data";

function getJwtSecret(): Uint8Array {
  const secret = process.env.MARCEL_PROJECTS_AUTH_TOKEN_SECRET;
  if (!secret || secret.trim().length === 0) {
    throw new Error(
      "JWT secret is not set. Please set MARCEL_PROJECTS_AUTH_TOKEN_SECRET in your environment variables."
    );
  }
  return new TextEncoder().encode(secret);
}

export async function authenticateUser(formData: FormData) {
  const identifier = formData.get("identifier");
  const password = formData.get("password");

  if (!identifier || !password) {
    return { success: false, message: "Identifier and password are required" };
  }

  if (typeof identifier !== "string" || typeof password !== "string") {
    return { success: false, message: "Invalid input types" };
  }

  // Validate basic lengths and characters for the identifier and password.
  // Identifier may include alphanumerics, hyphen and colon for temporary entries.
  const identifierRegex = /^[A-Za-z0-9:-]{3,30}$/;
  if (!identifierRegex.test(identifier)) {
    return { success: false, message: "Invalid identifier or password" };
  }

  if (password.length < 4 || password.length > 20) {
    return { success: false, message: "Invalid identifier or password" };
  }

  try {
    // Load credential hash from environment via loader.
    const credentialData = getCredential(identifier);

    // Use a precomputed fake hash to avoid short-circuit timing differences.
    // This hash is only used when a real credential isn't configured.
    const FAKE_HASH =
      "$2b$10$m27Y7XNRZQ0s7hR.SUICS.vnTZT7DcRbZ4cCuKq/PTbavfe5VR3ya"; // bcrypt.hash("invalid_password_for_timing", 10);

    if (!credentialData) {
      // Simulate bcrypt comparison to mitigate timing attacks and avoid
      // revealing whether an identifier exists.
      await bcrypt.compare(password, FAKE_HASH);
      return { success: false, message: "Invalid identifier or password" };
    }

    // Always verify password hash if credential exists.
    const passwordMatches = await bcrypt.compare(
      password,
      credentialData.passwordHash
    );

    if (!passwordMatches)
      return { success: false, message: "Invalid email or password" };

    // Get and validate JWT secret
    let JWT_SECRET: Uint8Array;
    try {
      JWT_SECRET = getJwtSecret();
    } catch (e) {
      console.error(e);
      return {
        success: false,
        message: "Authentication service misconfigured",
      };
    }

    const isTemp = credentialData.identifier.endsWith(":temp");
    const id = credentialData.identifier.replace(":temp", "");

    // Determine cookie scope
    const scope = id === "marcel-projects" ? "*" : id;

    // Set secure session cookie
    const token = await new SignJWT({ isAuthenticated: true, scope })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setIssuer("https://auth.marcel-projects.vercel.app")
      .setExpirationTime(isTemp ? "3d" : "90d")
      .sign(JWT_SECRET);

    const cookieStore = await cookies();
    cookieStore.set("auth-token", token, {
      maxAge: (isTemp ? 3 : 90) * 24 * 60 * 60,
      domain: ".marcel-projects.vercel.app",
      path: "/",
      sameSite: "lax",
      httpOnly: true,
      secure: true,
    });

    return { success: true, message: "Authentication successful" };
  } catch (error) {
    console.error("Authentication error:", error);

    return { success: false, message: "Authentication failed" };
  }
}
