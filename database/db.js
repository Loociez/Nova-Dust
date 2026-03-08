import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();
const { Pool } = pkg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export async function query(sql, params) {
  const client = await pool.connect();
  try {
    return await client.query(sql, params);
  } finally {
    client.release();
  }
}

export async function initDB() {
  await query(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT,
    level INT DEFAULT 1,
    xp INT DEFAULT 0,
    novadust INT DEFAULT 0,
    energy INT DEFAULT 10,
    items JSONB DEFAULT '[]',
    equipped JSONB DEFAULT '{}'
  )
  `);
}