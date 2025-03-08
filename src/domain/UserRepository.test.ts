import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from "@testcontainers/postgresql";
import { drizzle } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "../db/schema.js";
import { Pool } from "pg";
import User from "./User.js";
import UserRepository from "./UserRepository.js";
import Database from "./Database.js";
import "reflect-metadata";
import { Container } from "inversify";

// Setting a longer timeout for all tests in this file
describe("UserRepository", { timeout: 60000 }, () => {
  let container: StartedPostgreSqlContainer;
  let pool: Pool;
  let db: NodePgDatabase<typeof schema>;
  let userRepository: UserRepository;
  let testContainer: Container;

  beforeAll(async () => {
    container = await new PostgreSqlContainer("postgres:16.3-alpine").start();

    const databaseUrl = container.getConnectionUri();

    pool = new Pool({ connectionString: databaseUrl });
    db = drizzle(pool, { schema });

    const { execSync } = require("child_process");
    execSync(
      `npx drizzle-kit push --force true --dialect postgresql --schema ./src/db/schema.ts --url ${databaseUrl}`
    );

    // Setup DI container
    testContainer = new Container();

    // Create a mock Database class instead of extending the original
    class TestDatabase {
      private readonly instance: NodePgDatabase<typeof schema>;

      constructor() {
        // Directly set the instance to our test database
        this.instance = db;
      }

      public getInstance(): NodePgDatabase<typeof schema> {
        return this.instance;
      }
    }

    // Bind dependencies - use the mock class directly instead of extending
    testContainer
      .bind(Database)
      .toConstantValue(new TestDatabase() as unknown as Database);
    testContainer.bind(UserRepository).toSelf();

    // Get repository instance
    userRepository = new UserRepository(testContainer.get(Database));
  });

  afterAll(async () => {
    await pool.end();
    await container.stop();
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

    const user = await userRepository.findUserById(existingUser[0].id);

    expect(user).toBeInstanceOf(User);
    expect(user?.id).toBe(existingUser[0].id);
    expect(user?.name).toBe("John Doe");
    expect(user?.age).toBe(30);
    expect(user?.email).toBe("john@example.com");
  });

  it("should return null for non-existent user id", async () => {
    const user = await userRepository.findUserById(9999);

    expect(user).toBeNull();
  });
});
