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
    await client.query(`
      create table if not exists schedules (
        id uuid primary key,
        name text,
        hh integer not null check (hh >= 0 and hh <= 23),
        mm integer not null check (mm >= 0 and mm <= 59),
        created_at timestamptz default now()
      );
    `);
    await client.query(`
      create table if not exists feed_logs (
        id bigserial primary key,
        ts timestamptz not null default now(),
        source text,
        ok boolean,
        msg text,
        duration numeric
      );
    `);
    console.log("[db] connected and schema ready");
  } finally {
    client.release();
  }
}

export type DbSchedule = { id: string; name: string | null; hh: number; mm: number };

export async function dbListSchedules(): Promise<DbSchedule[]> {
  if (!DATABASE_URL) return [];
  const { rows } = await pool.query("select id::text, name, hh, mm from schedules order by created_at asc");
  return rows as DbSchedule[];
}

export async function dbInsertSchedule(row: DbSchedule): Promise<void> {
  if (!DATABASE_URL) return;
  await pool.query("insert into schedules (id, name, hh, mm) values ($1, $2, $3, $4)", [row.id, row.name, row.hh, row.mm]);
}

export async function dbDeleteSchedule(id: string): Promise<void> {
  if (!DATABASE_URL) return;
  await pool.query("delete from schedules where id = $1", [id]);
}

export async function dbInsertFeedLog(entry: { ts: string; source: string; ok: boolean; msg?: string; duration?: number }) {
  if (!DATABASE_URL) return;
  await pool.query(
    "insert into feed_logs (ts, source, ok, msg, duration) values ($1, $2, $3, $4, $5)",
    [entry.ts, entry.source, entry.ok, entry.msg ?? null, entry.duration ?? null]
  );
}


