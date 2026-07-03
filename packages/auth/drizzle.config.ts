import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.MARCEL_PROJECTS_DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
