// db.ts
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "../shared/schema";

// dotenv is already loaded in index.ts
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}

// Ensure SSL is enabled for Render
const connectionString = process.env.DATABASE_URL.includes("?") 
  ? `${process.env.DATABASE_URL}&ssl=true` 
  : `${process.env.DATABASE_URL}?ssl=true`;

export const pool = new Pool({ 
  connectionString,
  ssl: { 
    rejectUnauthorized: true,
 },
   }
);
export const db = drizzle(pool, { schema });
