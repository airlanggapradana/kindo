import ExcelJS from 'exceljs';
import { createHash } from 'node:crypto';
import { readFile, readdir, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { QUESTIONS_DATA, AGE_EQUIPMENT_DATA } from '../src/data/questions.ts';
import type { ActionId, KnowledgeSnapshot, KnowledgeForm, KnowledgeDocument } from '../server/rusdi/types.ts';

const root = fileURLToPath(new URL('../', import.meta.url));
export const hash = (value: string | Buffer) => createHash('sha256').update(value).digest('hex');
export const normalize = (value: string) => value.normalize('NFKC').toLowerCase().replace(/[“”"'‘’]/g, '').replace(/\s+/g, ' ').trim();
const aliases: Record<string, string> = {
  'gerak kasar': 'Gerak Kasar', 'gerak halus': 'Gerak Halus', 'bicara dan bahasa': 'Bicara dan Bahasa',
  'bicara dan bahas': 'Bicara dan Bahasa', 'sosial dan kemandirian': 'Sosialisasi dan Kemandirian',
  'sosialisasi dan kemandirian': 'Sosialisasi dan Kemandirian', 'sosialiasi dan kemandirian': 'Sosialisasi dan Kemandirian',
};

const EXCLUDED_MARKDOWN_FILES = new Set(['readme.md', 'rusdi_integration.md']);

interface Frontmatter {
  id?: string;
  title?: string;
  category?: string;
  audience: string[];
  keywords: string[];
}

function parseListValue(raw: string): string[] {
  const inner = raw.trim().replace(/^\[/, '').replace(/\]$/, '');
  return inner
    .split(',')
    .map(item => item.trim().replace(/^['"]|['"]$/g, '').trim())
    .filter(Boolean);
}

function parseFrontmatter(markdown: string): { frontmatter: Frontmatter; body: string } {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  const frontmatter: Frontmatter = { audience: [], keywords: [] };
  if (!match) return { frontmatter, body: markdown };

  const lines = match[1].split(/\r?\n/);
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const keyMatch = line.match(/^([a-zA-Z0-9_-]+)\s*:\s*(.*)$/);
    if (!keyMatch) { i++; continue; }
    const key = keyMatch[1].toLowerCase();
    let value = keyMatch[2].trim();

    if (key === 'keywords' || key === 'audience') {
      if (value.startsWith('[')) {
        let combined = value;
        while (!combined.includes(']') && i + 1 < lines.length) {
          i++;
          combined += ' ' + lines[i].trim();
        }
        frontmatter[key] = parseListValue(combined);
      } else if (!value) {
        const collected: string[] = [];
        let bracketMode = false;
        let combined = '';
        while (i + 1 < lines.length) {
          const next = lines[i + 1].trim();
          if (/^[a-zA-Z0-9_-]+\s*:/.test(lines[i + 1])) break;
          i++;
          if (next.startsWith('[') || bracketMode) {
            bracketMode = true;
            combined += ' ' + next;
            if (next.includes(']')) {
              collected.push(...parseListValue(combined));
              bracketMode = false;
              combined = '';
            }
          } else if (next.startsWith('- ')) {
            const item = next.slice(2).trim().replace(/^['"]|['"]$/g, '');
            if (item) collected.push(item);
          }
        }
        frontmatter[key] = collected;
      } else {
        frontmatter[key] = parseListValue(value);
      }
    } else if (key === 'id' || key === 'title' || key === 'category') {
      frontmatter[key] = value.replace(/^['"]|['"]$/g, '').trim();
    }
    i++;
  }

  return { frontmatter, body: markdown.slice(match[0].length) };
}

function slugify(value: string): string {
  return value
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

function cleanInlineMarkdown(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/(?<!\w)\*([^*\n]+)\*(?!\w)/g, '$1')
    .replace(/(?<!\w)_([^_\n]+)_(?!\w)/g, '$1')
    .replace(/`([^`]+)`/g, '$1');
}

function convertMarkdownTables(text: string): string {
  const lines = text.split(/\r?\n/);
  const output: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const next = lines[i + 1] ?? '';
    const isTableHeader = line.trim().startsWith('|') && line.trim().endsWith('|') && /^\s*\|[\s:-]+(\|[\s:-]+)+\|\s*$/.test(next);
    if (!isTableHeader) {
      output.push(line);
      i++;
      continue;
    }

    const headers = line.trim().slice(1, -1).split('|').map(cell => cleanInlineMarkdown(cell.trim()));
    i += 2; // Skip header and separator row
    while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
      const cells = lines[i].trim().slice(1, -1).split('|').map(cell => cleanInlineMarkdown(cell.trim()));
      if (cells.length === 2) {
        output.push(`- ${cells[0]}: ${cells[1]}`);
      } else if (cells.length > 2) {
        const pairs = cells.slice(1).map((cell, idx) => {
          const header = headers[idx + 1];
          return header ? `${header}: ${cell}` : cell;
        });
        output.push(`- ${cells[0]} — ${pairs.join('; ')}`);
      }
      i++;
    }
  }

  return output.join('\n');
}

export function cleanMarkdownText(raw: string): string {
  const withTables = convertMarkdownTables(raw);
  const lines = withTables
    .split(/\r?\n/)
    .filter(line => !/^\s*---+\s*$/.test(line))
    .map(line => {
      const h4 = line.match(/^#{4,6}\s+(.*)$/);
      if (h4) return `\n${cleanInlineMarkdown(h4[1].trim())}:`;
      const h3 = line.match(/^###\s+(.*)$/);
      if (h3) return `\n${cleanInlineMarkdown(h3[1].trim())}:`;
      const blockquote = line.match(/^\s*>\s?(.*)$/);
      if (blockquote) return cleanInlineMarkdown(blockquote[1]);
      return cleanInlineMarkdown(line);
    });

  return lines
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

interface RawSection {
  h2: string;
  h3: string;
  content: string;
}

const WRAPPER_H2 = /^(pertanyaan umum|pemecahan masalah|bagian \d+|struktur fitur)/i;
const KEEP_TOGETHER_H3 = /^(langkah|tahap|step)\s+\d+|^\d+\.\s+/i;

function splitMarkdownSections(body: string, fallbackTitle: string): RawSection[] {
  const lines = body.split(/\r?\n/);
  const hasH2 = lines.some(line => /^##\s+/.test(line));
  const h2Blocks: { h2: string; lines: string[] }[] = [];
  let current: { h2: string; lines: string[] } | null = null;
  let inFence = false;

  for (const line of lines) {
    if (/^\s*```/.test(line)) inFence = !inFence;
    if (!inFence) {
      if (/^#\s+/.test(line)) continue; // Skip H1 doc title
      const h2Match = line.match(/^##\s+(.*)$/);
      if (h2Match) {
        if (current) h2Blocks.push(current);
        current = { h2: cleanInlineMarkdown(h2Match[1].trim()), lines: [] };
        continue;
      }
    }
    if (!current) {
      if (hasH2) continue; // Ignore brief preamble before the first ## heading
      current = { h2: fallbackTitle, lines: [] };
    }
    current.lines.push(line);
  }
  if (current) h2Blocks.push(current);

  const sections: RawSection[] = [];
  for (const block of h2Blocks) {
    const rawBlockText = block.lines.join('\n').trim();
    if (!rawBlockText) continue;

    // Collect ### sub-blocks within this ## block
    const leadLines: string[] = [];
    const h3Blocks: { h3: string; lines: string[] }[] = [];
    let activeH3: { h3: string; lines: string[] } | null = null;
    let fence = false;

    for (const line of block.lines) {
      if (/^\s*```/.test(line)) fence = !fence;
      if (!fence) {
        const h3Match = line.match(/^###\s+(.*)$/);
        if (h3Match) {
          if (activeH3) h3Blocks.push(activeH3);
          activeH3 = { h3: cleanInlineMarkdown(h3Match[1].trim()), lines: [] };
          continue;
        }
      }
      if (activeH3) activeH3.lines.push(line);
      else leadLines.push(line);
    }
    if (activeH3) h3Blocks.push(activeH3);

    const allKeepTogether = h3Blocks.length > 0 && h3Blocks.every(sub => KEEP_TOGETHER_H3.test(sub.h3));
    if (h3Blocks.length === 0 || (allKeepTogether && rawBlockText.length <= 2400)) {
      const cleaned = cleanMarkdownText(rawBlockText);
      if (cleaned) sections.push({ h2: block.h2, h3: '', content: cleaned });
      continue;
    }

    const leadText = cleanMarkdownText(leadLines.join('\n'));
    if (leadText && (leadText.length >= 260 || h3Blocks.length > 3)) {
      sections.push({ h2: block.h2, h3: '', content: leadText });
    }

    for (const sub of h3Blocks) {
      const subText = cleanMarkdownText(sub.lines.join('\n'));
      if (!subText) continue;
      const shouldPrependLead = Boolean(leadText && leadText.length < 260 && h3Blocks.length <= 3);
      sections.push({
        h2: block.h2,
        h3: sub.h3,
        content: shouldPrependLead ? `${leadText}\n\n${subText}` : subText,
      });
    }
  }

  return sections;
}

const SYNONYM_HINTS: [RegExp, string[]][] = [
  [/tim pengembang|universitas muhammadiyah surakarta|project leader|fullstack developer/i, ['developer', 'pengembang', 'pembuat', 'pencipta', 'tim pengembang', 'siapa developer', 'siapa pembuat', 'siapa yang membuat', 'siapa yang bikin', 'ums', 'universitas', 'institusi', 'alamat']],
  [/biaya layanan|100% gratis|apakah aplikasi kindo berbayar/i, ['gratis', 'biaya', 'berbayar', 'bayar', 'harga']],
  [/apa itu kindo/i, ['apa itu kindo', 'tentang kindo', 'tentang aplikasi', 'aplikasi ini', 'kindo buat apa', 'growthsync']],
  [/fitur utama kindo/i, ['fitur kindo', 'fitur utama', 'fitur aplikasi', 'keunggulan']],
  [/dwibahasa|ganti bahasa|bahasa inggris/i, ['bahasa', 'ganti bahasa', 'bahasa inggris', 'english']],
  [/mode gelap|dark mode/i, ['mode gelap', 'dark mode', 'mode terang', 'light mode', 'tema']],
  [/tugas.*coming soon|coming soon/i, ['menu tugas', 'tugas', 'tasks', 'coming soon']],
  [/cara mendaftar|pendaftaran/i, ['daftar', 'registrasi', 'buat akun', 'sign up']],
  [/cara masuk|login/i, ['login', 'masuk', 'masuk akun', 'sign in']],
  [/cara keluar|logout/i, ['logout', 'keluar', 'sign out']],
  [/membuat profil anak|menambahkan lebih dari satu anak|multi-profil/i, ['tambah anak', 'profil anak', 'onboarding', 'lebih dari satu anak', 'banyak anak', 'child switcher']],
  [/kurva pertumbuhan|mencatat atau mengubah data pertumbuhan/i, ['grafik pertumbuhan', 'kurva pertumbuhan', 'berat badan', 'tinggi badan', 'lingkar kepala', 'input pengukuran', 'who']],
  [/ekspor.*csv|format csv/i, ['export csv', 'ekspor csv', 'unduh csv', 'download csv', 'csv']],
  [/ekspor.*pdf|laporan medis pdf/i, ['export pdf', 'ekspor pdf', 'unduh pdf', 'download pdf', 'cetak pdf', 'laporan pdf']],
  [/simpan hasil|menyimpan hasil|riwayat skrining/i, ['simpan hasil', 'riwayat', 'riwayat skrining', 'hasil sebelumnya', 'hasil tersimpan']],
  [/alur pengisian kuesioner|memulai skrining/i, ['mulai skrining', 'cara skrining', 'isi kuesioner', 'mengisi kpsp', 'jawab soal']],
  [/4 domain|aspek perkembangan/i, ['aspek', 'kategori', 'domain perkembangan', 'apa yang dinilai']],
  [/alat peraga|persiapan alat/i, ['alat', 'alat peraga', 'persiapan', 'peralatan', 'siapkan apa']],
  [/interpretasi skor|skor kpsp/i, ['arti skor', 'makna hasil', 'hasil meragukan', 'status sesuai', 'status penyimpangan', 'skor 7', 'skor 8', 'skor 9', 'skor 6']],
  [/telekonsultasi|konsultasi nakes|aturan rujukan/i, ['konsultasi', 'konsultasi nakes', 'chat nakes', 'hubungi nakes', 'tanya dokter', 'rujukan']],
  [/puskesmas terdekat|puskesmas finder|rute ke puskesmas/i, ['puskesmas', 'cari puskesmas', 'faskes', 'peta', 'lokasi', 'gps', 'google maps', 'rute']],
  [/edukasi|stimulasi|sumber daya.*resmi/i, ['edukasi', 'panduan edukasi', 'stimulasi', 'aktivitas harian', 'buku kia', 'idai', 'primaku', 'unicef']],
  [/verifikasi.*sip|mengklaim pasien|dashboard tenaga kesehatan/i, ['verifikasi sip', 'klaim pasien', 'dashboard nakes', 'pasien saya']],
  [/administrator|admin dashboard|audit log/i, ['admin', 'dashboard admin', 'tambah nakes', 'audit log']],
  [/kebijakan privasi|keamanan data|hak pengguna/i, ['privasi', 'kebijakan privasi', 'keamanan data', 'data pribadi', 'hapus akun']],
  [/syarat dan ketentuan/i, ['syarat dan ketentuan', 'ketentuan layanan', 'hak cipta']],
  [/batasan medis|medical disclaimer|gawat darurat/i, ['disclaimer medis', 'bukan diagnosis', 'darurat', '119', 'igd']],
];

function inferAction(file: string, title: string, _content: string, category?: string): ActionId | null {
  const heading = title.toLowerCase();
  if (category === 'legal_and_safety') {
    return /batasan medis|disclaimer/.test(heading) ? 'open_consultation' : null;
  }
  if (/tim pengembang|biaya layanan|berbayar|apa itu kindo|masalah yang diselesaikan|dwibahasa|ganti bahasa|mode gelap|dark mode|navigasi|keluar|logout|mendaftar|pendaftaran|kendala umum|peran pengguna/.test(heading)) {
    return null;
  }
  if (/tambah anak|menambahkan lebih dari satu anak|membuat profil anak|multi-profil|child switcher/.test(heading)) return 'open_onboarding';
  if (/puskesmas|rute berkendara|deteksi lokasi/.test(heading)) return 'open_puskesmas';
  if (/konsultasi|telekonsultasi|rujukan|chat ke dokter|klaim pasien|mengklai/.test(heading)) return 'open_consultation';
  if (/edukasi|stimulasi|sumber daya.*resmi|menu.*tugas|coming soon/.test(heading) || category === 'education') return 'open_education';
  if (/ekspor.*pdf|laporan.*pdf|laporan hasil skrining|simpan hasil|menyimpan hasil|riwayat skrining|ekspor.*csv|kurva pertumbuhan|grafik pertumbuhan|tab metrik|median who|mencatat atau mengubah data pertumbuhan|ringkasan statistik|dashboard|cara masuk/.test(heading)) {
    return 'open_dashboard';
  }
  if (/kpsp|skrining|kuesioner|alat peraga|domain|aspek perkembangan|interpretasi skor|kelompok usia|ilustrasi|local engine/.test(heading) || category === 'kpsp_screening') {
    return 'open_screening';
  }
  if (file.startsWith('07_')) return 'open_dashboard';
  return null;
}

function buildSectionKeywords(sectionTitle: string, content: string, frontmatterKeywords: string[], isFirstSection: boolean): string[] {
  const kw = new Set<string>();
  const normalizedTitle = normalize(sectionTitle);
  const normalizedAll = normalize(`${sectionTitle} ${content}`);

  if (normalizedTitle) kw.add(normalizedTitle);
  for (const part of sectionTitle.split(/[—:,/()]+/)) {
    const clean = normalize(part);
    if (clean.length >= 3) kw.add(clean);
  }

  for (const keyword of frontmatterKeywords) {
    const norm = normalize(keyword);
    if (!norm) continue;
    if (isFirstSection || normalizedAll.includes(norm)) kw.add(norm);
  }

  for (const [pattern, extras] of SYNONYM_HINTS) {
    if (pattern.test(`${sectionTitle}\n${content}`)) {
      for (const extra of extras) kw.add(extra);
    }
  }

  return [...kw];
}

export async function loadMarkdownDocuments(): Promise<{ documents: KnowledgeDocument[]; markdownFiles: { file: string; hash: string }[] }> {
  const directory = path.join(root, 'app_knowledge');
  const files = (await readdir(directory))
    .filter(file => file.toLowerCase().endsWith('.md') && !EXCLUDED_MARKDOWN_FILES.has(file.toLowerCase()))
    .sort((a, b) => a.localeCompare(b));
  if (!files.length) throw new Error('Tidak ada file Markdown di folder app_knowledge.');

  const documents: KnowledgeDocument[] = [];
  const markdownFiles: { file: string; hash: string }[] = [];
  const usedIds = new Set<string>();

  for (const file of files) {
    const raw = await readFile(path.join(directory, file), 'utf8');
    const { frontmatter, body } = parseFrontmatter(raw);
    if (frontmatter.category?.toLowerCase() === 'meta') continue;

    markdownFiles.push({ file, hash: hash(raw) });
    const h1Match = body.match(/^#\s+(.*)$/m);
    const docTitle = frontmatter.title || (h1Match ? cleanInlineMarkdown(h1Match[1].trim()) : file.replace(/\.md$/i, ''));
    const filePrefix = file.match(/^(\d+)_/)?.[1] || slugify(file.replace(/\.md$/i, ''));
    const sections = splitMarkdownSections(body, docTitle);

    sections.forEach((section, index) => {
      const displayTitle = section.h3
        ? WRAPPER_H2.test(section.h2)
          ? section.h3
          : `${section.h2} — ${section.h3}`
        : section.h2;

      const baseSlug = slugify(section.h3 || section.h2 || `${index + 1}`);
      let id = `${filePrefix}-${baseSlug || index + 1}`;
      let suffix = 2;
      while (usedIds.has(id)) {
        id = `${filePrefix}-${baseSlug || index + 1}-${suffix++}`;
      }
      usedIds.add(id);

      const keywords = buildSectionKeywords(displayTitle, section.content, frontmatter.keywords, index === 0);
      const action = inferAction(file, displayTitle, section.content, frontmatter.category);

      documents.push({
        id,
        title: displayTitle,
        keywords,
        answer: section.content,
        action,
        sourceFile: file,
        category: frontmatter.category,
      });
    });
  }

  if (!documents.length) throw new Error('Tidak ada dokumen knowledge yang berhasil diekstrak dari app_knowledge/*.md.');
  return { documents, markdownFiles };
}

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
  const { documents, markdownFiles } = await loadMarkdownDocuments();
  const bankHash = hash(JSON.stringify({ questions: QUESTIONS_DATA, equipment: AGE_EQUIPMENT_DATA }));
  const sourceHash = hash(JSON.stringify({ forms: forms.map(form => [form.file, form.hash]), markdownFiles }));
  const version = hash(JSON.stringify({ bankHash, sourceHash, documents, parser: 2 }));
  return { version, bankHash, sourceHash, documents, forms, textDifferences: differences };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const snapshot = await buildSnapshot();
  await mkdir(path.join(root, 'server/rusdi'), { recursive: true });
  await writeFile(path.join(root, 'server/rusdi/knowledge-snapshot.json'), JSON.stringify(snapshot, null, 2) + '\n');
  console.log(JSON.stringify({ version: snapshot.version.slice(0, 12), forms: snapshot.forms.length, questions: snapshot.forms.reduce((n, form) => n + form.questions.length, 0), documents: snapshot.documents.length, textDifferences: snapshot.textDifferences.length }));
  if (snapshot.textDifferences.length) console.log('Perbedaan teks dicatat di snapshot. Knowledge aplikasi dibaca dari app_knowledge/*.md; teks klinis soal tidak dipublikasikan sebagai knowledge jawaban.');
}
