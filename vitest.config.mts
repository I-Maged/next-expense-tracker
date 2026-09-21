import path from "node:path";
import { defineConfig } from "vitest/config";

const alias = {
  "@": path.resolve(process.cwd(), "."),
};

export default defineConfig({
  resolve: { alias },
  test: {
    globals: true,
    projects: [
      {
        resolve: { alias },
        test: {
          name: "unit",
          environment: "jsdom",
          globals: true,
          setupFiles: ["./vitest.setup.ts"],
          include: ["**/*.test.{ts,tsx}"],
          exclude: ["node_modules", "tests/integration/**"],
        },
      },
      {
        resolve: { alias },
        test: {
          name: "integration",
          environment: "node",
          globals: true,
          setupFiles: ["./tests/integration/setup.ts"],
          include: ["tests/integration/**/*.integration.test.ts"],
          exclude: ["node_modules"],
          testTimeout: 30_000,
          // Integration hits one shared test DB — run files serially.
          fileParallelism: false,
          maxWorkers: 1,
        },
      },
    ],
  },
});
