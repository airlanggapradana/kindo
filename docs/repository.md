# Panduan struktur repository

Jalankan perintah proyek dari folder utama yang berisi `package.json`.

| Folder / file | Isi dan aturan penempatan |
| --- | --- |
| `src/` | Kode frontend, tipe, utilitas, dan data yang diimpor aplikasi. |
| `server.ts` | Server Express dan endpoint API; tetap di root agar perintah dev dan build tetap sesuai. |
| `public/` | Aset yang dipakai aplikasi melalui URL publik, termasuk ilustrasi soal dan foto tim. |
| `data/kpsp/source/` | Spreadsheet KPSP berdasarkan usia dan snapshot HTML sumber. |
| `data/kpsp/extracted/` | Hasil ekstraksi mentah, teks pertanyaan, dan JSON yang sudah dibersihkan. |
| `docs/` | Ringkasan arsitektur, blueprint Firebase, draf desain, dan referensi pengembangan. |
| `scripts/` | Utilitas proyek yang masih digunakan, seperti pembersihan hasil build. |
| `archive/scripts/` | Skrip migrasi antarmuka dan perbaikan sekali pakai dari pengembangan sebelumnya. |
| `archive/patches/` | Patch historis yang disimpan untuk referensi. |
| `firebase-applet-config.json` | Konfigurasi yang diimpor frontend; tetap di root. |
| `firestore.rules`, `metadata.json` | Aturan Firestore dan metadata integrasi; tetap di root. |

## Referensi

- [Overview aplikasi](overview.md)
- [Draf design system](design/design-system.md) dan [aset referensi desain](design/assets/)
- [Blueprint model Firebase](firebase-blueprint.json)
- [Referensi intervensi kuesioner](references/intervensi-kuesioner.md)

Dokumen overview dan desain merupakan draf historis yang sudah ada di repository.
Periksa implementasi aktif sebelum memakai deskripsinya sebagai acuan perubahan.
Gambar referensi desain berada di `docs/design/assets/` agar tidak ikut disalin ke hasil build publik.

## Data KPSP

Spreadsheet dan hasil ekstraksi disimpan sebagai bahan sumber. Aplikasi membaca
`src/data/questions.ts` dan `src/data/knowledge.ts`; memindahkan bahan sumber tidak
mengubah bank soal atau pengetahuan yang dipakai saat aplikasi berjalan.
File `test.xlsx` lama identik dengan `data/kpsp/source/3_bulan.xlsx`, sehingga cukup
disimpan satu salinan. Ilustrasi soal juga disimpan satu kali di `public/illustrations/`.

## Skrip historis

Isi `archive/` dipertahankan sebagai referensi. Skrip di dalamnya menggunakan path
relatif terhadap root proyek dan pernah digunakan untuk mengganti kode secara
langsung. Sebagian perubahan tidak aman diulang; baca isinya sebelum menjalankannya.
`add-dark.js` adalah artefak CommonJS lama meskipun proyek sekarang memakai ESM.

## Pemeliharaan

- `npm run lint`: pemeriksaan TypeScript untuk `src/`, `server.ts`, dan `vite.config.ts`.
- `npm run build`: build frontend dan server.
- `npm run clean`: hapus `dist/` dan `server.js` hasil build, mendukung Windows, macOS, dan Linux.
- Simpan eksperimen lokal di `.local/` dan konfigurasi rahasia di `.env`; keduanya diabaikan Git.
- Hasil build, cache dependensi, log, dan file sementara tidak perlu dimasukkan ke repository.
