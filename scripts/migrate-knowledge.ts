import 'dotenv/config';
import pg from 'pg';
import { readFile } from 'node:fs/promises';
if (!process.env.DATABASE_MIGRATION_URL) throw new Error('Set DATABASE_MIGRATION_URL for migrations.');
const client = new pg.Client({ connectionString: process.env.DATABASE_MIGRATION_URL });
try {
  await client.connect(); await client.query('BEGIN');
  await client.query(await readFile(new URL('../db/migrations/001_rusdi.sql', import.meta.url), 'utf8'));
  await client.query('COMMIT'); console.log('Knowledge schema migrated.');
} catch (error) { await client.query('ROLLBACK').catch(() => {}); throw error; }
finally { await client.end(); }
