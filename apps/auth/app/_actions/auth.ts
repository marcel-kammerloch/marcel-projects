"use server";

import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { cookies } from "next/headers";

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
  const email = formData.get("email");
  const password = formData.get("password");

  if (!email || !password) {
    return { success: false, message: "Email and password are required" };
  }

  if (typeof email !== "string" || typeof password !== "string") {
    return { success: false, message: "Invalid input types" };
  }

  if (
    email.length < 6 ||
    email.length > 128 ||
    password.length < 6 ||
    password.length > 128
  ) {
    return { success: false, message: "Invalid input length" };
  }

  try {
    // Get credentials from environment variables
    const validEmail = process.env.AUTH_EMAIL;
    const validPasswordHash = process.env.AUTH_PASSWORD_HASH;

    if (!validEmail || !validPasswordHash) {
      console.warn("Authentication environment variables not configured");
      return {
        success: false,
        message: "Authentication service unavailable",
      };
    }

    const emailMatches = email === validEmail;

    // Always verify password hash even if email doesn't match (prevent timing attacks)
    const passwordMatches = await bcrypt.compare(password, validPasswordHash);

    if (emailMatches && passwordMatches) {
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

      // Set secure session cookie
      const token = await new SignJWT({ isAuthenticated: true })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setIssuer("https://auth.marcel-projects.vercel.app")
        .setExpirationTime("90d")
        .sign(JWT_SECRET);

      const cookieStore = await cookies();
      cookieStore.set("auth-token", token, {
        maxAge: 90 * 24 * 60 * 60,
        domain: ".marcel-projects.vercel.app",
        path: "/",
        sameSite: "lax",
        httpOnly: true,
        secure: true,
      });

      return { success: true, message: "Authentication successful" };
    } else {
      return { success: false, message: "Invalid email or password" };
    }
  } catch (error) {
    console.error("Authentication error:", error);

    return { success: false, message: "Authentication failed" };
  }
}
