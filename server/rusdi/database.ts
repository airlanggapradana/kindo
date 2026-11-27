import pg from 'pg';

let pool: pg.Pool | null = null;
export function getPool() {
  if (!process.env.DATABASE_URL) throw new Error('Knowledge database not configured');
  const connectionString = process.env.DATABASE_URL;
  const isPooledEndpoint = /-pooler\./i.test(connectionString);
  return pool ??= new pg.Pool({
    connectionString,
    max: 5,
    connectionTimeoutMillis: 8000,
    query_timeout: 5000,
    ...(isPooledEndpoint ? {} : { statement_timeout: 5000 }),
    idleTimeoutMillis: 10000,
  });
}
export async function closeKnowledgePool() { await pool?.end(); pool = null; }
export function vectorLiteral(values: number[]) {
  if (values.length !== 768 || values.some(value => !Number.isFinite(value)) || !values.some(value => value !== 0)) throw new Error('Invalid embedding dimensions or values');
  return `[${values.join(',')}]`;
}
