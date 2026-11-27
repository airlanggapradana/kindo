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
| `server/` | Modul backend autentikasi, pencarian puskesmas, dan Rusdi. Tidak diimpor oleh frontend. |
| `app_knowledge/` | Dokumen panduan yang diberikan pengguna dan FAQ JSON terkurasi untuk Rusdi. Lihat `RUSDI_INTEGRATION.md` untuk status integrasi. |
| `db/`, `compose.yaml` | Inisialisasi role PostgreSQL, migrasi knowledge, dan service pgvector lokal. |
| `tests/` | Pengujian backend dan paket emulator Firebase terpisah. |
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
- Panduan Rusdi, database, key provider, dan batas verifikasi ada di [rusdi-setup.md](rusdi-setup.md).

## Buku panduan pengguna

Halaman publik `/panduan` memakai `src/components/UserGuideView.tsx` beserta CSS
yang hanya dimuat saat dibuka. Konten Indonesia/Inggris, audiens, dan pencarian berada di
`src/data/guideData.ts`. Setiap bab mencatat dokumen asal di `sourceFiles`.
Konten dikurasi dari `app_knowledge/`, lalu dicocokkan dengan implementasi aktif;
Markdown lama tidak ditampilkan mentah dan indeks Rusdi tidak berubah.
Perbarui tanggal tinjauan setelah meninjau ulang isi. Parameter `q` dan `peran`
menyimpan pencarian/filter, sedangkan hash URL menunjuk bab yang dapat dibagikan.

## Pemuatan frontend

Halaman di `src/App.tsx` memakai `React.lazy`; `PageMotionWrapper` menampilkan
indikator pemuatan melalui `Suspense`. Grafik ikut dimuat bersama dashboard.
`DeferredPuskesmasMapModal` baru memuat kode peta saat dibuka pertama kali,
lalu mempertahankan instance modal untuk animasi penutupan dan pilihan lokasi.
Pustaka PDF dan konversi gambar dimuat saat pengguna menekan tombol ekspor.

Konfigurasi build memisahkan React, Motion, dan SDK Firebase untuk cache browser.
Dependensi inisialisasi Firebase berada di grup `firebase-core` dengan prioritas
lebih tinggi agar tidak terbentuk ketergantungan melingkar melalui entry aplikasi.
Setelah mengubah pembagian bundle, uji hasil build produksi di browser, termasuk
login, skrining, peta, dan ekspor PDF; pemeriksaan TypeScript saja tidak cukup.
