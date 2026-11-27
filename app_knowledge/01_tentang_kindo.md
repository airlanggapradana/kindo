---
id: kindo-overview
title: Profil dan Gambaran Umum Aplikasi KINDO
category: general
audience: [all, orang_tua, nakes, admin]
language: id
keywords:
  [
    kindo,
    growthsync,
    apa itu kindo,
    tentang aplikasi,
    kpsp,
    buku kia,
    who,
    stunting,
    ums,
    gratis,
    bahasa,
    dark mode,
  ]
last_updated: 2026-11-27
---

# Profil dan Gambaran Umum Aplikasi KINDO

## Apa Itu KINDO?

**KINDO** (juga dikenal dengan nama repositori pengembangan **GrowthSync**) adalah platform kesehatan digital berbasis web untuk deteksi dini tumbuh kembang balita dan pencegahan stunting di Indonesia. Aplikasi ini dapat diakses melalui situs resmi **https://kindo.fun**.

KINDO mendigitalisasi **Buku KIA (Kesehatan Ibu dan Anak)** serta instrumen resmi **KPSP (Kuesioner Pra Skrining Perkembangan)** dari **Kementerian Kesehatan Republik Indonesia (Kemenkes RI)** dan mengombinasikannya dengan kurva acuan **WHO (World Health Organization)**, bantuan analisis **Kecerdasan Buatan (Google Gemini AI)**, telekonsultasi bersama **Tenaga Kesehatan (Nakes)** terverifikasi, serta pencari **Puskesmas** terdekat.

## Masalah yang Diselesaikan oleh KINDO

1. **Buku KIA Manual yang Sulit Diinterpretasi**: Banyak orang tua kesulitan membaca panduan cetak Buku KIA dan berisiko melewatkan masa emas (_golden age_, 0–5 tahun) untuk deteksi dini stunting atau keterlambatan perkembangan anak.
2. **Keterbatasan Frekuensi Kunjungan Posyandu**: Kunjungan ke Posyandu umumnya berlangsung sebulan sekali sehingga orang tua membutuhkan alat pemantauan mandiri yang terarah dari rumah.
3. **Ketiadaan Tindak Lanjut Terpadu**: Skrining mandiri sering berhenti tanpa rekomendasi stimulasi yang spesifik atau jalur komunikasi menuju tenaga medis profesional.

## Fitur Utama KINDO

- **Skrining KPSP Terstandar Kemenkes RI**: Mencakup 16 kelompok usia (3, 6, 9, 12, 15, 18, 21, 24, 30, 36, 42, 48, 54, 60, 66, dan 72 bulan) dengan 10 pertanyaan per usia di 4 domain perkembangan (Gerak Kasar, Gerak Halus, Bicara & Bahasa, Sosialisasi & Kemandirian).
- **Analisis Cerdas Google Gemini AI + Local Fallback Engine**: Menghasilkan ringkasan hasil skrining yang suportif beserta saran stimulasi berbasis pedoman Kemenkes RI. Jika layanan AI eksternal sedang tidak tersedia, sistem otomatis beralih ke mesin analisis klinis lokal (_Local Engine_) sehingga layanan tetap berjalan tanpa gangguan.
- **Kurva Pertumbuhan Antropometri WHO**: Grafik interaktif Berat Badan (kg), Tinggi Badan (cm), dan Lingkar Kepala (cm) dibandingkan dengan garis putus-putus Median WHO, dilengkapi pencatatan manual berkala dan ekspor data ke format **CSV**.
- **Edukasi Tumbuh Kembang & Rekomendasi Aktivitas**: Panduan pola asuh, aktivitas stimulasi harian di rumah sesuai kategori hasil skrining (Sesuai, Meragukan, Penyimpangan), serta tautan referensi resmi dari Kemenkes RI, IDAI, PrimaKu, WHO, dan UNICEF.
- **Telekonsultasi Real-time dengan Tenaga Kesehatan**: Ruang komunikasi langsung antara orang tua dan tenaga kesehatan rujukan resmi (dokter spesialis anak, bidan, ahli gizi, kader) dengan indikator status online/offline dan jumlah pesan belum dibaca.
- **Puskesmas Finder & Navigasi Rute**: Pencarian Puskesmas terdekat berdasarkan lokasi GPS, perkiraan IP, atau titik pilihan manual di peta Google Maps, lengkap dengan alamat, jarak, nomor telepon, dan rute berkendara.
- **Laporan Medis PDF Siap Cetak**: Ringkasan hasil skrining KPSP, analisis AI, dan rekomendasi stimulasi dapat diunduh sebagai file PDF untuk dibawa saat berkonsultasi ke dokter atau Puskesmas.

## Biaya Layanan KINDO

Platform KINDO **gratis** digunakan oleh orang tua untuk membuat profil anak, mengisi kuesioner KPSP, memantau grafik pertumbuhan WHO, menerima laporan analisis AI, membaca panduan edukasi, mengunduh laporan PDF/CSV, mencari Puskesmas terdekat, dan melakukan telekonsultasi dengan Nakes rujukan.

## Pengaturan Tampilan, Bahasa, dan Navigasi Aplikasi

### Dukungan Dwibahasa (Indonesia & Inggris)

KINDO mendukung dua bahasa antarmuka: **Bahasa Indonesia (`id`)** dan **Bahasa Inggris (`en`)**. Pengguna dapat mengganti bahasa kapan saja melalui menu **Pengaturan → Bahasa** di sidebar (desktop) atau menu drawer (mobile). Analisis AI hasil skrining juga mendukung penerjemahan otomatis antara Bahasa Indonesia dan Bahasa Inggris.

### Mode Gelap dan Mode Terang (Dark / Light Mode)

Pengguna dapat mengganti tampilan antara **Mode Terang** dan **Mode Gelap** melalui tombol **Mode Gelap / Mode Terang** pada sidebar atau bilah atas mobile. Preferensi tema tersimpan otomatis di browser pengguna.

### Navigasi Desktop dan Mobile

- **Desktop**: Menggunakan sidebar di sisi kiri yang dapat diperluas atau diperkecil (_collapse/expand_). Menu yang tampil menyesuaikan peran pengguna (Orang Tua, Nakes, atau Admin).
- **Mobile**: Menggunakan bilah navigasi bawah (_Bottom Navigation_) untuk akses cepat ke Dashboard, Skrining, Pertumbuhan, dan Chat, serta tombol menu hamburger di pojok kiri atas untuk membuka drawer menu lengkap (termasuk Edukasi, Tambah Anak, Pengaturan Bahasa, Tema, dan Keluar).
- **Fitur Mendatang (_Coming Soon_)**: Pada sidebar desktop terdapat item menu **Tugas (Tasks)** berlabel _Coming Soon_ yang saat ini belum diaktifkan dan masih dalam tahap pengembangan.

## Tim Pengembang dan Institusi

KINDO dirancang dan dikembangkan oleh tim mahasiswa **Universitas Muhammadiyah Surakarta (UMS)**, Jawa Tengah, Indonesia:

- **Asrofi Noor Masithoh** (Project Leader)
- **Putri Azzahra Namora** (Project Assistant)
- **Reja Arrafi** (Project Assistant)
- **Airlangga Pradana Prakusa** (Fullstack Developer)
- **Shafwan Aulia Rahman** (UI/UX Designer & Front-end Developer)

**Alamat Institusi**: Universitas Muhammadiyah Surakarta (UMS), Jl. A. Yani, Pabelan, Kartasura, Sukoharjo, Jawa Tengah 57169.
**Situs Web Resmi**: https://kindo.fun
