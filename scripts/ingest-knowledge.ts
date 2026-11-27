import 'dotenv/config';
import pg from 'pg';
import { buildSnapshot } from './build-knowledge.ts';
import { embed } from '../server/rusdi/ai.ts';
import { vectorLiteral } from '../server/rusdi/database.ts';

if (!process.env.DATABASE_MIGRATION_URL) throw new Error('Set DATABASE_MIGRATION_URL for publishing knowledge.');
const snapshot = await buildSnapshot();
const useEmbeddings = Boolean(process.env.GEMINI_API_KEY?.trim());
if (!useEmbeddings && process.argv.includes('--require-embeddings')) throw new Error('GEMINI_API_KEY is required.');
const model = useEmbeddings ? process.env.RUSDI_EMBEDDING_MODEL || 'gemini-embedding-001' : 'none';
const releaseId = `${snapshot.version}:${model}:768`;
const client = new pg.Client({ connectionString: process.env.DATABASE_MIGRATION_URL });
try {
  await client.connect();
  // Embeddings are prepared before the publication transaction. Unchanged chunks
  // reuse vectors from this release; failed embedding leaves the active release intact.
  const vectors = new Map<string, string | null>();
  for (const document of snapshot.documents) {
    const previous = useEmbeddings ? await client.query('SELECT c.embedding::text FROM knowledge_chunks c JOIN knowledge_releases r ON r.id=c.release_id WHERE c.document_id=$1 AND c.content=$2 AND r.embedding_model=$3 AND r.embedding_dimensions=768 AND c.embedding IS NOT NULL ORDER BY r.published_at DESC LIMIT 1', [document.id, `${document.title}\n${document.answer}`, model]) : null;
    const stored = previous?.rows[0]?.embedding;
    vectors.set(document.id, stored || (useEmbeddings ? vectorLiteral(await embed(`${document.title}\n${document.answer}`, 'RETRIEVAL_DOCUMENT')) : null));
  }
  await client.query('BEGIN');
  await client.query("SELECT pg_advisory_xact_lock(hashtext('rusdi-knowledge-publication'))");
  await client.query('UPDATE knowledge_releases SET active=false WHERE active=true');
  await client.query('INSERT INTO knowledge_releases(id,bank_hash,source_hash,embedding_model,embedding_dimensions,active) VALUES($1,$2,$3,$4,768,false) ON CONFLICT(id) DO NOTHING', [releaseId, snapshot.bankHash, snapshot.sourceHash, model]);
  for (const document of snapshot.documents) {
    await client.query('INSERT INTO knowledge_documents(release_id,id,title,content,keywords,action) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT(release_id,id) DO NOTHING', [releaseId, document.id, document.title, document.answer, JSON.stringify(document.keywords), document.action]);
    await client.query('INSERT INTO knowledge_chunks(release_id,document_id,ordinal,content,embedding) VALUES($1,$2,0,$3,$4::vector) ON CONFLICT(release_id,document_id,ordinal) DO UPDATE SET embedding=EXCLUDED.embedding', [releaseId, document.id, `${document.title}\n${document.answer}`, vectors.get(document.id)]);
  }
  for (const form of snapshot.forms) {
    await client.query('INSERT INTO questionnaire_forms(release_id,age_months,source_file,source_hash,source_sheet) VALUES($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING', [releaseId, form.ageMonths, form.file, form.hash, form.sheet]);
    for (const question of form.questions) await client.query('INSERT INTO questionnaire_questions(release_id,age_months,number,source_text,app_text,category,original_category,source_row) VALUES($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT DO NOTHING', [releaseId, form.ageMonths, question.number, question.text, question.appText, question.category, question.originalCategory, question.row]);
  }
  await client.query('UPDATE knowledge_releases SET active=true WHERE id=$1', [releaseId]);
  await client.query('COMMIT');
  console.log(JSON.stringify({ release: releaseId, forms: snapshot.forms.length, documents: snapshot.documents.length, semanticSearchReady: useEmbeddings }));
  if (!useEmbeddings) console.log('Validated statistics and FAQ are ready. Set GEMINI_API_KEY and run knowledge:ingest -- --require-embeddings to enable semantic retrieval.');
} catch (error) { await client.query('ROLLBACK').catch(() => {}); throw error; }
finally { await client.end(); }
