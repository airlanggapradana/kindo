# Menjalankan Rusdi dan pencarian puskesmas

Rusdi tersedia setelah login pada tombol Tanya Rusdi. Statistik berasal dari
16 workbook KPSP yang cocok dengan bank soal aplikasi: 16 formulir, masing-masing
10 soal, total 160 butir. Knowledge penggunaan aplikasi dibaca langsung dari
seluruh file Markdown panduan di folder [`app_knowledge/`](../app_knowledge/)
(kecuali `README.md`, `RUSDI_INTEGRATION.md`, dan dokumen ber-`category: meta`).

## Database lokal

Gunakan Node.js 24.12 atau lebih baru dan Docker Desktop dengan Linux Engine.
Salin `.env.example` menjadi `.env`, ganti dua password PostgreSQL dan password
yang sama pada kedua URL koneksi. Gunakan password yang aman untuk URL, atau
percent-encode karakter khusus pada URL. File `.env` diabaikan Git.

```sh
npm install
docker compose up -d --wait
npm run knowledge:build
npm run knowledge:migrate
npm run knowledge:ingest
npm run dev
```

Pada workspace implementasi, `.env` lokal sudah dibuat dengan password acak,
database sudah berjalan di `127.0.0.1:15432`, dan knowledge sudah diimpor.
Password tidak dicetak atau dimasukkan ke Git. Gunakan konfigurasi yang sama
ketika menjalankan Compose kembali. Mengganti password pada `.env` saja tidak
mengganti password role di volume PostgreSQL yang telah diinisialisasi.

`DATABASE_URL` memakai role `rusdi_runtime`, yang membaca knowledge dan hanya
dapat menambahkan feedback. `DATABASE_MIGRATION_URL` memakai role pengelola
untuk migrasi dan impor. Jangan memakai URL pengelola untuk proses web.

Image pgvector dikunci ke versi dan digest yang diuji. Data berada di named
volume `kindo-rusdi_rusdi-postgres`. Perintah `docker compose stop` menghentikan
service tanpa menghapus data; jalankan `docker compose up -d --wait` untuk
menyalakannya kembali. Jangan memakai penghapusan volume sebagai langkah
pembaruan biasa.

## Mengaktifkan pencarian semantik Gemini

Tanpa key Gemini, fakta dan FAQ terverifikasi sudah bekerja. Isi variabel
server berikut untuk mengaktifkan embedding dan pemilihan sumber oleh model:

```env
GEMINI_API_KEY=isi_key_server
RUSDI_GENERATION_MODEL=isi_model_generatif_yang_tersedia_di_akun
RUSDI_EMBEDDING_MODEL=gemini-embedding-001
RUSDI_EMBEDDING_DIMENSIONS=768
```

Kemudian jalankan:

```sh
npm run knowledge:ingest -- --require-embeddings
```

Restart server agar environment terbaru terbaca. Importer membuat rilis baru
setelah semua embedding berhasil; jika provider gagal, rilis aktif sebelumnya
tetap dipakai. Embedding konten yang tidak berubah dapat dipakai ulang dari
rilis dengan model dan dimensi yang sama. Adapter saat ini mendukung
`gemini-embedding-001`; pergantian keluarga model memerlukan adapter dan pengujian.

Pencarian memakai cosine distance pgvector dengan dimensi 768. Gemini memilih
ID sumber dari kandidat retrieval, lalu backend menampilkan teks FAQ sumber
yang telah dikurasi. Keluaran bebas model tidak langsung ditampilkan. Dengan
demikian jawaban tetap berada pada knowledge KINDO, termasuk saat pertanyaan
mencoba mengalihkan instruksi. Pertanyaan angka ditangani query statistik tanpa
meminta model menghitung.

`GEMINI_GENERATION_MODEL` mengatur model analisis skrining dan terjemahan.
Jika kosong, kedua endpoint memakai `RUSDI_GENERATION_MODEL`. Jika key atau
model belum dikonfigurasi, analisis tetap memakai fallback lokal.

Set `RUSDI_ENABLED=false` dan restart server untuk menonaktifkan panel serta
endpoint chat. Fitur aplikasi lain tetap tersedia.

## Mengaktifkan pencarian puskesmas

```env
GOOGLE_PLACES_SERVER_KEY=isi_key_server
VITE_GOOGLE_MAPS_BROWSER_KEY=isi_key_browser
VITE_GOOGLE_MAP_ID=isi_map_id_produksi
```

Pada key server, aktifkan Places API New dan billing serta batasi aplikasi dan
API yang dapat menggunakannya. Geocoding API dibutuhkan jika memakai pencarian
kelurahan/kecamatan. Key browser digunakan untuk Maps JavaScript dan dibatasi
ke referrer situs. Variabel `VITE_` masuk ke frontend; jangan menggunakannya
untuk key server. Perubahan key browser memerlukan build ulang.

Key lama `GOOGLE_MAPS_PLATFORM_KEY` masih dibaca sebagai kompatibilitas di server,
tetapi tidak lagi disisipkan ke frontend. Gemini key juga tidak disisipkan
ke bundle browser.

Alur pencarian:

1. Gunakan lokasi perangkat, pilih pin peta, atau cari wilayah.
2. Lokasi kasar di atas 1.000 meter perlu dikonfirmasi. Lokasi gagal tidak
   otomatis diganti ke Jakarta.
3. Cari dalam radius 5, 10, atau 25 km. Daftar berisi kandidat bernama puskesmas
   dengan ID dan koordinat dari Google Places, tanpa duplikat atau fasilitas
   berstatus tutup permanen. Puskesmas pembantu tidak digabung ke kategori ini.
4. Jarak pada kartu adalah garis lurus dari titik pencarian. Tombol rute
   membuka Google Maps untuk navigasi jalan. MVP ini tidak memerlukan Routes
   API di dalam aplikasi.
5. Bila key, kuota, koneksi, atau provider bermasalah, tampilkan pesan dan
   tombol Buka Google Maps. Tidak ada daftar fasilitas yang dibuat oleh AI
   atau offset koordinat. Direktori fasilitas lokal cadangan belum tersedia.

Pencarian wilayah tetap dapat menampilkan hasil daftar ketika key browser belum
tersedia tetapi key server sudah berfungsi. Jika seluruh key Maps kosong,
tombol pencarian eksternal tetap dapat digunakan. Hasil Google Places tidak
disalin menjadi knowledge pgvector atau direktori permanen.

## Pembaruan knowledge

Folder [`app_knowledge/`](../app_knowledge/) berada langsung di root proyek.
Sepuluh dokumen Markdown dari folder sumber pengguna disalin tanpa perubahan.
Status peninjauan dan perbedaan dengan kode terbaru dicatat di
[`RUSDI_INTEGRATION.md`](../app_knowledge/RUSDI_INTEGRATION.md).
Importer membaca `app_knowledge/rusdi-app.json`, bukan seluruh Markdown mentah.

FAQ operasional menggunakan JSON yang dikurasi. Dokumen Markdown
[`rusdi-app-faq.md`](knowledge/rusdi-app-faq.md) adalah referensi editorial dan
tidak diimpor mentah, sehingga catatan pengelola, source code, dan kredensial
tidak masuk konteks jawaban.

Sesudah mengubah FAQ atau workbook:

```sh
npm run knowledge:build
npm run knowledge:ingest
npm test
npm run lint
npm run build
```

Importer memeriksa nama sheet, nomor soal, kategori, jumlah, dan kecocokan teks
dengan `src/data/questions.ts`. Perbedaan teks tercatat pada snapshot; teks
klinis tidak otomatis masuk indeks FAQ. Ketidakcocokan jumlah atau nomor
menggagalkan publikasi. Snapshot dibundel server untuk bantuan dasar ketika
database tidak tersedia, dengan pemeriksaan hash bank aplikasi.

Rilis baru menonaktifkan rilis sebelumnya dalam satu transaksi. Impor ulang
versi yang sama tidak menggandakan formulir, soal, atau dokumen. Catatan
feedback tetap terkait rilis jawaban yang diterima pengguna.

## Pengujian

```sh
npm test
npm run lint
npm run build
npm --prefix tests/firestore ci
npm --prefix tests/firestore test
npm run benchmark:rusdi
```

Tes database dalam `npm test` memakai database lokal bila
`DATABASE_MIGRATION_URL` tersedia. Tes tersebut memeriksa rilis, jumlah data,
query vektor, dan batas hak runtime. Pengujian vektor menggunakan tabel
sementara dengan vektor fixture lalu rollback; embedding palsu tidak disimpan
ke knowledge produksi. Tes database ditandai skip bila environment database
belum disediakan.

Benchmark statistik memakai 50 operasi dengan konkurensi 10. Hasil lokal
implementasi ini: p95 33 ms dan maksimum 40 ms untuk pembacaan statistik
PostgreSQL. Pengukuran ini tidak mencakup autentikasi HTTP, waktu jaringan,
atau panggilan Gemini, dan bukan jaminan latency produksi.

Tes aturan Firestore memakai paket fixture Firebase tersendiri agar versi
peer SDK penguji kompatibel. Emulator menggunakan project `demo-kindo`, port
18095, dan Java 21. Ia tidak menerbitkan aturan atau menulis data ke Firebase
produksi. Cakupannya termasuk kepemilikan anak, penugasan nakes, perubahan
peran, identitas pengirim pesan, dan kueri percakapan.

## Persiapan rilis produksi

Aturan dan indeks baru tersedia pada `firestore.rules`,
`firestore.indexes.json`, serta `firebase.json` untuk database bernama yang
dipakai KINDO. Deploy keduanya melalui akun Firebase pengelola, pastikan indeks
selesai dibangun, kemudian terbitkan frontend yang memakai query baru. Periksa
indeks yang sudah ada sebelum mengonfirmasi penghapusan indeks melalui CLI.
Tidak ada deploy Firebase yang dijalankan selama implementasi lokal ini.

Akun contoh dan bypass UID sudah dihapus dari frontend. Pengelola masih harus
merotasi password akun contoh yang dahulu tersimpan di source dan mencabut
sesinya melalui akses administrasi Firebase sebelum peluncuran publik. Perubahan
kode tidak mengganti password akun cloud yang sudah ada.

Route server produksi juga menolak akses publik ke bundle backend
`server.cjs` dan source map-nya; keduanya tetap berada di hasil build untuk
menjalankan proses Node, bukan sebagai aset frontend.

Backend Rusdi memverifikasi Firebase ID token untuk project aplikasi. UID atau
peran dari body dan sessionStorage tidak menjadi dasar akses. Token verification
ini tidak memerlukan pembacaan data kesehatan melalui Firebase Admin.

Siapkan database persisten yang dapat dijangkau deployment server, backup, dan
secret produksi. Docker laptop tidak menyediakan database untuk server cloud.
Quota saat ini disimpan di memori satu proses; deployment dengan beberapa
instance memerlukan quota bersama. Jangan mengaktifkan variabel emulator Auth
atau Firestore pada lingkungan produksi.

Pengujian lokal mencakup mode fakta/FAQ, autentikasi, database, kegagalan provider,
dan browser. Panggilan live Gemini embedding/generasi serta hasil Google Places
memerlukan key yang belum tersedia pada workspace ini; jangan menyatakan jalur
provider live telah tervalidasi sebelum pengujian dengan key tersebut.
