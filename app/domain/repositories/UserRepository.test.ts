import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from "@testcontainers/postgresql";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "../infrastructure/database/Schema.js";
import { Pool } from "pg";
import User from "../models/User.js";
import UserRepository from "./UserRepository.js";
import type { Drizzle } from "../infrastructure/database/Drizzle.js";
import "reflect-metadata";
import { Container } from "inversify";
import { createDIContainer } from "../../di.js";

// Setting a longer timeout for all tests in this file
describe("UserRepository", { timeout: 60000 }, () => {
  let postgresContainer: StartedPostgreSqlContainer;
  let pool: Pool;
  let db: Drizzle;
  let userRepository: UserRepository;
  let testContainer: Container;

  beforeAll(async () => {
    postgresContainer = await new PostgreSqlContainer("postgres:16.3-alpine").start();

    const databaseUrl = postgresContainer.getConnectionUri();

    pool = new Pool({ connectionString: databaseUrl });
    db = drizzle(pool, { schema });

    const { execSync } = require("child_process");
    execSync(
      `npx drizzle-kit push --force true --dialect postgresql --schema ./app/domain/infrastructure/database/Schema.ts --url ${databaseUrl}`
    );

    testContainer = createDIContainer({testDb: db});
    
    userRepository = testContainer.get(UserRepository);
  });

  afterAll(async () => {
    await pool.end();
    await postgresContainer.stop();
  });

  beforeEach(async () => {
    await db.delete(schema.usersTable);
  });

  it("should find a user by id", async () => {
    const existingUser = await db
      .insert(schema.usersTable)
      .values({
        name: "John Doe",
        age: 30,
        email: "john@example.com",
      })
      .returning({ id: schema.usersTable.id });

    const user = await userRepository.findById(existingUser[0].id);

    expect(user).toBeInstanceOf(User);
    expect(user?.id).toBe(existingUser[0].id);
    expect(user?.name).toBe("John Doe");
    expect(user?.age).toBe(30);
    expect(user?.email).toBe("john@example.com");
  });

  it("should return null for non-existent user id", async () => {
    const user = await userRepository.findById(9999);

    expect(user).toBeNull();
  });
});
