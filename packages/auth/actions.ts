"use server";

import { validateAccess } from "./helpers";
import { prisma } from "./prisma";

export async function getUsers() {
  await validateAccess({ admin: true });
  return await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function approveUser(userId: string) {
  await validateAccess({ admin: true });
  await prisma.user.update({
    where: { id: userId },
    data: { isApproved: true },
  });
}

export async function updateUserRole(userId: string, role: string) {
  await validateAccess({ admin: true });

  // ensure the user is approved first
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.isApproved) {
    throw new Error("Cannot change role of unapproved user");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role },
  });
}

export async function updateUserScopes(userId: string, scopes: string[]) {
  await validateAccess({ admin: true });
  await prisma.user.update({
    where: { id: userId },
    data: { scopes },
  });
}
