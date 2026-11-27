import 'dotenv/config';
import test from 'node:test';
import assert from 'node:assert/strict';
import pg from 'pg';
import { questionnaireStats, snapshot } from '../server/rusdi/service.ts';
import { closeKnowledgePool, getPool, vectorLiteral } from '../server/rusdi/database.ts';

test('PostgreSQL pgvector, publication integrity and runtime privileges', { skip: !process.env.DATABASE_MIGRATION_URL }, async () => {
  const admin = new pg.Client({ connectionString: process.env.DATABASE_MIGRATION_URL });
  try {
    await admin.connect();
    const stats = await questionnaireStats(); assert.equal(stats.source, 'database'); assert.equal(stats.formCount, 16); assert.equal(stats.totalQuestions, 160);
    const counts = await admin.query('SELECT COUNT(*)::int AS count FROM knowledge_releases WHERE active'); assert.equal(counts.rows[0].count, 1);
    assert.equal((await admin.query('SELECT COUNT(*)::int AS count FROM knowledge_documents WHERE release_id=$1', [stats.version])).rows[0].count, snapshot.documents.length);
    await assert.rejects(() => getPool().query('DELETE FROM knowledge_documents WHERE false'), (error: any) => error.code === '42501');
    await admin.query('BEGIN');
    await admin.query('CREATE TEMP TABLE embedding_test(id text, embedding vector(768)) ON COMMIT DROP');
    const a = [1, ...Array(767).fill(0)], b = [0, 1, ...Array(766).fill(0)];
    await admin.query('INSERT INTO embedding_test VALUES($1,$2::vector),($3,$4::vector)', ['relevant', vectorLiteral(a), 'other', vectorLiteral(b)]);
    const nearest = await admin.query('SELECT id FROM embedding_test ORDER BY embedding <=> $1::vector LIMIT 1', [vectorLiteral(a)]); assert.equal(nearest.rows[0].id, 'relevant');
    await admin.query('ROLLBACK');
  } finally { await admin.end(); await closeKnowledgePool(); }
});
