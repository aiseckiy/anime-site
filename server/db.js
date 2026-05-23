import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env"), quiet: true });
dotenv.config({ quiet: true });

const { Pool } = pg;

export const databaseUrl =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PUBLIC_URL ||
  process.env.POSTGRES_PRIVATE_URL ||
  "";

export const hasDatabase = Boolean(databaseUrl);

function needsSsl(connectionString) {
  return /supabase\.com|amazonaws\.com|render\.com/i.test(connectionString);
}

export const pool = hasDatabase
  ? new Pool({
      connectionString: databaseUrl,
      ssl: needsSsl(databaseUrl) ? { rejectUnauthorized: false } : undefined
    })
  : null;

export async function query(text, params) {
  if (!pool) {
    throw new Error("database_unconfigured");
  }
  return pool.query(text, params);
}
