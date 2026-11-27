import 'dotenv/config';
import pg from 'pg';
import { buildSnapshot } from './build-knowledge.ts';
import { embed } from '../server/rusdi/ai.ts';
import { vectorLiteral } from '../server/rusdi/database.ts';
import type { KnowledgeDocument } from '../server/rusdi/types.ts';

if (!process.env.DATABASE_MIGRATION_URL) throw new Error('Set DATABASE_MIGRATION_URL for publishing knowledge.');

const MAX_CHUNK_CHARS = 1400;
const TARGET_CHUNK_CHARS = 1000;
const CHUNK_OVERLAP_CHARS = 150;
const EMBED_CONCURRENCY = 4;

function chunkDocument(document: KnowledgeDocument): { ordinal: number; content: string }[] {
  const header = `${document.title}\n`;
  const full = `${header}${document.answer}`;
  if (full.length <= MAX_CHUNK_CHARS) return [{ ordinal: 0, content: full }];

  const paragraphs = document.answer.split(/\n\n+/).map(p => p.trim()).filter(Boolean);
  const chunks: string[] = [];
  let current = '';

  const flush = () => {
    const trimmed = current.trim();
    if (trimmed) chunks.push(`${header}${trimmed}`);
  };

  for (const para of paragraphs) {
    if (current && current.length + para.length + 2 > TARGET_CHUNK_CHARS) {
      flush();
      const tail = current.slice(-CHUNK_OVERLAP_CHARS).trim();
      current = tail ? `${tail}\n\n${para}` : para;
    } else {
      current = current ? `${current}\n\n${para}` : para;
    }

    while (current.length > MAX_CHUNK_CHARS) {
      const splitAt = current.lastIndexOf(' ', TARGET_CHUNK_CHARS);
      const cut = splitAt > TARGET_CHUNK_CHARS / 2 ? splitAt : TARGET_CHUNK_CHARS;
      chunks.push(`${header}${current.slice(0, cut).trim()}`);
      current = current.slice(Math.max(0, cut - CHUNK_OVERLAP_CHARS)).trim();
    }
  }
  flush();

  return chunks.map((content, ordinal) => ({ ordinal, content }));
}

const snapshot = await buildSnapshot();
const useEmbeddings = Boolean(process.env.GEMINI_API_KEY?.trim());
if (!useEmbeddings && process.argv.includes('--require-embeddings')) throw new Error('GEMINI_API_KEY is required.');
const model = useEmbeddings ? process.env.RUSDI_EMBEDDING_MODEL || 'gemini-embedding-001' : 'none';
const releaseId = `${snapshot.version}:${model}:768`;
const client = new pg.Client({ connectionString: process.env.DATABASE_MIGRATION_URL });

try {
  await client.connect();
  // Prepare chunks & reuse stored embeddings for identical content before starting transaction.
  const allChunks: { documentId: string; ordinal: number; content: string; vector: string | null }[] = [];
  const toEmbed: number[] = [];

  for (const document of snapshot.documents) {
    for (const chunk of chunkDocument(document)) {
      let stored: string | null = null;
      if (useEmbeddings) {
        const previous = await client.query(
          'SELECT c.embedding::text FROM knowledge_chunks c JOIN knowledge_releases r ON r.id=c.release_id WHERE c.document_id=$1 AND c.content=$2 AND r.embedding_model=$3 AND r.embedding_dimensions=768 AND c.embedding IS NOT NULL ORDER BY r.published_at DESC LIMIT 1',
          [document.id, chunk.content, model],
        );
        stored = previous.rows[0]?.embedding ?? null;
      }
      const index = allChunks.length;
      allChunks.push({ documentId: document.id, ordinal: chunk.ordinal, content: chunk.content, vector: stored });
      if (useEmbeddings && !stored) toEmbed.push(index);
    }
  }

  for (let i = 0; i < toEmbed.length; i += EMBED_CONCURRENCY) {
    const batch = toEmbed.slice(i, i + EMBED_CONCURRENCY);
    await Promise.all(
      batch.map(async index => {
        const item = allChunks[index];
        item.vector = vectorLiteral(await embed(item.content, 'RETRIEVAL_DOCUMENT'));
      }),
    );
  }

  await client.query('BEGIN');
  await client.query("SELECT pg_advisory_xact_lock(hashtext('rusdi-knowledge-publication'))");
  await client.query('UPDATE knowledge_releases SET active=false WHERE active=true');
  await client.query(
    'INSERT INTO knowledge_releases(id,bank_hash,source_hash,embedding_model,embedding_dimensions,active) VALUES($1,$2,$3,$4,768,false) ON CONFLICT(id) DO NOTHING',
    [releaseId, snapshot.bankHash, snapshot.sourceHash, model],
  );
  for (const document of snapshot.documents) {
    await client.query(
      'INSERT INTO knowledge_documents(release_id,id,title,content,keywords,action) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT(release_id,id) DO UPDATE SET title=EXCLUDED.title,content=EXCLUDED.content,keywords=EXCLUDED.keywords,action=EXCLUDED.action',
      [releaseId, document.id, document.title, document.answer, JSON.stringify(document.keywords), document.action],
    );
  }
  const maxOrdinalByDoc = new Map<string, number>();
  for (const chunk of allChunks) {
    await client.query(
      'INSERT INTO knowledge_chunks(release_id,document_id,ordinal,content,embedding) VALUES($1,$2,$3,$4,$5::vector) ON CONFLICT(release_id,document_id,ordinal) DO UPDATE SET content=EXCLUDED.content,embedding=EXCLUDED.embedding',
      [releaseId, chunk.documentId, chunk.ordinal, chunk.content, chunk.vector],
    );
    maxOrdinalByDoc.set(chunk.documentId, Math.max(maxOrdinalByDoc.get(chunk.documentId) ?? -1, chunk.ordinal));
  }
  for (const [documentId, maxOrdinal] of maxOrdinalByDoc) {
    await client.query('DELETE FROM knowledge_chunks WHERE release_id=$1 AND document_id=$2 AND ordinal>$3', [releaseId, documentId, maxOrdinal]);
  }
  for (const form of snapshot.forms) {
    await client.query(
      'INSERT INTO questionnaire_forms(release_id,age_months,source_file,source_hash,source_sheet) VALUES($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING',
      [releaseId, form.ageMonths, form.file, form.hash, form.sheet],
    );
    for (const question of form.questions) {
      await client.query(
        'INSERT INTO questionnaire_questions(release_id,age_months,number,source_text,app_text,category,original_category,source_row) VALUES($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT DO NOTHING',
        [releaseId, form.ageMonths, question.number, question.text, question.appText, question.category, question.originalCategory, question.row],
      );
    }
  }
  await client.query('UPDATE knowledge_releases SET active=true WHERE id=$1', [releaseId]);
  await client.query('COMMIT');
  console.log(JSON.stringify({ release: releaseId, forms: snapshot.forms.length, documents: snapshot.documents.length, chunks: allChunks.length, embeddedNew: toEmbed.length, semanticSearchReady: useEmbeddings }));
  if (!useEmbeddings) console.log('Validated statistics and markdown knowledge are ready. Set GEMINI_API_KEY and run knowledge:ingest -- --require-embeddings to enable semantic retrieval.');
} catch (error) {
  await client.query('ROLLBACK').catch(() => {});
  throw error;
} finally {
  await client.end();
}
