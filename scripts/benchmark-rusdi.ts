import 'dotenv/config';
import { questionnaireStats } from '../server/rusdi/service.ts';
import { closeKnowledgePool } from '../server/rusdi/database.ts';

const durations: number[] = [];
let index = 0;
try {
  await questionnaireStats();
  await Promise.all(Array.from({ length: 10 }, async () => {
    while (index++ < 50) {
      const start = performance.now(); const stats = await questionnaireStats();
      if (stats.source !== 'database') throw new Error('Benchmark requires the published database release, not snapshot fallback.');
      durations.push(performance.now() - start);
    }
  }));
  durations.sort((a,b) => a-b);
  console.log(JSON.stringify({ operation: 'database_statistics', requests: durations.length, concurrency: 10, p95Ms: Math.round(durations[Math.ceil(durations.length * .95) - 1]), maxMs: Math.round(durations.at(-1)!) }));
} finally { await closeKnowledgePool(); }
