---
id: kindo-nakes-and-admin-guide
title: Panduan Khusus Tenaga Kesehatan (Nakes) dan Administrator KINDO
category: role_guides
audience: [nakes, admin]
language: id
keywords: [nakes, tenaga kesehatan, dokter, bidan, kader, verifikasi sip, klaim pasien, pasien saya, prioritas penyimpangan, admin, dashboard admin, tambah nakes, audit log]
last_updated: 2026-11-27
---

# Panduan Khusus Tenaga Kesehatan (Nakes) dan Administrator KINDO

## Bagian 1: Panduan untuk Tenaga Kesehatan (`nakes`)

### Alur Verifikasi Nomor SIP Nakes
1. Nakes yang mendaftar sendiri melalui halaman `/auth/register` wajib mengisi **Nama Lengkap & Gelar**, **Nomor SIP (Surat Izin Praktik)**, **Email**, **Kata Sandi**, dan **Wilayah Faskes** (Provinsi s.d. Kelurahan/Desa).
2. Sebelum disetujui Admin, akun berstatus **Menunggu Verifikasi SIP** (`isVerified = false`). Sebuah panel peringatan kuning akan tampil di bagian atas Dashboard Nakes.
3. Selama belum terverifikasi, tombol **Pilih / Layani Pasien (Klaim Pasien)** dalam keadaan nonaktif. Setelah Admin menyetujui SIP, lencana berubah menjadi **Terverifikasi** (hijau) dan seluruh fitur pendampingan aktif penuh.
4. Alternatifnya, akun Nakes yang didaftarkan langsung oleh Administrator melalui Admin Dashboard akan **otomatis terverifikasi** dan langsung aktif digunakan.

### Ringkasan Dashboard Tenaga Kesehatan
Dashboard Nakes dirancang untuk membantu tenaga medis memprioritaskan anak yang paling membutuhkan perhatian klinis:

#### 3 Kartu Indikator Utama (KPI)
1. **Total Pasien Dampingan**: Jumlah orang tua yang telah diklaim dan berada di bawah pendampingan Nakes tersebut.
2. **Pesan Masuk Belum Dibaca**: Jumlah pesan chat dari pasien dampingan yang belum dibaca oleh Nakes (dilengkapi lencana *Baru*).
3. **Kasus Butuh Perhatian Khusus**: Jumlah anak dari pasien dampingan yang skor KPSP terakhirnya di bawah 9 (kategori **Meragukan** atau **Penyimpangan**).

#### Dua Tab Manajemen Pasien & Pencarian
- **Tab Pasien Saya**: Menampilkan daftar akun Orang Tua yang sudah menjadi pasien rujukan resmi Nakes tersebut, lengkap dengan seluruh profil anak dan skor KPSP terakhirnya.
- **Tab Daftar Orang Tua (Belum Ditugaskan)**: Menampilkan daftar Orang Tua terdaftar yang belum memiliki Nakes pendamping (`assignedNakesId` masih kosong).
- **Kotak Pencarian**: Nakes dapat mencari berdasarkan nama orang tua, alamat email, atau nama anak.

#### Prioritas Pengurutan Otomatis (Triage Visual)
Daftar pasien pada Dashboard Nakes secara otomatis **diurutkan berdasarkan skor KPSP terendah di posisi paling atas**:
- Anak dengan skor **< 7 (Penyimpangan)** disorot dengan kartu **merah/rose** dan berada di urutan teratas.
- Anak dengan skor **7–8 (Meragukan)** disorot dengan kartu **kuning/amber**.
- Anak dengan skor **9–10 (Sesuai)** tampil dengan gaya netral standar.

### Cara Mengklaim Pasien dan Memulai Konsultasi Pasien
1. Buka tab **Daftar Orang Tua (Belum Ditugaskan)** pada Dashboard Nakes.
2. Tinjau data orang tua, domisili, dan daftar anak beserta hasil skrining KPSP terakhirnya.
3. Klik tombol **Pilih / Layani Pasien** pada kartu orang tua yang ingin didampingi. (Hanya bisa dilakukan jika akun Nakes sudah **Terverifikasi**).
4. Setelah berhasil diklaim, akun orang tua otomatis berpindah ke tab **Pasien Saya** dan ruang chat **Konsultasi Nakes** pada akun orang tua tersebut langsung terbuka untuk Nakes yang bersangkutan.
5. Untuk berkonsultasi, klik tombol **Chat Orang Tua** pada kartu pasien atau buka menu **Konsultasi Pasien** di sidebar.

### Fitur Ruang Konsultasi Pasien untuk Nakes
Di dalam halaman **Konsultasi Pasien**:
- **Filter Daftar Pasien**: Nakes dapat memfilter daftar orang tua berdasarkan *Semua*, *Pasien Anda*, atau *Belum Dibaca*, serta mencari nama orang tua maupun nama balita.
- **Balasan Cepat Klinis (*Quick Replies*)**: Pintasan kalimat klinis yang umum digunakan:
  - *"Halo Ayah/Bunda, bagaimana perkembangan si kecil hari ini?"*
  - *"Mohon kirimkan hasil skrining KPSP terbaru untuk dievaluasi."*
  - *"Tingkatkan asupan protein hewani (telur, ikan, daging) pada MPASI."*
  - *"Jadwalkan kunjungan penimbangan ke Posyandu/Puskesmas terdekat."*
- **Panel Profil Orang Tua & Balita**: Klik header percakapan untuk melihat daftar balita terdaftar beserta usianya, status pendampingan (apakah pasien rujukan resmi atau belum), wilayah/domisili, dan status kehadiran Online/Offline orang tua.
- **Pengiriman Pesan Saat Pasien Offline**: Jika orang tua sedang offline, Nakes tetap dapat mengirim arahan klinis; pesan tersimpan di Cloud Firestore dan akan langsung tampil saat orang tua membuka KINDO kembali.

---

## Bagian 2: Panduan untuk Administrator (`admin`)

Administrator mengelola kualitas operasional dan validitas tenaga medis di KINDO melalui **Admin Dashboard**.

### Fitur Utama Admin Dashboard
1. **Ringkasan Statistik & Grafik Pendaftaran**:
   - Menampilkan 3 kartu angka utama: **Total Orang Tua**, **Total Anak (Terdaftar)**, dan **Nakes Terverifikasi**, serta grafik batang (*Bar Chart*) perbandingan ketiganya.
2. **Notifikasi & Antrean Verifikasi Tenaga Kesehatan**:
   - Jika terdapat Nakes baru yang menunggu verifikasi SIP, Admin mendapatkan lencana merah berkedip (*X Menunggu*) di header dan notifikasi *toast* di pojok kanan bawah.
   - Pada panel **Verifikasi Tenaga Kesehatan**, Admin dapat mengklik baris Nakes untuk membuka **Modal Detail Tenaga Kesehatan** yang menampilkan **Nama Lengkap**, **Nomor SIP**, **Email**, serta **Wilayah Praktik** (Provinsi, Kab/Kota, Kecamatan, Kelurahan/Desa), lalu menekan tombol **Verifikasi Nakes**.
   - Setiap aksi verifikasi otomatis tercatat ke koleksi audit `adminLogs` (`VERIFY_NAKES`).
3. **Tambah Tenaga Kesehatan Secara Langsung**:
   - Admin dapat mendaftarkan akun Nakes baru melalui formulir **Tambah Tenaga Kesehatan** (Nama Lengkap, Nomor SIP, Email, Password minimal 6 karakter, serta Provinsi, Kab/Kota, Kecamatan, dan Kelurahan/Desa).
   - Akun Nakes yang dibuat oleh Admin otomatis memiliki status **`isVerified = true`** (langsung terverifikasi tanpa perlu antrean) dan tercatat di `adminLogs` (`ADD_NAKES`). Proses ini menggunakan instance Firebase Auth sekunder sehingga sesi login Admin tidak terputus.
4. **Riwayat Aktivitas (Audit Logs)**:
   - Menampilkan daftar kronologis terbaru aktivitas administratif (seperti verifikasi dan penambahan Nakes) lengkap dengan email target dan stempel waktu lokal Indonesia.
