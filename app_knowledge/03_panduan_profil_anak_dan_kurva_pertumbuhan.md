---
id: kindo-child-profile-and-growth
title: Panduan Profil Anak, Onboarding, dan Kurva Pertumbuhan Antropometri WHO
category: growth_tracking
audience: [orang_tua, nakes]
language: id
keywords: [profil anak, tambah anak, onboarding, kurva pertumbuhan, grafik who, antropometri, berat badan, tinggi badan, lingkar kepala, csv, multi anak, child switcher]
last_updated: 2026-11-27
---

# Panduan Profil Anak, Onboarding, dan Kurva Pertumbuhan Antropometri WHO

## Cara Membuat Profil Anak (Wizard 3 Langkah)

Orang tua baru di KINDO akan langsung diarahkan ke alur pembuatan profil anak (*Child Onboarding*). Orang tua juga dapat menambahkan profil anak tambahan kapan saja melalui menu **Tambah Anak** di sidebar atau tombol **Tambah Anak Baru** pada dropdown pemilih profil anak (*Child Switcher*) di Dashboard.

### Langkah 1: Identitas Buah Hati
- **Nama Lengkap Anak**: Wajib diisi (maksimal 100 karakter).
- **Jenis Kelamin**: Pilih **Laki-laki** atau **Perempuan**. Pemilihan jenis kelamin ini penting karena standar kurva median WHO berbeda antara anak laki-laki dan perempuan.
- **Tanggal Lahir**: Wajib diisi dan tidak boleh melebihi tanggal hari ini. KINDO secara otomatis menghitung **Usia Terhitung (dalam bulan)** dari tanggal lahir tersebut.

### Langkah 2: Pengukuran Fisik Pertama
Masukkan hasil pengukuran antropometri anak saat ini:
- **Berat Badan (kg)** *(Wajib)*: Rentang input **1 kg – 40 kg** (mendukung desimal 0,1 kg, contoh: `7.5`).
- **Tinggi / Panjang Badan (cm)** *(Wajib)*: Rentang input **30 cm – 140 cm** (mendukung desimal 0,1 cm, contoh: `65.0`).
- **Lingkar Kepala (cm)** *(Opsional)*: Rentang input **25 cm – 60 cm** (mendukung desimal 0,1 cm, contoh: `42.0`).

### Langkah 3: Selesai
Klik **Simpan & Selesai**. Data profil anak tersimpan di Cloud Firestore dan pengguna otomatis masuk ke **Dashboard Tumbuh Kembang** untuk anak tersebut.

## Mengelola Lebih dari Satu Anak (Multi-Profil / Child Switcher)

Satu akun Orang Tua di KINDO dapat mengelola **banyak profil anak sekaligus** (misalnya kakak dan adik).
- Di bagian pojok kanan kartu sapaan (*Hero Card*) pada Dashboard, terdapat tombol pemilih profil anak (**Child Switcher**) yang menampilkan ikon dan nama anak yang sedang aktif.
- Klik tombol tersebut untuk berpindah antar-profil anak atau klik **Tambah Anak Baru** untuk mendaftarkan anak lainnya.
- Seluruh statistik (Usia, Tinggi, Berat, Skor Skrining Terakhir), kurva pertumbuhan WHO, dan riwayat skrining KPSP akan otomatis menyesuaikan dengan profil anak yang sedang dipilih.

## Ringkasan Statistik di Dashboard Orang Tua

Dashboard Orang Tua menampilkan 4 kartu ringkasan utama untuk anak yang sedang aktif:
1. **Usia Anak**: Usia aktual anak dalam satuan bulan.
2. **Tinggi Badan**: Tinggi/panjang badan terkini dalam cm.
3. **Berat Badan**: Berat badan terkini dalam kg.
4. **Skor Skrining Terakhir**: Skor KPSP terbaru (dari skala 10) beserta lencana status (**Sesuai**, **Meragukan**, atau **Penyimpangan**), atau keterangan *Belum Skrining* jika belum pernah mengikuti KPSP.

## Kurva Pertumbuhan Antropometri Acuan WHO

Bagian **Pertumbuhan Berkala (Acuan WHO)** menampilkan grafik area interaktif untuk memantau tren fisik anak dari bulan 0 hingga 72 bulan.

### Tab Metrik yang Tersedia
Pengguna dapat beralih antar-4 tampilan grafik:
1. **Berat (kg)** — garis & area berwarna hijau teal (`#0D9488`) dibanding Median WHO.
2. **Tinggi (cm)** — garis & area berwarna biru langit (`#0284C7`) dibanding Median WHO.
3. **Lingkar Kepala** — garis & area berwarna ungu (`#7C3AED`) dibanding Median WHO.
4. **Semua Metrik** — menampilkan kurva Berat, Tinggi, dan Lingkar Kepala secara bersamaan dalam satu grafik.

### Memahami Garis Putus-Putus Median WHO
Pada tampilan per metrik (Berat, Tinggi, atau Lingkar Kepala), KINDO menampilkan **garis putus-putus berwarna abu-abu (`Median WHO`)** sebagai acuan pertumbuhan standar sesuai jenis kelamin dan usia anak (0–72 bulan).
- Saat kursor diarahkan (atau disentuh) ke titik grafik, tooltip akan menampilkan rincian **Usia (Bulan)**, **Tanggal Ukur**, **Berat Badan (kg)**, **Tinggi Badan (cm)**, **Lingkar Kepala (cm)**, dan nilai **Median WHO**.
- Jika profil anak baru dibuat dan belum memiliki catatan bulanan lengkap, KINDO secara otomatis menyusun titik dasar (*baseline*) awal dari saat lahir (standar median WHO) hingga pengukuran terkini agar bentuk tren pertumbuhan langsung terlihat. Orang tua sangat dianjurkan memperbarui titik data tersebut dengan pengukuran riil dari Posyandu atau Buku KIA.

## Cara Mencatat atau Mengubah Data Pertumbuhan Bulanan

1. Pada kartu grafik pertumbuhan di Dashboard, klik tombol **Input / Edit** (atau **Kelola Data** di bawah grafik).
2. Isi formulir pencatatan:
   - **Usia Bulan Ke**: Rentang **0 hingga 72 bulan**. Jika usia bulan yang dimasukkan sudah memiliki catatan sebelumnya, data pada bulan tersebut akan diperbarui.
   - **Tanggal Ukur**: Tanggal penimbangan/pengukuran dilakukan.
   - **Berat (kg)**, **Tinggi (cm)**, dan **LK / Lingkar Kepala (cm)**.
   - **Catatan (Opsional)**: Misalnya *"Pengukuran Posyandu Melati"*.
3. Klik **Simpan Data**.
4. Grafik pertumbuhan langsung terbarui dan data pengukuran paling mutakhir (usia bulan terbesar) otomatis memperbarui angka Berat Badan, Tinggi Badan, dan Lingkar Kepala pada kartu ringkasan profil anak.
5. Data disimpan di penyimpanan lokal browser (`localStorage`) sekaligus disinkronkan ke Cloud Firestore agar aman dan tidak hilang saat berganti perangkat.

## Cara Ekspor Data Pertumbuhan ke Format CSV

Orang tua dapat mengunduh seluruh riwayat pencatatan antropometri anak dalam format spreadsheet **CSV** dengan mengklik tombol **Export** di pojok kanan atas kartu grafik pertumbuhan.
- Nama file otomatis: `Grafik_Pertumbuhan_<NamaAnak>_<YYYYMMDD>.csv`.
- Kolom yang disertakan: `Bulan Ke`, `Usia (Bulan)`, `Berat Badan (kg)`, `Tinggi Badan (cm)`, `Lingkar Kepala (cm)`, `Tanggal`, dan `Catatan`.
- File CSV ini dapat dibuka di Microsoft Excel, Google Sheets, atau dibagikan saat kontrol rutin ke dokter/Posyandu.
