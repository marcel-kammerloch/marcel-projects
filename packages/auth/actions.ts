"use server";

import { eq, desc } from "drizzle-orm";
import { validateAccess } from "./helpers";
import { db } from "./drizzle";
import { user } from "./schema";

export async function getUsers() {
  await validateAccess({ admin: true });
  return await db.select().from(user).orderBy(desc(user.createdAt));
}

export async function approveUser(userId: string) {
  await validateAccess({ admin: true });
  await db.update(user).set({ isApproved: true }).where(eq(user.id, userId));
}

export async function updateUserRole(userId: string, role: string) {
  await validateAccess({ admin: true });

  const existingUser = await db
    .select()
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);
  if (!existingUser[0]?.isApproved) {
    throw new Error("Cannot change role of unapproved user");
  }

  await db.update(user).set({ role }).where(eq(user.id, userId));
}

export async function updateUserScopes(userId: string, scopes: string[]) {
  await validateAccess({ admin: true });
  await db.update(user).set({ scopes }).where(eq(user.id, userId));
}
