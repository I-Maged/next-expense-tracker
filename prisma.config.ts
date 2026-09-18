import { defineConfig, env } from "prisma/config";

// Prisma 7 does not auto-load .env into the config module, and dotenv is
// deliberately not installed (approved-dependency list). Node's built-in
// loader handles dotenv-style parsing including quoted values.
process.loadEnvFile();

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
