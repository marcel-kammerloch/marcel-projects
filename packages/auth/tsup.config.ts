import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "index.ts",
    "actions.ts",
    "api.ts",
    "client.ts",
    "server.ts",
    "helpers.ts",
    "drizzle.ts",
    "drizzle.config.ts",
    "schema.ts",
  ],
  format: ["esm"],
  outDir: "dist",
  clean: true,
  dts: false,
  sourcemap: false,
  bundle: false,
  target: "es2022",
  platform: "node",
  external: ["next", "react", "@repo/utils"],
});
