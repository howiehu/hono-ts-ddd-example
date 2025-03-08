import { PostgreSqlContainer } from "@testcontainers/postgresql";
import type { TestProject } from "vitest/node";

declare module "vitest" {
  export interface ProvidedContext {
    postgresUrl: string;
  }
}

export default async function setup({ provide }: TestProject) {
  const postgresContainer = await new PostgreSqlContainer(
    "postgres:16.3-alpine"
  ).start();

  provide("postgresUrl", postgresContainer.getConnectionUri());

  return async () => {
    await postgresContainer.stop();
  };
}
