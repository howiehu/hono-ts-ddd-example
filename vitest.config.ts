import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    workspace: [
      {
        test: {
          include: ["app/api/**/*.test.ts"],
          name: "api",
          environment: "node",
        },
      },
      {
        test: {
          include: ["app/domain/repositories/**/*.test.ts"],
          name: "repository",
          environment: "node",
          globalSetup: "app/domain/repositories/impl/__test__/globalSetup.ts",
          hookTimeout: 70000, // increase the hookTimeout to wait the Testcontainers pulling images.
        },
      },
    ],
  },
});
