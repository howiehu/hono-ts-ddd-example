import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "../../infrastructure/database/schema.js";
import { Pool } from "pg";
import User from "../../models/User.js";
import UserRepositoryDB from "./UserRepositoryDB.js";
import type { Drizzle } from "../../infrastructure/database/drizzle.js";
import { createDb, dropDb } from "./__test__/testDb.js";

// Setting a longer timeout for all tests in this file
describe("UserRepository", () => {
  let postgresUrl: string;
  let pool: Pool;
  let db: Drizzle;

  let userRepository: UserRepositoryDB;

  beforeAll(async () => {
    postgresUrl = (await createDb()).postgresUrl;

    pool = new Pool({ connectionString: postgresUrl });
    db = drizzle(pool, { schema });

    userRepository = new UserRepositoryDB(db);
  });

  afterAll(async () => {
    await pool.end();
    await dropDb(postgresUrl);
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
