import { Client } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "./generated/client";

const connectionString = process.env.MARCEL_PROJECTS_DATABASE_URL;

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const client = new Client({ connectionString });
const adapter = new PrismaNeon(client);

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export * from "./generated/client";
