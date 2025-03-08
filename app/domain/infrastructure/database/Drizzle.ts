import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "./Schema.js";
import "dotenv/config";

export const db = drizzle(process.env.DATABASE_URL!, { schema });

export type Drizzle = typeof db;