# Integrasi knowledge Rusdi

Folder ini ditempatkan langsung di root proyek KINDO pada 27 November 2026.
Sembilan panduan bernomor dan `README.md` disalin identik dari
`C:\Users\ASUS\Documents\app_knowledge\app_knowledge`; sumber aslinya tetap ada.

## Sumber yang dipakai aplikasi

- Seluruh dokumen Markdown panduan pada folder `app_knowledge/` (`01_tentang_kindo.md`
  hingga `09_faq_dan_troubleshooting.md`, serta file `.md` baru selain `README.md`,
  `RUSDI_INTEGRATION.md`, dan dokumen ber-`category: meta`): dibaca otomatis oleh
  `scripts/build-knowledge.ts`, dipecah per bagian heading (`##`/`###`), dipublikasikan
  ke PostgreSQL/pgvector melalui `npm run knowledge:ingest`, dan disertakan dalam
  snapshot backend `server/rusdi/knowledge-snapshot.json`.
- Statistik KPSP: dihitung dari 16 workbook di `data/kpsp/source/` dan diperiksa
  terhadap bank soal aktif. Totalnya 160 butir, bukan hasil perhitungan model.

## Perbedaan yang sudah ditemukan

Buku panduan publik tersedia pada `/panduan`. Kontennya dikurasi secara terpisah
di `src/data/guideData.ts`, termasuk koreksi perilaku puskesmas dan batas fitur
konsultasi. Setiap bab menyimpan nama dokumen rujukan; perubahan panduan tidak
otomatis mengubah FAQ atau indeks Rusdi.

Dokumen asli menjelaskan beberapa perilaku sebelum pembaruan PRD. Khusus
pencarian puskesmas pada panduan 01, 06, 09, serta ringkasan README:

- Lokasi memakai izin perangkat, titik manual, atau wilayah yang dipilih.
  Perkiraan IP dan penggantian otomatis ke Jakarta telah dihapus.
- Data fasilitas berasal dari Google Places dengan ID dan koordinat nyata.
  Fallback Gemini untuk membuat daftar fasilitas telah dihapus.
- Radius tersedia 5, 10, dan 25 km; jarak daftar adalah garis lurus.
- Navigasi dibuka melalui Google Maps. Implementasi baru tidak menggambar
  rute melalui Routes API atau menjanjikan nomor telepon pada kartu.

Fitur konsultasi suara/video, lampiran, dan jadwal yang disebut pada panduan
06 perlu diperiksa lebih lanjut sebelum dimasukkan ke FAQ Rusdi. Keberadaan
tombol antarmuka saja belum membuktikan layanan tersebut bekerja penuh.

Panduan operasional dan konfigurasi provider terbaru tersedia di
[`docs/rusdi-setup.md`](../docs/rusdi-setup.md). Setelah mengubah FAQ, jalankan
`npm run knowledge:build` dan `npm run knowledge:ingest`, lalu uji jawaban yang
berubah sebelum menerbitkan aplikasi.
