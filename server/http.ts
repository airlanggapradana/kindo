import type { RequestHandler } from 'express';
import { getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import config from '../firebase-applet-config.json';

export const requireUser: RequestHandler = async (req, res, next) => {
  const token = req.headers.authorization?.match(/^Bearer ([^\s]+)$/)?.[1];
  if (!token) { res.status(401).json({ error: 'Silakan masuk kembali untuk menggunakan fitur ini.' }); return; }
  try {
    const app = getApps().find(app => app.name === 'kindo-server') ?? initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID || config.projectId }, 'kindo-server');
    const decoded = await getAuth(app).verifyIdToken(token);
    res.locals.uid = decoded.uid;
    next();
  } catch {
    res.status(401).json({ error: 'Sesi tidak valid atau kedaluwarsa. Silakan masuk kembali.' });
  }
};

// In-memory quotas are bounded and deliberately reset on restart; run one API instance
// or replace this store with a shared quota store before horizontal scaling.
export function rateLimit(perMinute = 10, perDay = 100): RequestHandler {
  const entries = new Map<string, { minute: number; day: number; minuteCount: number; dayCount: number }>();
  return (req, res, next) => {
    const now = Date.now(); const minute = Math.floor(now / 60000); const day = Math.floor(now / 86400000);
    if (entries.size > 10000) for (const [key, entry] of entries) if (entry.day !== day) entries.delete(key);
    const keys = [`uid:${res.locals.uid || req.ip}`, `ip:${req.ip}`];
    for (const key of keys) {
      const entry = entries.get(key) ?? { minute, day, minuteCount: 0, dayCount: 0 };
      if (entry.minute !== minute) { entry.minute = minute; entry.minuteCount = 0; }
      if (entry.day !== day) { entry.day = day; entry.dayCount = 0; }
      const multiplier = key.startsWith('ip:') ? 5 : 1;
      if (entry.minuteCount >= perMinute * multiplier || entry.dayCount >= perDay * multiplier || entries.size >= 20000 && !entries.has(key)) {
        res.set('Retry-After', '60').status(429).json({ error: 'Batas penggunaan tercapai. Silakan coba lagi nanti.' }); return;
      }
      entries.set(key, entry);
    }
    for (const key of new Set(keys)) { const entry = entries.get(key)!; entry.minuteCount++; entry.dayCount++; }
    next();
  };
}
