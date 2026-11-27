---
id: kindo-teleconsultation-and-puskesmas-finder
title: Panduan Telekonsultasi Nakes Real-time dan Pencarian Puskesmas Terdekat
category: consultation_and_facilities
audience: [orang_tua, nakes]
language: id
keywords: [telekonsultasi, chat nakes, rujukan, nakes rujukan, pesan, panggilan suara, video call, puskesmas terdekat, peta, google maps, rute, gps, lokasi]
last_updated: 2026-11-27
---

# Panduan Telekonsultasi Nakes Real-time dan Pencarian Puskesmas Terdekat

## Fitur Telekonsultasi Real-time dengan Tenaga Kesehatan

KINDO menyediakan fitur **Konsultasi Nakes** berbasis Cloud Firestore yang menyinkronkan pesan secara *real-time*, lengkap dengan penghitung pesan belum dibaca (*unread badge*), status kehadiran *Online/Offline*, dan pertanyaan/balasan cepat.

### Aturan Rujukan Resmi untuk Orang Tua
Di KINDO, komunikasi klinis bagi **Orang Tua** mengikuti mekanisme **Khusus Nakes Rujukan Resmi**:
- Orang tua **tidak dapat memilih atau menghubungi sembarang Nakes secara langsung** sebelum ada penetapan rujukan pendampingan.
- Rujukan pendampingan diterbitkan langsung oleh **Tenaga Kesehatan terverifikasi** (Dokter, Bidan, Ahli Gizi, atau Kader Posyandu/Puskesmas) dengan cara mengklaim/menugaskan akun orang tua melalui Dashboard Nakes (`assignedNakesId`).
- Jika akun Orang Tua **belum memiliki Nakes Rujukan**, halaman Konsultasi Nakes akan menampilkan status *"Belum Ada Nakes Rujukan"* beserta 3 tahapan alur penerbitan rujukan:
  1. **Skrining KPSP Balita**: Orang tua mengisi profil anak dan melakukan skrining KPSP 10 pertanyaan di Dashboard.
  2. **Tinjauan Klinis Nakes**: Tenaga medis wilayah/Posyandu/Puskesmas memeriksa profil anak, hasil evaluasi KPSP, dan kurva pertumbuhan.
  3. **Rujukan Otomatis Terhubung**: Setelah Nakes menerbitkan rujukan (mengklaim pasien), ruang chat konsultasi langsung otomatis terbuka bagi Orang Tua.
- Jika Orang Tua mencoba membuka kontak Nakes yang **bukan** Nakes Rujukan resminya, akses pengiriman pesan serta panggilan suara/video akan terkunci dengan keterangan *"Konsultasi Terkunci: Khusus Nakes Rujukan"*, disertai tombol cepat untuk berpindah ke chat Nakes Rujukan.

### Fitur di Dalam Ruang Konsultasi Orang Tua
Ketika sudah terhubung dengan Nakes Rujukan, Orang Tua dapat memanfaatkan:
- **Chat Teks Real-time**: Mengirim pesan teks konsultasi terkait hasil KPSP, kurva KMS, MPASI, atau stimulasi.
- **Pertanyaan Cepat (*Quick Questions*)**: Tombol pintasan untuk mengirim pesan umum dengan satu klik:
  - *Kirim Data Skrining KPSP Terbaru*
  - *Tanya Rekomendasi Menu MPASI*
  - *Konsultasi Kurva KMS Balita*
  - *Jadwal Penimbangan Posyandu*
- **Lampiran Dokumen/Foto & Pesan Suara**: Opsi melampirkan foto KMS/hasil pemeriksaan atau mengirim pesan suara.
- **Profil & Jadwal Praktik Nakes**: Klik nama/foto Nakes di header chat untuk melihat rincian **Keahlian & Spesialisasi**, **Nomor Surat Izin Praktik (SIP)**, **Fasilitas Praktik**, dan **Jadwal Praktik Konsultasi**.
- **Panggilan Suara & Telekonsultasi Video**: Tersedia khusus dengan Nakes Rujukan resmi sesuai jam praktik.
- **Kategori Nakes**: Nakes dikelompokkan dalam kategori Dokter, Bidan KIA, Gizi & MPASI, serta Posyandu.

> **Peringatan Kondisi Darurat**: Telekonsultasi KINDO ditujukan untuk pemantauan dan konsultasi tumbuh kembang rutin, **bukan layanan gawat darurat**. Untuk kondisi darurat balita (kejang, sesak napas, demam tinggi berbahaya, cedera berat, atau dehidrasi berat), segera hubungi **119** atau bawa anak ke **IGD Rumah Sakit terdekat**.

---

## Fitur Pencarian Puskesmas Terdekat (Puskesmas Finder)

Orang tua dapat menemukan **Puskesmas terdekat** beserta alamat, jarak, nomor telepon, dan rute berkendara langsung dari dalam KINDO.

### Cara Membuka Puskesmas Finder
1. Dari **Dashboard Orang Tua**: Klik tombol **Cari Faskes / Puskesmas** pada kartu sapaan (*Hero Card*) di bagian atas.
2. Dari **Halaman Hasil Skrining KPSP**: Klik tombol **Cari Faskes / Puskesmas** pada kartu Status Utama.

### Cara KINDO Mendeteksi Lokasi Pengguna
Saat modal Puskesmas Terdekat dibuka, aplikasi menjalankan mekanisme deteksi lokasi bertingkat agar tetap berfungsi di berbagai perangkat:
1. **GPS Browser (Prioritas Utama)**: Aplikasi meminta izin lokasi browser (*Geolocation API*).
2. **Perkiraan Lokasi via IP Internet**: Jika GPS ditolak, tidak tersedia, atau tidak merespons dalam ~6 detik, sistem otomatis memperkirakan lokasi berdasarkan alamat IP jaringan (*geojs.io*) dan menampilkan banner informasi kota yang terdeteksi.
3. **Pilihan Titik Manual di Peta**: Kapan saja pengguna dapat **mengklik langsung titik lokasi mana pun pada peta Google Maps** di sisi kanan untuk mencari Puskesmas di sekitar titik tersebut. Tombol *Reset GPS* tersedia untuk kembali ke deteksi GPS.
4. **Lokasi Default (Jakarta)**: Jika GPS maupun perkiraan IP tidak tersedia, peta sementara menampilkan wilayah Jakarta dengan petunjuk agar pengguna mengklik titik lokasi sebenarnya pada peta.

### Cara Mencari dan Menampilkan Rute ke Puskesmas
1. Daftar 4–5 Puskesmas terdekat akan muncul di panel kiri, diurutkan dari jarak terdekat (dalam km), lengkap dengan **nama Puskesmas**, **alamat**, **jarak**, dan **nomor telepon** (jika tersedia).
2. Klik salah satu Puskesmas pada daftar (atau klik pin/markernya di peta) untuk memusatkan peta dan menggambar **rute berkendara** (*DRIVING*, mempertimbangkan lalu lintas melalui **Google Maps Routes API**) dari posisi pengguna menuju Puskesmas tersebut.

### Sumber Data Pencarian Puskesmas (Sistem Bertingkat / Zero-Downtime)
Di sisi server (`/api/nearby-puskesmas`), pencarian Puskesmas menggunakan 4 lapis strategi:
1. **Cache Memori (10 menit)**: Mengembalikan hasil instan untuk koordinat sekitar yang baru saja dicari.
2. **Google Places API (New)** *(Strategi Utama)*: Mencari Puskesmas nyata dalam radius 5 km diurutkan berdasarkan jarak terdekat.
3. **Google Gemini AI Fallback**: Jika Places API tidak tersedia, server meminta daftar Puskesmas nyata terdekat dari koordinat pengguna ke model Gemini.
4. **Fallback Lokal Berbasis Koordinat**: Jika kedua layanan eksternal tidak aktif, sistem menampilkan data referensi lokal dengan pemberitahuan *"Menampilkan data referensi"* agar fitur tetap dapat dicoba tanpa error.
