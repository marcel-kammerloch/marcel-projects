import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "./generated/client";

const connectionString = process.env.MARCEL_PROJECTS_DATABASE_URL!;

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const adapter = new PrismaNeon({ connectionString });

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
