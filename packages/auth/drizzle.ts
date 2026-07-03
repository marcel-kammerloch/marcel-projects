import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

const connectionString = process.env.MARCEL_PROJECTS_DATABASE_URL!;

const sql = neon(connectionString);
export const db = drizzle({ client: sql });
