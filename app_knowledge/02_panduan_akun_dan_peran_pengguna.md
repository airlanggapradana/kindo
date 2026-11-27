---
id: kindo-accounts-and-roles
title: Panduan Akun, Registrasi, Login, dan Peran Pengguna (RBAC) KINDO
category: account
audience: [all, orang_tua, nakes, admin]
language: id
keywords: [daftar, registrasi, login, masuk, akun, peran, role, rbac, orang tua, nakes, admin, sip, verifikasi, wilayah, password, logout]
last_updated: 2026-11-27
---

# Panduan Akun, Registrasi, Login, dan Peran Pengguna (RBAC) KINDO

## Peran Pengguna di Aplikasi KINDO

KINDO menerapkan sistem hak akses berbasis peran (*Role-Based Access Control / RBAC*) dengan tiga peran utama:

| Peran | Kode Role | Sasaran Pengguna | Ringkasan Hak Akses |
|---|---|---|---|
| **Orang Tua** | `orang_tua` | Ayah, Ibu, atau Wali Balita | Membuat & mengelola profil anak (bisa lebih dari satu), melakukan skrining KPSP, mencatat & memantau grafik pertumbuhan WHO, mengakses Edukasi, mencari Puskesmas terdekat, mengunduh laporan PDF/CSV, dan berkonsultasi dengan Nakes rujukan. |
| **Tenaga Kesehatan (Nakes)** | `nakes` | Dokter, Bidan, Ahli Gizi, Perawat, Kader Posyandu | Mendaftar dengan Nomor SIP, menunggu verifikasi Admin, mengklaim pasien orang tua, memantau status KPSP seluruh anak pasien, dan melakukan telekonsultasi klinis melalui Konsultasi Pasien. |
| **Administrator** | `admin` | Pengelola Sistem KINDO | Memantau statistik pendaftaran platform, memverifikasi akun Nakes berdasarkan Nomor SIP, mendaftarkan akun Nakes baru yang langsung terverifikasi, dan meninjau log audit aktivitas. |

## Cara Mendaftar Akun Baru di KINDO

Pendaftaran dapat dilakukan melalui halaman **`/auth/register`** (klik tombol **Mulai Sekarang** atau **Mulai Evaluasi Gratis** pada halaman beranda, atau klik **Daftar di sini** dari halaman login).

### Langkah Pendaftaran untuk Orang Tua (`orang_tua`)
1. Buka halaman pendaftaran (`/auth/register`).
2. Pilih kartu peran **Orang Tua** (*Pantau tumbuh kembang anak*).
3. Isi **Nama Orang Tua** (contoh: Siti Rahmawati).
4. Isi **Alamat Email** yang aktif dan belum pernah terdaftar.
5. Buat **Kata Sandi** (minimal **6 karakter**) dan ulangi pada kolom **Konfirmasi Kata Sandi**.
6. Lengkapi **Domisili / Wilayah Faskes** secara berurutan dari daftar wilayah resmi Indonesia (melalui API Wilayah.id):
   - Pilih **Provinsi**
   - Pilih **Kabupaten/Kota**
   - Pilih **Kecamatan**
   - Pilih **Kelurahan/Desa**
7. Klik tombol **Daftar Sekarang**.
8. Setelah berhasil mendaftar, Orang Tua akan langsung diarahkan ke halaman **Onboarding Profil Anak** untuk memasukkan data buah hati pertama.

### Langkah Pendaftaran untuk Tenaga Kesehatan (`nakes`)
1. Buka halaman pendaftaran (`/auth/register`).
2. Pilih kartu peran **Tenaga Kesehatan** (*Dokter, bidan, kader*).
3. Isi **Nama Lengkap & Gelar** (contoh: dr. Budi Santoso, Sp.A).
4. Isi **Nomor SIP (Surat Izin Praktik)** yang sah. Kolom ini **wajib** untuk peran Tenaga Kesehatan.
5. Isi **Alamat Email**, **Kata Sandi** (minimal 6 karakter), dan **Konfirmasi Kata Sandi**.
6. Lengkapi data **Domisili / Wilayah Faskes** (Provinsi, Kabupaten/Kota, Kecamatan, Kelurahan/Desa).
7. Klik tombol **Daftar Sekarang**.
8. Akun Nakes yang baru mendaftar akan memiliki status **`isVerified = false`** (*Menunggu Verifikasi SIP*). Nakes tetap dapat masuk ke Dashboard Nakes, namun fitur klaim pasien baru akan terbuka setelah Administrator memverifikasi Nomor SIP.

> **Catatan**: Peran **Administrator (`admin`)** tidak tersedia pada formulir pendaftaran publik demi keamanan sistem.

## Cara Masuk (Login) dan Keluar (Logout)

### Cara Masuk
1. Buka halaman login (`/auth/login`) atau klik **Masuk** di pojok kanan atas halaman beranda.
2. Masukkan **Alamat Email** dan **Kata Sandi** yang terdaftar.
3. Klik tombol **Masuk**.
4. Sistem secara otomatis mengarahkan pengguna ke halaman sesuai peran:
   - **Admin** → Admin Dashboard
   - **Nakes** → Dashboard Tenaga Kesehatan
   - **Orang Tua yang sudah memiliki profil anak** → Dashboard Orang Tua
   - **Orang Tua yang belum memiliki profil anak** → Halaman Onboarding Tambah Anak

### Cara Keluar (Logout)
Klik tombol **Keluar (Logout)** di bagian bawah sidebar (desktop), di dalam drawer menu (mobile), atau ikon keluar di pojok kanan atas header mobile. Saat keluar, sistem otomatis memperbarui status kehadiran (*presence*) pengguna menjadi offline.

## Status Kehadiran Online / Offline (Live Presence)

Selama pengguna masuk dan membuka tab KINDO, sistem memperbarui status `isOnline` dan `lastActive` secara berkala (setiap 45 detik dan saat tab aktif/tidak aktif). Informasi ini digunakan pada fitur **Telekonsultasi Nakes** agar Orang Tua dan Nakes dapat mengetahui apakah lawan bicara sedang aktif (*Online*) atau tidak (*Offline*).

## Pesan Kendala Umum Saat Registrasi atau Login

- **"Email ini sudah terdaftar. Silakan login atau gunakan email lain."**: Alamat email sudah digunakan oleh akun lain. Gunakan halaman Masuk atau daftar dengan email berbeda.
- **"Email atau kata sandi tidak sesuai. Silakan periksa kembali."**: Pastikan penulisan email dan kata sandi (termasuk huruf besar/kecil) sudah benar.
- **"Kata sandi terlalu pendek. Gunakan minimal 6 karakter."**: Firebase Authentication mewajibkan kata sandi minimal 6 karakter.
- **"Konfirmasi kata sandi tidak cocok."**: Pastikan kolom Kata Sandi dan Konfirmasi Kata Sandi terisi sama persis.
- **"Mohon lengkapi data wilayah tempat tinggal / faskes."**: Keempat tingkat wilayah (Provinsi, Kab/Kota, Kecamatan, Kelurahan/Desa) wajib dipilih sebelum mendaftar.
- **"Terlalu banyak percobaan gagal pada Firebase Auth."**: Terjadi pembatasan sementara akibat terlalu banyak percobaan login yang salah. Tunggu beberapa saat sebelum mencoba masuk kembali.
