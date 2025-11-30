import { promises as fs } from "fs";
import path from "path";
import { DB } from "./types";

// Detect Vercel runtime (VERCEL=1 is set in their server env)
const isVercel = process.env.VERCEL === "1";

// On Vercel we must use a writable filesystem location (/tmp)
// Locally we keep using ./data so behavior stays the same for dev.
const BASE_DIR = isVercel ? "/tmp" : process.cwd();
const DATA_DIR = path.join(BASE_DIR, "data");
const DB_PATH = path.join(DATA_DIR, "db.json");

async function ensureDB(): Promise<void> {
  try {
    // Ensure directory exists
    await fs.mkdir(DATA_DIR, { recursive: true });

    // If file exists, this will succeed and do nothing else
    await fs.access(DB_PATH);
  } catch {
    // If access fails (no file), create an empty DB
    const empty: DB = { projects: [], runs: [], files: [] };
    await fs.writeFile(DB_PATH, JSON.stringify(empty, null, 2), "utf8");
  }
}

export async function readDB(): Promise<DB> {
  await ensureDB();
  const raw = await fs.readFile(DB_PATH, "utf8");
  return JSON.parse(raw) as DB;
}

export async function writeDB(db: DB): Promise<void> {
  // Make sure directory / file exists before writing
  await ensureDB();
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf8");
}

export function generateId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now()}`;
}
