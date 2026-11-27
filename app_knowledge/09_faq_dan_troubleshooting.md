---
id: kindo-faq-and-troubleshooting
title: FAQ (Pertanyaan Umum) dan Pemecahan Masalah (Troubleshooting) KINDO
category: faq_troubleshooting
audience: [all, orang_tua, nakes, admin]
language: id
keywords: [faq, tanya jawab, masalah, troubleshooting, error, tidak bisa chat, tugas coming soon, local engine, lokasi jakarta, ganti bahasa, dark mode, cetak pdf, export csv, anak kedua, usia di antara kpsp]
last_updated: 2026-11-27
---

# FAQ (Pertanyaan Umum) dan Pemecahan Masalah (Troubleshooting) KINDO

## Pertanyaan Umum (FAQ) Mengenai Aplikasi KINDO

### Apakah aplikasi KINDO berbayar?
Tidak. KINDO **100% gratis** digunakan oleh orang tua untuk membuat profil anak, mengisi skrining KPSP, memantau grafik pertumbuhan WHO, mendapatkan analisis AI, membaca panduan edukasi, mencari Puskesmas terdekat, mengunduh laporan PDF/CSV, serta berkonsultasi dengan Tenaga Kesehatan rujukan.

### Untuk rentang usia anak berapa KINDO dapat digunakan?
KINDO dirancang untuk anak usia **0 hingga 72 bulan (0 sampai 6 tahun)**. Kurva pertumbuhan WHO mencatat pengukuran dari bulan ke-0 hingga bulan ke-72, sedangkan skrining KPSP tersedia dalam **16 kelompok usia** mulai dari **3 bulan hingga 72 bulan**. Jika usia anak masih di bawah 3 bulan, skrining akan diarahkan ke kelompok usia 3 bulan.

### Bagaimana jika usia anak saya tidak persis sama dengan daftar usia KPSP (misalnya 14 bulan atau 20 bulan)?
Jika usia anak berada di antara dua kelompok usia KPSP standar (misalnya 14 bulan berada di antara 12 dan 15 bulan), KINDO otomatis menampilkan **Modal Pilihan Kelompok Usia Skrining** dengan dua pilihan terdekat: usia di bawahnya untuk *evaluasi kemampuan dasar* dan usia di atasnya untuk *evaluasi kemampuan lanjutan*.

### Apakah saya bisa menambahkan lebih dari satu anak dalam satu akun?
Ya. Satu akun Orang Tua dapat menambahkan dan memantau beberapa anak sekaligus. Klik menu **Tambah Anak** di sidebar, atau klik tombol pemilih profil anak (*Child Switcher*) di kartu sapaan Dashboard lalu pilih **Tambah Anak Baru**.

### Bagaimana cara mengganti bahasa ke Bahasa Inggris atau kembali ke Bahasa Indonesia?
Buka bagian **Pengaturan** di bawah sidebar (desktop) atau di dalam menu drawer (mobile), lalu klik tombol **Bahasa** untuk beralih antara `ID` (Bahasa Indonesia) dan `EN` (English).

### Bagaimana cara mengaktifkan Mode Gelap (Dark Mode) atau Mode Terang (Light Mode)?
Klik tombol **Mode Gelap / Mode Terang** di bagian Pengaturan sidebar (desktop) atau ikon bulan/matahari di pojok kanan atas header (mobile).

### Kenapa menu "Tugas" (Tasks) di sidebar tidak bisa diklik?
Menu **Tugas (Tasks)** saat ini memang sengaja dinonaktifkan karena masih berlabel **Coming Soon** (fitur dalam tahap pengembangan untuk pembaruan mendatang).

### Bagaimana cara mengunduh laporan hasil skrining untuk dibawa ke dokter atau Posyandu?
1. Untuk **Laporan Skrining KPSP (PDF)**: Buka halaman Hasil Skrining atau klik salah satu riwayat pada **Riwayat Skrining** di Dashboard, lalu klik tombol **Ekspor PDF / Unduh Laporan PDF**. File `Laporan_KPSP_<NamaAnak>.pdf` akan terunduh otomatis.
2. Untuk **Data Kurva Pertumbuhan (CSV)**: Pada kartu **Pertumbuhan Berkala** di Dashboard, klik tombol **Export** untuk mengunduh file `Grafik_Pertumbuhan_<NamaAnak>_<Tanggal>.csv`.

### Apakah hasil skrining KINDO menggantikan pemeriksaan dokter atau Posyandu?
Tidak. KINDO adalah alat **deteksi dini dan edukasi mandiri** berdasarkan KPSP Kemenkes RI dan Buku KIA. Hasil skrining bukan diagnosis klinis mutlak, sehingga orang tua tetap disarankan rutin ke Posyandu/Puskesmas dan berkonsultasi dengan Dokter Spesialis Anak bila hasil **Meragukan** berulang atau **Penyimpangan**.

---

## Pemecahan Masalah (Troubleshooting)

### Kenapa saya (Orang Tua) tidak bisa mengirim chat ke dokter/bidan di menu Konsultasi Nakes?
Di KINDO, fitur telekonsultasi Orang Tua menggunakan aturan **Khusus Nakes Rujukan Resmi**. Orang tua hanya dapat mengirim pesan atau melakukan panggilan dengan Tenaga Kesehatan yang telah secara resmi mengklaim/menerbitkan rujukan pendampingan untuk akun Anda.
- **Solusi**: Pastikan Anda sudah melengkapi profil anak dan menyelesaikan skrining KPSP di Dashboard agar Tenaga Kesehatan wilayah/Posyandu dapat meninjau data anak dan mengklaim akun Anda sebagai pasien dampingan. Begitu Nakes menerbitkan rujukan, ruang chat akan otomatis terbuka.

### Kenapa di halaman Hasil Skrining muncul lencana "Local Engine"?
Lencana **Local Engine** menandakan bahwa server sedang menggunakan **Mesin Analisis Klinis Lokal (Fallback Engine)** alih-alih layanan cloud Google Gemini AI (biasanya karena API key belum diatur, koneksi eksternal terganggu, atau kuota API sedang penuh). Anda tetap mendapatkan status perkembangan, daftar area yang perlu diperhatikan (butir yang dijawab "Tidak"), saran stimulasi sesuai kelompok usia, dan rencana tindak lanjut yang akurat sesuai pedoman Kemenkes RI.

### Kenapa saat membuka Puskesmas Terdekat, peta menampilkan wilayah Jakarta padahal saya tidak di Jakarta?
Hal ini terjadi jika izin lokasi **GPS browser ditolak/diblokir** atau GPS perangkat tidak merespons dalam ~6 detik dan perkiraan lokasi berbasis jaringan internet (IP) juga tidak tersedia.
- **Solusi**:
  1. Anda dapat langsung **mengklik titik lokasi tempat tinggal Anda pada peta Google Maps** untuk langsung menampilkan Puskesmas di sekitar titik tersebut.
  2. Atau aktifkan izin lokasi (*Location Permission*) untuk situs KINDO pada pengaturan browser Anda, lalu klik tombol **Coba Lagi** atau **Deteksi GPS**.

### Kenapa garis rute berkendara di peta Puskesmas tidak muncul?
Rute berkendara membutuhkan layanan **Google Maps Routes API** aktif pada konfigurasi Google Maps API Key server. Jika muncul pesan *"Fitur rute (Routes API) belum diaktifkan"*, daftar Puskesmas, alamat, jarak, dan nomor telepon tetap dapat Anda lihat dan gunakan sebagai panduan menuju faskes.

### Kenapa saya (Tenaga Kesehatan) tidak bisa mengklaim pasien di Dashboard Nakes?
Akun Tenaga Kesehatan baru yang mendaftar melalui halaman registrasi publik berada dalam status **Menunggu Verifikasi SIP** (`isVerified = false`). Tombol **Pilih / Layani Pasien** baru aktif setelah **Administrator KINDO** memeriksa dan menyetujui Nomor SIP Anda.

### Kenapa grafik pertumbuhan anak baru sudah langsung berisi beberapa titik sebelum saya mengisi data bulanan?
Saat profil anak pertama kali dibuat, KINDO secara otomatis membuat titik awal (*baseline*) dari berat/tinggi saat lahir (standar median WHO) hingga pengukuran terkini agar kurva pertumbuhan langsung dapat divisualisasikan. Anda dapat memperbarui atau menambahkan titik pengukuran riil setiap bulan melalui tombol **Input / Edit** pada kartu grafik.

### Bagaimana jika saya lupa mengisi sebagian pertanyaan KPSP?
Tombol **Kirim Hasil Skrining** hanya akan aktif apabila seluruh **10 dari 10 pertanyaan** telah terjawab. Klik tombol **Periksa** pada bilah navigasi bawah kuesioner untuk melihat daftar nomor pertanyaan mana saja yang masih berstatus **Belum**, lalu klik nomor tersebut untuk langsung melompat ke soalnya.

### Apakah gambar ilustrasi KPSP wajib tampil agar saya bisa menjawab soal?
Tidak. Jika koneksi internet lambat sehingga gambar ilustrasi tertentu gagal dimuat, KINDO menampilkan kartu panduan observasi pengganti agar Anda tetap dapat membaca arahan pertanyaan dan melanjutkan skrining tanpa hambatan.
