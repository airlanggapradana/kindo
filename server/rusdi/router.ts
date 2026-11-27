import { Router } from 'express';
import { rateLimit } from '../http.ts';
import { activeRelease, parseChatInput, publicSource, questionnaireStats, respond, snapshot } from './service.ts';
import { getPool } from './database.ts';

export function rusdiRouter() {
  const router = Router();
  const issued = new Map<string, { uid: string; version: string; time: number }>();
  const enabled = () => process.env.RUSDI_ENABLED !== 'false';
  router.get('/config', async (_req, res) => {
    if (!enabled()) { res.json({ enabled: false }); return; }
    let semanticSearchReady = false;
    try { semanticSearchReady = (await activeRelease()).embedding_model !== 'none' && Boolean(process.env.GEMINI_API_KEY && process.env.RUSDI_GENERATION_MODEL); } catch {}
    res.json({ enabled: true, semanticSearchReady, version: snapshot.version });
  });
  router.use((_req, res, next) => { if (!enabled()) { res.status(503).json({ error: 'Rusdi sementara tidak tersedia.' }); return; } next(); });
  router.post('/chat', rateLimit(), async (req, res) => {
    const input = parseChatInput(req.body);
    if (!input) { res.status(400).json({ error: 'Pesan atau konteks percakapan tidak valid.' }); return; }
    const start = performance.now();
    try {
      const answer = await respond(input);
      if (issued.size >= 10000) for (const [key, value] of issued) if (Date.now() - value.time > 3600000) issued.delete(key);
      if (issued.size < 10000) issued.set(answer.requestId, { uid: res.locals.uid, version: answer.knowledgeVersion, time: Date.now() });
      console.info(JSON.stringify({ tag: 'RUSDI', requestId: answer.requestId, mode: answer.mode, version: answer.knowledgeVersion, durationMs: Math.round(performance.now() - start) }));
      res.status(answer.mode === 'unavailable' ? 503 : 200).json(answer);
    } catch { res.status(503).json({ error: 'Rusdi belum dapat menjawab. Silakan coba lagi.' }); }
  });
  router.get('/questionnaires', async (req, res) => {
    const age = req.query.ageMonths;
    if (age != null && (typeof age !== 'string' || !/^\d{1,2}$/.test(age))) { res.status(400).json({ error: 'Usia tidak valid.' }); return; }
    try {
      const stats = await questionnaireStats();
      res.json({ ...stats, forms: age == null ? stats.forms : stats.forms.filter(form => form.ageMonths === Number(age)) });
    } catch { res.status(503).json({ error: 'Data formulir sedang diperbarui.' }); }
  });
  router.get('/sources/:id', (req, res) => {
    const source = publicSource(String(req.params.id));
    if (!source) { res.status(404).json({ error: 'Sumber tidak ditemukan.' }); return; }
    res.json(source);
  });
  router.post('/feedback', rateLimit(30, 200), async (req, res) => {
    const { requestId, helpful, reason } = req.body ?? {};
    if (typeof requestId !== 'string' || typeof helpful !== 'boolean' || reason != null && !['incorrect','unclear','missing_source','other'].includes(reason)) { res.status(400).json({ error: 'Penilaian tidak valid.' }); return; }
    const entry = issued.get(requestId);
    if (!entry || entry.uid !== res.locals.uid || Date.now() - entry.time > 3600000) { res.status(403).json({ error: 'Penilaian tidak tersedia untuk percakapan ini.' }); return; }
    try {
      if (entry.version.endsWith(':snapshot')) { res.status(503).json({ error: 'Penilaian belum dapat disimpan. Silakan coba nanti.' }); return; }
      await getPool().query('INSERT INTO rusdi_feedback(request_id,uid,release_id,helpful,reason) VALUES($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING', [requestId, res.locals.uid, entry.version, helpful, reason ?? null]);
      res.json({ saved: true });
    } catch { res.status(503).json({ error: 'Penilaian belum dapat disimpan. Silakan coba nanti.' }); }
  });
  return router;
}
