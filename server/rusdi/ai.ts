import { GoogleGenAI } from '@google/genai';
import { vectorLiteral } from './database.ts';

export function gemini() {
  const key = process.env.GEMINI_API_KEY?.trim();
  return key ? new GoogleGenAI({ apiKey: key }) : null;
}
export async function embed(text: string, taskType: 'RETRIEVAL_DOCUMENT' | 'RETRIEVAL_QUERY') {
  const ai = gemini(); if (!ai) throw new Error('Embedding provider not configured');
  const model = process.env.RUSDI_EMBEDDING_MODEL || 'gemini-embedding-001';
  if (process.env.RUSDI_EMBEDDING_DIMENSIONS && Number(process.env.RUSDI_EMBEDDING_DIMENSIONS) !== 768) throw new Error('This schema requires 768 dimensions');
  if (model !== 'gemini-embedding-001') throw new Error('This adapter supports gemini-embedding-001. Add and validate an adapter before changing models.');
  const response = await ai.models.embedContent({ model, contents: text,
    config: { outputDimensionality: 768, taskType, httpOptions: { timeout: 3000 } } });
  const values = response.embeddings?.[0]?.values;
  if (!values) throw new Error('Embedding response missing');
  vectorLiteral(values);
  return values;
}
