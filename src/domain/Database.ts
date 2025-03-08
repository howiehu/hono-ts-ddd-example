import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "../db/schema.js";
import "dotenv/config";
import { injectable } from "inversify";

@injectable()
export default class Database {
  private readonly instance: NodePgDatabase<typeof schema>;

  constructor() {
    this.instance = drizzle(process.env.DATABASE_URL!, { schema });
  }

  public getInstance(): NodePgDatabase<typeof schema> {
    return this.instance;
  }
}
