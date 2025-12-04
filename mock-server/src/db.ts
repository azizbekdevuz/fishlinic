import { Pool } from "pg";

const DATABASE_URL = process.env.DATABASE_URL || "";

export const pool = new Pool({ connectionString: DATABASE_URL, ssl: DATABASE_URL ? { rejectUnauthorized: false } : undefined });

export async function initDb() {
  if (!DATABASE_URL) {
    console.warn("[db] DATABASE_URL not set; schedules will not persist");
    return;
  }
  const client = await pool.connect();
  try {
    // Create or update schedules table (matches Prisma FeederSchedule model)
    await client.query(`
      create table if not exists feeder_schedules (
        id uuid primary key,
        name text,
        hour integer not null check (hour >= 0 and hour <= 23),
        minute integer not null check (minute >= 0 and minute <= 59),
        duration numeric default 2.0,
        enabled boolean default true,
        user_id text,
        created_at timestamptz default now(),
        updated_at timestamptz default now()
      );
    `);
    
    // Add columns if they don't exist (for existing tables)
    await client.query(`
      alter table feeder_schedules add column if not exists duration numeric default 2.0;
    `).catch(() => {});
    await client.query(`
      alter table feeder_schedules add column if not exists user_id text;
    `).catch(() => {});
    
    // Create index on user_id if not exists
    await client.query(`
      create index if not exists idx_feeder_schedules_user_id on feeder_schedules(user_id);
    `).catch(() => {});
    
    // Create feed_logs table (matches Prisma FeedLog model)
    await client.query(`
      create table if not exists feed_logs (
        id text primary key default gen_random_uuid()::text,
        timestamp timestamptz not null default now(),
        source text,
        duration numeric,
        success boolean,
        message text,
        user_id text
      );
    `);
    
    // Add user_id column if it doesn't exist
    await client.query(`
      alter table feed_logs add column if not exists user_id text;
    `).catch(() => {});
    
    console.log("[db] connected and schema ready");
  } finally {
    client.release();
  }
}

export type DbSchedule = { 
  id: string; 
  name: string | null; 
  hh: number; 
  mm: number; 
  duration?: number;
  userId?: string | null;
};

// List schedules for a specific user (or all if no userId provided)
export async function dbListSchedules(userId?: string): Promise<DbSchedule[]> {
  if (!DATABASE_URL) return [];
  
  if (userId) {
    const { rows } = await pool.query(
      "select id::text, name, hour as hh, minute as mm, duration, user_id as \"userId\" from feeder_schedules where enabled = true and user_id = $1 order by created_at asc",
      [userId]
    );
    return rows as DbSchedule[];
  }
  
  // Fallback: return all schedules (for backward compatibility)
  const { rows } = await pool.query(
    "select id::text, name, hour as hh, minute as mm, duration, user_id as \"userId\" from feeder_schedules where enabled = true order by created_at asc"
  );
  return rows as DbSchedule[];
}

export async function dbInsertSchedule(row: DbSchedule): Promise<void> {
  if (!DATABASE_URL) return;
  await pool.query(
    "insert into feeder_schedules (id, name, hour, minute, duration, user_id) values ($1, $2, $3, $4, $5, $6)",
    [row.id, row.name, row.hh, row.mm, row.duration ?? 2.0, row.userId ?? null]
  );
}

export async function dbDeleteSchedule(id: string, userId?: string): Promise<boolean> {
  if (!DATABASE_URL) return false;
  
  if (userId) {
    // Only delete if the schedule belongs to the user
    const result = await pool.query(
      "delete from feeder_schedules where id = $1 and user_id = $2",
      [id, userId]
    );
    return (result.rowCount ?? 0) > 0;
  }
  
  // Fallback: delete without user check (backward compatibility)
  await pool.query("delete from feeder_schedules where id = $1", [id]);
  return true;
}

export async function dbInsertFeedLog(entry: { 
  ts: string; 
  source: string; 
  ok: boolean; 
  msg?: string; 
  duration?: number;
  userId?: string;
}) {
  if (!DATABASE_URL) return;
  await pool.query(
    "insert into feed_logs (timestamp, source, success, message, duration, user_id) values ($1, $2, $3, $4, $5, $6)",
    [entry.ts, entry.source, entry.ok, entry.msg ?? null, entry.duration ?? null, entry.userId ?? null]
  );
}

