# Knowledge awal Rusdi tentang aplikasi KINDO

Status: referensi editorial MVP Rusdi. Tanggal: 27 November 2026.
Dasar pemeriksaan: kode `f3c61f1` dan workbook pada `data/kpsp/source/`.
Indeks operasional memakai [FAQ JSON yang dikurasi](../../app_knowledge/rusdi-app.json)
dan statistik workbook, bukan isi Markdown ini secara mentah. Perilaku yang
tersedia serta batas verifikasinya dijelaskan dalam [PRD](../prd/rusdi-chatbot.md).

Setiap bagian adalah satu kandidat dokumen knowledge dengan ID stabil.
Bahasa: Indonesia. Audiens: pengguna aplikasi. Ruang lingkup: bantuan produk.
Metadata sumber berikut dipakai pengelola; tampilan chat memakai judul sumber
yang ramah pengguna dan kutipan yang telah disanitasi.

## APP001 Tentang KINDO

Pertanyaan: “KINDO itu apa?” atau “Aplikasi ini buat apa?”

Jawaban: KINDO membantu pemantauan tumbuh kembang anak melalui skrining KPSP,
profil anak, pencatatan pertumbuhan, edukasi, dan konsultasi dengan tenaga
kesehatan. Kamu juga dapat melihat riwayat skrining serta mengunduh laporan.

Sumber: [README](../../README.md), [App](../../src/App.tsx).

## APP002 Mengenal Rusdi

Pertanyaan: “Kamu siapa?” atau “Rusdi itu dokter?”

Jawaban: Aku Rusdi, asisten AI untuk membantu kamu memakai KINDO. Kamu bisa
tanya cara membuka skrining, mengelola profil anak, melihat hasil, atau
menemukan menu yang dibutuhkan. Untuk konsultasi dengan tenaga kesehatan,
gunakan menu Konsultasi Nakes.

Sumber produk: [cakupan Rusdi](../prd/rusdi-chatbot.md#cakupan-mvp).

## APP003 Jumlah formulir skrining

Pertanyaan: “Kuisionernya ada berapa?”, “Kuesioner ono piro?”, atau
“Jumlah formulirnya berapa?”

Mode jawaban: fakta terstruktur. Template: “Ada {form_count} formulir
berdasarkan kelompok usia. Setiap formulir pada versi ini berisi
{questions_per_form} pertanyaan, sehingga totalnya {total_question_entries}
butir di seluruh formulir.” Bila jumlah per formulir tidak seragam, tampilkan
rincian dan jangan mengisi satu angka `questions_per_form`.

Nilai pemeriksaan saat ini: 16 formulir, masing-masing 10 soal, 160 butir total.
Nilai tersebut harus digantikan statistik rilis aktif saat implementasi;
jangan mengandalkan paragraf ini sebagai penghitung runtime.

Sumber: [workbook sumber](../../data/kpsp/source/),
[bank soal aplikasi](../../src/data/questions.ts).

## APP004 Jumlah soal pada satu sesi

Pertanyaan: “Sekali skrining mengerjakan berapa soal?” atau
“Apa harus mengerjakan 160 soal?”

Jawaban pemeriksaan saat ini: satu formulir usia berisi 10 pertanyaan.
Angka 160 adalah jumlah entri di seluruh 16 formulir, bukan jumlah soal
yang dikerjakan dalam satu sesi. Gunakan formulir yang ditampilkan pada sesi
skriningmu. Sistem harus mengisi jumlah dari formulir rilis aktif.

Sumber: [bank soal](../../src/data/questions.ts),
[alur kuesioner](../../src/components/QuestionnaireView.tsx).

## APP005 Kelompok usia yang tersedia

Pertanyaan: “Ada usia berapa saja?” atau “Yang 12 bulan ada?”

Jawaban pemeriksaan saat ini: formulir tersedia untuk usia 3, 6, 9, 12, 15,
18, 21, 24, 30, 36, 42, 48, 54, 60, 66, dan 72 bulan. Formulir 12 bulan
tersedia dan berisi 10 pertanyaan. Untuk usia lain, cari usia yang diminta
pada statistik rilis aktif; jangan membuat formulir yang tidak ada.

Sumber: [workbook sumber](../../data/kpsp/source/),
[bank soal](../../src/data/questions.ts).

## APP006 Aspek yang dicakup kuesioner

Pertanyaan: “Yang ditanyakan tentang apa saja?”

Jawaban: kategori pada bank soal KINDO adalah Gerak Kasar, Gerak Halus,
Bicara dan Bahasa, serta Sosialisasi dan Kemandirian. Soal yang ditampilkan
mengikuti formulir usia yang dibuka.

Sumber: [tipe kategori](../../src/types.ts),
[bank soal](../../src/data/questions.ts).

## APP007 Menambahkan profil anak

Pertanyaan: “Cara menambahkan anak?” atau “Bisa untuk lebih dari satu anak?”

Jawaban: gunakan menu Tambah Anak, lalu isi profil melalui langkah yang
ditampilkan. Aplikasi meminta nama, jenis kelamin, tanggal lahir, serta
pengukuran tubuh. Setelah profil tersimpan, kamu dapat memilih profil anak
yang ingin dipantau pada dashboard.

Sumber: [form profil](../../src/components/ChildOnboardingView.tsx),
[pengelolaan profil](../../src/App.tsx),
[dashboard](../../src/components/DashboardView.tsx).

## APP008 Membuka dan mengisi skrining

Pertanyaan: “Cara mulai KPSP?” atau “Tombol skrining di mana?”

Jawaban: pilih profil anak, lalu gunakan tombol Skrining atau Buat Skrining
Baru di dashboard. Ikuti pilihan kelompok usia yang tampil dan baca halaman
persiapan alat. Tekan Saya Siap, Mulai Skrining, jawab YA atau TIDAK untuk
setiap pertanyaan, periksa ringkasan jawaban, lalu kirim hasil skrining.

Batas jawaban: Rusdi menjelaskan alur aplikasi. Pemilihan kelompok usia untuk
kebutuhan klinis memerlukan panduan yang telah ditinjau nakes.

Sumber: [dashboard](../../src/components/DashboardView.tsx),
[kuesioner](../../src/components/QuestionnaireView.tsx),
[navigasi](../../src/App.tsx).

## APP009 Alat untuk skrining

Pertanyaan: “Perlu menyiapkan alat apa?”

Jawaban: daftar alat berbeda menurut formulir usia. Buka skrining dan baca
halaman persiapan sebelum mulai. Bila usia disebutkan, Rusdi harus mengambil
daftar yang sesuai dari `AGE_EQUIPMENT_DATA` pada versi aplikasi yang sama.
Rusdi tidak menambahkan atau mengganti alat berdasarkan dugaan.

Sumber: [daftar persiapan](../../src/data/questions.ts),
[halaman persiapan](../../src/components/QuestionnaireView.tsx).

## APP010 Label hasil skrining

Pertanyaan: “Sesuai, meragukan, dan penyimpangan itu apa di aplikasi?”

Jawaban: KINDO menampilkan kategori Sesuai untuk skor 9–10, Meragukan untuk
skor 7–8, dan Kemungkinan Penyimpangan untuk skor 0–6. Ini penjelasan label
yang dipakai aplikasi. Hasil skrining perlu dibahas dengan tenaga kesehatan
untuk penilaian kondisi anak.

Sumber: [penentuan status hasil](../../src/components/ResultView.tsx).
Status editorial: menjelaskan implementasi produk; bukan validasi klinis
terhadap seluruh instrumen atau rekomendasi tindak lanjut.

## APP011 Menyimpan dan melihat hasil

Pertanyaan: “Cara menyimpan hasil?” atau “Riwayatnya di mana?”

Jawaban: setelah hasil dan analisis tersedia, tekan Simpan Hasil. Hasil yang
berhasil disimpan dapat dibuka dari Riwayat Skrining di dashboard profil anak.
Mengunduh PDF dan menyimpan hasil ke riwayat adalah dua tindakan terpisah.

Sumber: [hasil](../../src/components/ResultView.tsx),
[penyimpanan hasil](../../src/App.tsx),
[riwayat](../../src/components/DashboardView.tsx).

## APP012 Mengunduh PDF dan data pertumbuhan

Pertanyaan: “Cara download laporan?” atau “Export di dashboard itu PDF?”

Jawaban: gunakan Export PDF pada halaman hasil skrining atau detail riwayat
untuk mengunduh laporan PDF. Tombol Export pada bagian pertumbuhan di
dashboard mengunduh data CSV. Pilih sesuai jenis data yang kamu perlukan.

Sumber: [ekspor PDF](../../src/components/ResultView.tsx),
[ekspor CSV](../../src/components/DashboardView.tsx).

## APP013 Konsultasi dengan nakes

Pertanyaan: “Cara tanya tenaga kesehatan?” atau “Chat Rusdi sama dengan nakes?”

Jawaban: gunakan menu Konsultasi Nakes untuk membuka layanan percakapan dengan
tenaga kesehatan. Ikuti daftar kontak dan aturan pendampingan yang ditampilkan.
Rusdi adalah asisten AI bantuan aplikasi; percakapan dengan nakes dilakukan
melalui menu tersebut.

Sumber: [konsultasi](../../src/components/KonsultasiNakesView.tsx),
[navigasi](../../src/App.tsx), [cakupan Rusdi](../prd/rusdi-chatbot.md).

## APP014 Menemukan puskesmas

Pertanyaan: “Puskesmas terdekat di mana?” atau “Petanya tidak muncul?”

Jawaban: tekan Cari Puskesmas untuk membuka fitur peta. Izinkan akses lokasi
jika kamu ingin memakai posisi perangkat. Bila lokasi atau peta tidak tersedia,
lihat pesan yang tampil dan coba kembali. Rusdi dapat menunjukkan cara membuka
fitur. Hasil fasilitas berasal dari layanan Places; jika layanan tidak tersedia,
aplikasi menawarkan pencarian eksternal tanpa membuat daftar fasilitas sendiri.

Aturan untuk integrasi Rusdi: nama, koordinat, telepon, dan jarak fasilitas
hanya ditampilkan dari sumber pencarian yang dapat dilacak. Ketika lokasi
belum tersedia, arahkan pengguna menentukan lokasi pada fitur peta. Ketika
layanan gagal, Rusdi tidak membuat rekomendasi fasilitas dari pengetahuan
model. Rancangan koreksi lokasi, sumber cadangan, dan tombol pencarian
eksternal dijelaskan pada [perbaikan pencarian puskesmas dalam PRD](../prd/rusdi-chatbot.md#perbaikan-pencarian-puskesmas).

Sumber: [dashboard](../../src/components/DashboardView.tsx),
[modal peta](../../src/components/PuskesmasMapModal.tsx).

## APP015 Grafik pertumbuhan

Pertanyaan: “Grafiknya menampilkan apa?” atau “Bisa memastikan stunting?”

Jawaban: dashboard menampilkan pencatatan berat badan, tinggi badan, dan
lingkar kepala menurut data yang dimasukkan. Gunakan Input / Edit untuk
memperbarui pencatatan. Rusdi tidak memastikan diagnosis atau status stunting
dari grafik tersebut; gunakan konsultasi nakes untuk membahas hasil pengukuran.

Sumber: [grafik dan input pertumbuhan](../../src/components/DashboardView.tsx).
Batas editorial: implementasi garis pembanding saat ini menggunakan pendekatan;
jangan menyebutnya perhitungan z-score WHO tervalidasi.

## APP016 Menu edukasi dan fitur Tugas

Pertanyaan: “Panduan edukasi di mana?” atau “Kenapa Tugas belum bisa dibuka?”

Jawaban: buka menu Edukasi atau tombol Buka Panduan Edukasi pada dashboard.
Menu Tugas masih bertanda Coming Soon pada versi yang diperiksa. Rusdi tidak
menjanjikan tanggal tersedia yang belum diterbitkan pengelola.

Sumber: [navigasi](../../src/App.tsx),
[dashboard](../../src/components/DashboardView.tsx),
[halaman edukasi](../../src/components/EdukasiTumbuhKembang.tsx).

## APP017 Pertanyaan tentang data pribadi

Pertanyaan: “Bacakan hasil anak saya” atau “Tampilkan data orang lain.”

Jawaban untuk MVP Rusdi: aku bisa membantu menunjukkan cara melihat hasil
pada dashboard, tetapi belum membaca rekam kesehatan pribadi melalui chat.
Untuk membuka hasil milikmu, pilih profil dan riwayat pada aplikasi.

Sumber produk: [batas MVP Rusdi](../prd/rusdi-chatbot.md#cakupan-mvp).
Informasi pengguna lain tidak menjadi bagian knowledge chatbot.

## APP018 Jawaban belum ditemukan

Pertanyaan: pertanyaan tentang fitur atau kebijakan yang belum memiliki sumber.

Jawaban: “Aku belum menemukan informasi itu di panduan KINDO yang tersedia.
Bisa jelaskan menu atau langkah yang sedang kamu buka?”

Jika tetap tidak ditemukan, arahkan ke pengelola aplikasi atau konsultasi nakes
sesuai jenis pertanyaannya. Jangan membuat jawaban, alamat kontak, jam layanan,
atau kebijakan baru.

Sumber produk: [perilaku percakapan Rusdi](../prd/rusdi-chatbot.md#perilaku-percakapan).
