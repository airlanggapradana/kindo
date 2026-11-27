import ExcelJS from 'exceljs';
import { createHash } from 'node:crypto';
import { readFile, readdir, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { QUESTIONS_DATA, AGE_EQUIPMENT_DATA } from '../src/data/questions.ts';
import type { KnowledgeSnapshot, KnowledgeForm, KnowledgeDocument } from '../server/rusdi/types.ts';

const root = fileURLToPath(new URL('../', import.meta.url));
export const hash = (value: string | Buffer) => createHash('sha256').update(value).digest('hex');
export const normalize = (value: string) => value.normalize('NFKC').toLowerCase().replace(/[“”"'‘’]/g, '').replace(/\s+/g, ' ').trim();
const aliases: Record<string, string> = {
  'gerak kasar': 'Gerak Kasar', 'gerak halus': 'Gerak Halus', 'bicara dan bahasa': 'Bicara dan Bahasa',
  'bicara dan bahas': 'Bicara dan Bahasa', 'sosial dan kemandirian': 'Sosialisasi dan Kemandirian',
  'sosialisasi dan kemandirian': 'Sosialisasi dan Kemandirian', 'sosialiasi dan kemandirian': 'Sosialisasi dan Kemandirian',
};

export async function buildSnapshot(): Promise<KnowledgeSnapshot> {
  const directory = path.join(root, 'data/kpsp/source');
  const files = (await readdir(directory)).filter(file => /^\d+_bulan\.xlsx$/.test(file)).sort((a, b) => parseInt(a) - parseInt(b));
  if (files.length !== Object.keys(QUESTIONS_DATA).length) throw new Error('Jumlah workbook tidak cocok dengan bank aplikasi; publikasi dibatalkan.');
  const forms: KnowledgeForm[] = []; const differences: KnowledgeSnapshot['textDifferences'] = [];
  for (const file of files) {
    const ageMonths = parseInt(file); const active = QUESTIONS_DATA[`${ageMonths}_bulan` as keyof typeof QUESTIONS_DATA];
    if (!active) throw new Error(`Usia tanpa bank aplikasi: ${ageMonths}`);
    const bytes = await readFile(path.join(directory, file));
    const workbook = new ExcelJS.Workbook(); await workbook.xlsx.load(bytes as any);
    const candidates = workbook.worksheets.filter(sheet => !/intervensi/i.test(sheet.name)).map(sheet => {
      const questions: KnowledgeForm['questions'] = [];
      sheet.eachRow((row, rowNumber) => {
        const number = Number(row.getCell(1).value); const text = row.getCell(2).text.trim(); const originalCategory = row.getCell(3).text.trim();
        if (!Number.isInteger(number) || number < 1 || number > active.length || !text || !originalCategory) return;
        const category = aliases[normalize(originalCategory)];
        if (!category) throw new Error(`Kategori belum dipetakan: ${file}:${rowNumber} ${originalCategory}`);
        questions.push({ number, text, appText: active[number - 1].pertanyaan, category, originalCategory, row: rowNumber });
      });
      return { sheet, questions };
    }).filter(candidate => candidate.questions.length > 0);
    if (candidates.length !== 1) throw new Error(`Sheet pertanyaan ambigu atau kosong: ${file}`);
    const { sheet, questions } = candidates[0]; questions.sort((a, b) => a.number - b.number);
    if (questions.length !== active.length || questions.some((question, i) => question.number !== i + 1)) throw new Error(`Nomor atau jumlah pertanyaan tidak cocok: ${file}`);
    for (const question of questions) if (normalize(question.text) !== normalize(question.appText)) differences.push({ ageMonths, number: question.number });
    forms.push({ ageMonths, file, hash: hash(bytes), sheet: sheet.name, questions });
  }
  const documents = JSON.parse(await readFile(path.join(root, 'app_knowledge/rusdi-app.json'), 'utf8')) as KnowledgeDocument[];
  const ids = new Set<string>();
  for (const document of documents) {
    if (!/^APP\d{3}$/.test(document.id) || ids.has(document.id) || !document.title || !document.answer || !Array.isArray(document.keywords)) throw new Error('Dokumen knowledge tidak valid atau ID ganda.');
    ids.add(document.id);
  }
  const bankHash = hash(JSON.stringify({ questions: QUESTIONS_DATA, equipment: AGE_EQUIPMENT_DATA }));
  const sourceHash = hash(JSON.stringify(forms.map(form => [form.file, form.hash])));
  const version = hash(JSON.stringify({ bankHash, sourceHash, documents, parser: 1 }));
  return { version, bankHash, sourceHash, documents, forms, textDifferences: differences };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const snapshot = await buildSnapshot();
  await mkdir(path.join(root, 'server/rusdi'), { recursive: true });
  await writeFile(path.join(root, 'server/rusdi/knowledge-snapshot.json'), JSON.stringify(snapshot, null, 2) + '\n');
  console.log(JSON.stringify({ version: snapshot.version.slice(0, 12), forms: snapshot.forms.length, questions: snapshot.forms.reduce((n, form) => n + form.questions.length, 0), documents: snapshot.documents.length, textDifferences: snapshot.textDifferences.length }));
  if (snapshot.textDifferences.length) console.log('Perbedaan teks dicatat di snapshot. Hanya FAQ produk yang masuk indeks; teks klinis tidak dipublikasikan sebagai knowledge jawaban.');
}
