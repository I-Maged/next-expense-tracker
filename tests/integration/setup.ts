// Integration setup — runs before every tests/integration file.
//
// Contract:
// - Requires DATABASE_URL_TEST (separate DB, never the dev DB).
// - Points lib/prisma + lib/auth at the test DB by overriding DATABASE_URL
//   BEFORE any test module imports them (setupFiles load first).
// - Provides sane better-auth defaults so CI works without extra secrets.

const TEST_SECRET_FALLBACK =
  "integration-test-secret-0123456789abcdef-0123456789abcdef";

export function resolveIntegrationEnv(): {
  databaseUrl: string;
  testDatabaseUrl: string;
} {
  // Node 20.12+: dotenv-style parsing incl. quoted values.
  try {
    process.loadEnvFile();
  } catch {
    // No .env file (e.g. pure CI env) — rely on process env as-is.
  }

  let testDatabaseUrl = process.env.DATABASE_URL_TEST;
  if (!testDatabaseUrl) {
    // DX fallback: derive expense_tracker_test on the same server.
    // Explicit DATABASE_URL_TEST is still preferred (and required in CI).
    const devUrl = process.env.DATABASE_URL;
    if (!devUrl) {
      throw new Error(
        "[integration] Neither DATABASE_URL_TEST nor DATABASE_URL is set. " +
          "Create a separate test database (e.g. expense_tracker_test), run " +
          "`prisma migrate deploy` against it, and export DATABASE_URL_TEST. " +
          "See tests/integration/README.md.",
      );
    }
    testDatabaseUrl = devUrl.replace(/\/([^/?]+)(\?|$)/, "/expense_tracker_test$2");
    console.warn(
      "[integration] DATABASE_URL_TEST not set — derived expense_tracker_test from DATABASE_URL.",
    );
  }

  process.env.DATABASE_URL = testDatabaseUrl;
  process.env.BETTER_AUTH_SECRET ??= TEST_SECRET_FALLBACK;
  process.env.BETTER_AUTH_URL ??= "http://localhost:3000";

  return { databaseUrl: testDatabaseUrl, testDatabaseUrl };
}

resolveIntegrationEnv();
