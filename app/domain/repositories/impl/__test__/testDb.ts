import { randomUUID } from "crypto";
import { execSync } from "node:child_process";
import { Client } from "pg";
import { inject } from "vitest";

export async function createDb() {
  const postgresUrl = inject("postgresUrl");

  // Extract connection details
  const { hostname, port, username, password } = new URL(postgresUrl);

  // Generate a random database name
  const dbName = `test_${randomUUID().replace(/-/g, "_")}`;

  // Create a new pg Client instance
  const client = new Client(postgresUrl);
  await client.connect();

  // Create the new database
  await client.query(`CREATE DATABASE ${dbName}`);

  // Close the pg connection
  await client.end();

  // Update databaseUrl with the new dbName
  const databaseUrl = `postgresql://${username}:${password}@${hostname}:${port}/${dbName}`;

  // Sync drizzle schema to the specific database
  execSync(
    `npx drizzle-kit push --force true --dialect postgresql --schema ./app/domain/infrastructure/database/schema.ts --url ${databaseUrl}`
  );

  return { postgresUrl: databaseUrl };
}

export async function dropDb(databaseUrl: string) {
  const dbName = databaseUrl.split("/").pop();
  const postgresDbUrl = databaseUrl.replace(`/${dbName}`, "/postgres");

  const client = new Client({ connectionString: postgresDbUrl });
  await client.connect();

  try {
    // Disconnect all users from the database
    await client.query(
      `
      SELECT pg_terminate_backend(pg_stat_activity.pid)
      FROM pg_stat_activity
      WHERE pg_stat_activity.datname = $1
        AND pid <> pg_backend_pid();
    `,
      [dbName]
    );

    await client.query(`DROP DATABASE IF EXISTS "${dbName}"`);
  } finally {
    await client.end();
  }
}

export async function resetDb(postgresUrl: string) {
  const client = new Client({ connectionString: postgresUrl });
  await client.connect();

  try {
    await client.query(`
      DO $$ 
      DECLARE
        r RECORD;
      BEGIN
        FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = current_schema()) LOOP
          EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.tablename) || ' CASCADE';
        END LOOP;
      END $$;
    `);
  } finally {
    await client.end();
  }
}
