import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { once } from 'node:events';
import { requireUser, rateLimit } from '../server/http.ts';

test('authentication rejects missing and malformed tokens before invoking endpoint', async () => {
  let reached = false;
  const app = express(); app.get('/protected', requireUser, (_req, res) => { reached = true; res.json({ success: true }); });
  const server = app.listen(0,'127.0.0.1'); await once(server,'listening');
  try {
    const url = `http://127.0.0.1:${(server.address() as any).port}/protected`;
    const cases: Record<string,string>[] = [{}, { Authorization: 'Bearer invalid' }, { Authorization: 'Basic anything' }];
    for (const headers of cases) { const response = await fetch(url,{headers}); assert.equal(response.status,401); await response.arrayBuffer(); }
    assert.equal(reached,false);
  } finally { await new Promise<void>(resolve => server.close(() => resolve())); }
});
test('quota returns 429 with retry information and ignores spoofed UID body', async () => {
  const app = express(); app.use(express.json()); app.use((_req,res,next)=>{res.locals.uid='verified-user';next();});
  app.post('/chat',rateLimit(2,2),(_req,res)=>{res.json({ok:true});});
  const server = app.listen(0,'127.0.0.1'); await once(server,'listening');
  try {
    const url = `http://127.0.0.1:${(server.address() as any).port}/chat`;
    for (let i=0;i<3;i++) { const response=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({uid:`forged-${i}`})}); assert.equal(response.status,i<2?200:429); if(i===2) assert.equal(response.headers.get('Retry-After'),'60'); await response.arrayBuffer(); }
  } finally { await new Promise<void>(resolve=>server.close(()=>resolve())); }
});
