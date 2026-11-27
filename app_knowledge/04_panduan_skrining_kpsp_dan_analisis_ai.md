---
id: kindo-kpsp-screening-and-ai
title: Panduan Skrining KPSP, Persiapan Alat, Penilaian, Analisis AI, dan Ekspor PDF
category: kpsp_screening
audience: [orang_tua, nakes]
language: id
keywords: [kpsp, skrining, kuesioner, alat peraga, skor, sesuai, meragukan, penyimpangan, gerak kasar, gerak halus, bicara bahasa, sosialisasi kemandirian, gemini ai, local engine, fallback, pdf, riwayat]
last_updated: 2026-11-27
---

# Panduan Skrining KPSP, Persiapan Alat, Penilaian, Analisis AI, dan Ekspor PDF

## Apa Itu Skrining KPSP di KINDO?

**KPSP (Kuesioner Pra Skrining Perkembangan)** adalah instrumen deteksi dini resmi dari **Kementerian Kesehatan Republik Indonesia (Kemenkes RI)** untuk mengetahui apakah perkembangan anak usia **3 hingga 72 bulan** berjalan sesuai usianya atau mengalami indikasi keterlambatan.

### 16 Kelompok Usia KPSP yang Tersedia
KINDO menyediakan kuesioner lengkap untuk **16 kelompok usia**:
- **Usia 3–24 bulan (setiap 3 bulan)**: 3 bulan, 6 bulan, 9 bulan, 12 bulan, 15 bulan, 18 bulan, 21 bulan, dan 24 bulan.
- **Usia 24–72 bulan (setiap 6 bulan)**: 30 bulan, 36 bulan, 42 bulan, 48 bulan, 54 bulan, 60 bulan, 66 bulan, dan 72 bulan.

### 4 Domain / Aspek Perkembangan yang Dinilai
Setiap kuesioner terdiri dari **10 pertanyaan terstandar** yang mencakup 4 aspek perkembangan:
1. **Gerak Kasar (*Gross Motor*)**: Kemampuan otot besar seperti mengangkat kepala, duduk, merangkak, berdiri, berjalan, berlari, dan melompat.
2. **Gerak Halus (*Fine Motor*)**: Koordinasi mata-tangan dan otot kecil jari seperti mengikuti benda, menggenggam, menjumput, menyusun kubus, mencoret, dan menggambar.
3. **Bicara dan Bahasa (*Speech & Language*)**: Kemampuan mengoceh, merespons suara, mengucapkan kata, menyusun kalimat, memahami instruksi, dan bercerita.
4. **Sosialisasi dan Kemandirian (*Social & Independence*)**: Kontak mata, membalas senyum, berinteraksi dengan orang sekitar, makan/minum sendiri, berpakaian, dan mematuhi aturan bermain.

## Aturan Pemilihan Usia Kuesioner & Pengingat Jadwal Skrining

### Pengingat Jadwal Skrining di Dashboard
Dashboard Orang Tua secara otomatis menampilkan banner pengingat **"Waktunya Skrining"** jika:
- Anak **belum pernah** melakukan skrining KPSP sama sekali, **atau**
- Jarak waktu sejak skrining KPSP terakhir sudah mencapai **3 bulan atau lebih**.

### Cara Sistem Menentukan Kelompok Usia KPSP
Saat orang tua menekan tombol **Mulai Skrining** atau **+ Skrining** di Dashboard:
- Jika usia anak **kurang dari 3 bulan**, sistem mengarahkan ke kuesioner **3 bulan**.
- Jika usia anak **persis sama** dengan salah satu dari 16 kelompok usia KPSP (misalnya 12 bulan atau 24 bulan), kuesioner untuk usia tersebut langsung dibuka.
- Jika usia anak **berada di antara dua kelompok usia KPSP** (misalnya 14 bulan, di antara 12 dan 15 bulan), akan muncul **Modal Pilihan Kelompok Usia Skrining** berisi 2 opsi terdekat:
  - Usia di bawahnya → *Evaluasi kemampuan dasar* (misal: Kuesioner 12 Bulan)
  - Usia di atasnya → *Evaluasi kemampuan lanjutan* (misal: Kuesioner 15 Bulan)

## Daftar Alat Peraga KPSP per Kelompok Usia

Sebelum pertanyaan dimulai, KINDO menampilkan layar **Persiapan Alat Skrining** agar orang tua dapat menyiapkan alat peraga sederhana di rumah:

| Kelompok Usia | Alat & Media yang Perlu Disiapkan |
|---|---|
| **3 bulan** | Benang Wool Merah |
| **6 bulan** | Gulungan Wool Merah, Pensil, Kismis, manik-manik atau uang logam, mainan bayi |
| **9 bulan** | Gulungan Wool Merah, Pensil, Kismis-Kacang, atau uang logam, mainan |
| **12 bulan** | 2 mainan Kubus, Pensil, kacang-kacangan, manik-manik atau potongan biskuit |
| **15 bulan** | 2 mainan kubus, Cangkir |
| **18 bulan** | Mainan Kubus, Bola mainan, Pensil, Kertas |
| **21 bulan** | 2 Mainan Kubus, Bola tenis, Pensil dan Kertas |
| **24 bulan** | 4 Mainan Kubus, Bola Mainan, Pensil dan Kertas |
| **30 bulan** | 4 mainan kubus, Bola mainan, Pensil dan Kertas |
| **36 bulan** | 6 Kubus Mainan, Bola, Pensil dan Kertas |
| **42 bulan** | 8 Kubus, Pensil, Kertas dan Kertas warna-warni |
| **48 bulan** | 3 Mainan Kubus, Kertas, Pensil |
| **54 bulan** | Kertas, Kertas warna-warni (origami), Pensil |
| **60 bulan** | Kertas, Kertas warna-warni (origami), Pensil |
| **66 bulan** | Bola Kecil, Kertas, Pensil, 8 Mainan Kubus |
| **72 bulan** | Bola Kecil, Kertas, Pensil |

### Tips Melakukan Skrining yang Objektif
1. Pastikan anak dalam kondisi nyaman, tidak sedang mengantuk, sakit, atau lapar.
2. Lakukan pengamatan dalam suasana santai dan menyenangkan seperti bermain bersama.
3. Jawab sesuai kemampuan nyata anak saat ini tanpa memaksa atau menebak.

## Alur Pengisian Kuesioner dan Sistem Penilaian Skor

1. Setelah membaca daftar alat, klik **Saya Siap, Mulai Skrining**.
2. Pertanyaan ditampilkan satu per satu lengkap dengan badge kategori perkembangan, panduan pengamatan, serta **ilustrasi gambar gerakan** untuk pertanyaan yang memerlukannya.
3. Setiap pertanyaan memiliki dua pilihan jawaban:
   - **Ya** = **Skor 1** (jika anak mampu melakukan kemampuan yang ditanyakan)
   - **Tidak** = **Skor 0** (jika anak belum mampu melakukan kemampuan tersebut)
4. Sistem otomatis berpindah ke pertanyaan berikutnya setelah jawaban dipilih. Pengguna juga dapat bernavigasi maju/mundur menggunakan tombol **Sebelumnya** dan **Berikutnya**, atau klik **Periksa** untuk meninjau ringkasan seluruh 10 jawaban dan mengubah jawaban tertentu.
5. Setelah seluruh **10 dari 10 pertanyaan** dijawab, klik **Kirim Hasil Skrining**.

## Interpretasi Skor KPSP (Standar Kemenkes RI)

Total skor berkisar antara **0 hingga 10** dan diklasifikasikan menjadi tiga kategori:

| Rentang Skor | Status Perkembangan | Arti & Tindak Lanjut Utama |
|---|---|---|
| **9 – 10** | **Sesuai** (*Perkembangan Sesuai Usia*) | Perkembangan anak optimal sesuai tahapan usianya. Lanjutkan stimulasi harian rutin, pantau antropometri bulanan, dan lakukan skrining ulang pada kelompok usia KPSP berikutnya. |
| **7 – 8** | **Meragukan** (*Perkembangan Meragukan*) | Terdapat 1–2 kemampuan yang belum dikuasai. Lakukan stimulasi intensif di rumah selama **2 minggu** pada aspek yang terjawab "Tidak", lalu ulangi skrining KPSP usia yang sama. Jika tetap Meragukan setelah 2–4 minggu, konsultasikan ke Puskesmas atau Dokter Anak. |
| **≤ 6 (0 – 6)** | **Penyimpangan** (*Kemungkinan Penyimpangan*) | Terdapat 3 atau lebih indikator yang belum terpenuhi (*red flag* deteksi dini). Segera jadwalkan pemeriksaan langsung ke **Puskesmas** atau **Dokter Spesialis Anak (Sp.A)** dalam 3–7 hari kerja untuk skrining SDIDTK dan rujukan komprehensif. |

## Analisis Cerdas AI & Mekanisme Local Engine (Fallback)

Pada halaman **Hasil Skrining**, KINDO menampilkan:
- **Status Utama & Score Ring** (skor total dari 10).
- **4 Kartu Aspek Perkembangan** (*Aspect Cards*) yang memperlihatkan capaian skor di masing-masing domain (Gerak Kasar, Gerak Halus, Bicara & Bahasa, Sosialisasi & Kemandirian).
- **Analisis & Saran Stimulasi AI**:
  - Secara utama, server KINDO mengirimkan data usia, total skor, dan detail 10 tanya-jawab ke model **Google Gemini AI** dengan menyuntikkan dokumen pedoman intervensi resmi Kemenkes RI (`INTERVENSI_KNOWLEDGE`) agar rekomendasi yang dihasilkan akurat, menenangkan, dan aplikatif.
  - Hasil analisis dibuat dalam dua bahasa (**Indonesia** dan **Inggris**). Jika pengguna mengganti bahasa ke Inggris untuk riwayat lama yang belum memiliki terjemahan Inggris, KINDO otomatis menerjemahkannya melalui endpoint `/api/translate-analysis`.
  - **Resilience / Local Engine Fallback**: Jika koneksi API Gemini sedang terganggu atau kuota API habis, KINDO secara otomatis beralih ke **Local Engine** (*Rule-Based Clinical Engine*) yang menyusun analisis status, daftar butir yang dijawab "Tidak", saran stimulasi spesifik usia, dan rencana tindak lanjut secara instan. Saat mode ini aktif, akan muncul lencana kecil bertuliskan **Local Engine** di bagian judul analisis.
- **Rekapitulasi 10 Jawaban**: Rincian seluruh pertanyaan beserta jawaban Ya/Tidak.
- **Modul Edukasi Tersemat**: Otomatis membuka tab edukasi yang sesuai dengan kategori hasil anak.

## Menyimpan Hasil, Melihat Riwayat, dan Mengunduh Laporan PDF

### Menyimpan Hasil Skrining
Pada halaman hasil skrining baru, klik tombol **Simpan Hasil** agar seluruh jawaban, skor, dan analisis AI tersimpan permanen di Cloud Firestore dan muncul di daftar **Riwayat Skrining** pada Dashboard.

### Melihat Riwayat Skrining Sebelumnya
Di bagian **Riwayat Skrining** pada Dashboard Orang Tua, klik salah satu kartu riwayat (menampilkan kelompok usia KPSP, tanggal, skor, dan status) untuk membuka kembali detail hasil lengkapnya beserta analisis AI.

### Ekspor Laporan Medis PDF
Di halaman Hasil Skrining maupun Detail Riwayat, klik tombol **Ekspor PDF / Unduh Laporan PDF**. Sistem akan menghasilkan dokumen PDF siap cetak bernama `Laporan_KPSP_<NamaAnak>.pdf` yang berisi:
- Identitas anak (nama, usia, jenis kelamin)
- Total skor KPSP dan status perkembangan
- Ringkasan panduan stimulasi & rekomendasi aktivitas beserta sumber resmi Kemenkes/IDAI/WHO/UNICEF
- Teks lengkap Analisis AI
- Catatan disclaimer medis dan tanggal pembuatan laporan
