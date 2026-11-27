import type { UserRole } from '../types';

export type GuideLanguage = 'id' | 'en';
export type GuideText = Record<GuideLanguage, string>;
export type GuideAudience = 'all' | UserRole;
export type GuideAction = 'dashboard' | 'onboarding' | 'education' | 'consultation';

export interface GuideSection {
  title: GuideText;
  paragraphs?: GuideText[];
  steps?: GuideText[];
  bullets?: GuideText[];
  note?: GuideText;
  questions?: { question: GuideText; answer: GuideText }[];
}

export interface GuideChapter {
  id: string;
  title: GuideText;
  description: GuideText;
  audiences: GuideAudience[];
  keywords: string[];
  sourceFiles: string[];
  sections: GuideSection[];
  action?: { id: GuideAction; label: GuideText; roles: UserRole[] };
}

const text = (id: string, en: string): GuideText => ({ id, en });

// Curated from app_knowledge/01–09, rusdi-app.json, and RUSDI_INTEGRATION.md.
// Keep operational instructions aligned with the active UI. The original Markdown
// includes historical features; do not publish it verbatim or change Rusdi's index here.
export const GUIDE_REVIEWED_AT = '2026-11-28';

export const GUIDE_CHAPTERS: GuideChapter[] = [
  {
    id: 'mengenal-kindo',
    title: text('Mengenal KINDO', 'Getting to know KINDO'),
    description: text('Kenali fitur, peran pengguna, dan alur pertama Anda.', 'Explore the features, user roles, and your first steps.'),
    audiences: ['all'],
    keywords: ['tentang', 'mulai', 'gratis', 'bantuan', 'rusdi', 'getting started', 'overview'],
    sourceFiles: ['01_tentang_kindo.md', 'rusdi-app.json'],
    sections: [
      {
        title: text('Satu tempat untuk memantau tumbuh kembang', 'A place to keep track of your child’s development'),
        paragraphs: [text('KINDO membantu keluarga mencatat pertumbuhan anak, mengisi skrining KPSP, membaca edukasi, dan berkomunikasi dengan tenaga kesehatan pendamping. Layanan aplikasi dapat digunakan secara gratis.', 'KINDO helps families record growth, complete KPSP screening, read educational material, and communicate with their assigned health professional. The application is free to use.')],
        bullets: [
          text('Profil anak dan pencatatan berat badan, tinggi badan, serta lingkar kepala.', 'Child profiles and records of weight, height, and head circumference.'),
          text('Skrining KPSP: 16 kelompok usia dari 3 sampai 72 bulan, masing-masing 10 pertanyaan.', 'KPSP screening: 16 age groups from 3 to 72 months, with 10 questions per group.'),
          text('Riwayat hasil, unduhan laporan PDF, dan ekspor catatan pertumbuhan CSV.', 'Screening history, downloadable PDF reports, and CSV growth records.'),
          text('Edukasi tumbuh kembang, chat Nakes pendamping, dan pencarian puskesmas.', 'Development education, chat with your assigned health professional, and health center search.'),
        ],
        note: text('KINDO membantu deteksi dini dan edukasi. Hasil skrining dan analisis AI bukan diagnosis; diskusikan kondisi anak dengan tenaga kesehatan.', 'KINDO supports early screening and education. Screening results and AI analysis are not a diagnosis; discuss your child’s condition with a health professional.'),
      },
      {
        title: text('Pilih panduan sesuai peran', 'Find guidance for your role'),
        bullets: [
          text('Orang Tua: membuat profil anak, mencatat pertumbuhan, melakukan skrining, dan berkonsultasi.', 'Parents: create child profiles, record growth, complete screenings, and consult a health professional.'),
          text('Tenaga Kesehatan: menunggu verifikasi akun, mengklaim pasien, meninjau data, dan mendampingi orang tua.', 'Health professionals: complete account verification, claim patients, review records, and support parents.'),
          text('Admin: memverifikasi tenaga kesehatan, menambahkan akun Nakes, dan meninjau aktivitas administratif.', 'Administrators: verify health professionals, add professional accounts, and review administrative activity.'),
        ],
      },
      {
        title: text('Langkah pertama untuk orang tua', 'First steps for parents'),
        steps: [
          text('Daftar sebagai Orang Tua dan lengkapi wilayah tempat tinggal.', 'Register as a parent and complete your home region.'),
          text('Tambahkan profil anak beserta tanggal lahir dan pengukuran terkini.', 'Add your child’s profile, date of birth, and current measurements.'),
          text('Pilih profil anak di dashboard, lalu mulai skrining atau catat pertumbuhannya.', 'Select your child’s profile on the dashboard, then start screening or record growth.'),
          text('Simpan hasil skrining agar dapat dibuka kembali dari riwayat.', 'Save the screening result so you can reopen it from your history.'),
        ],
      },
      {
        title: text('Bantuan dari Rusdi', 'Help from Rusdi'),
        paragraphs: [text('Setelah login, gunakan tombol Tanya Rusdi untuk menanyakan cara memakai fitur KINDO. Rusdi adalah asisten AI bantuan aplikasi, sedangkan Konsultasi Nakes adalah percakapan dengan tenaga kesehatan. Rusdi belum membaca rekam kesehatan pribadi melalui chat.', 'After signing in, use Ask Rusdi for help with KINDO’s features. Rusdi is an AI application assistant; Health Consultation is a conversation with a health professional. Rusdi does not currently read personal health records through chat.')],
      },
    ],
    action: { id: 'dashboard', label: text('Buka dashboard', 'Open dashboard'), roles: ['orang_tua', 'nakes', 'admin'] },
  },
  {
    id: 'akun-dan-pengaturan',
    title: text('Akun dan pengaturan', 'Account and settings'),
    description: text('Daftar, masuk, dan sesuaikan tampilan KINDO.', 'Register, sign in, and personalize KINDO.'),
    audiences: ['all'],
    keywords: ['login', 'register', 'email', 'password', 'kata sandi', 'bahasa', 'tema', 'dark mode', 'logout', 'keluar'],
    sourceFiles: ['02_panduan_akun_dan_peran_pengguna.md', '09_faq_dan_troubleshooting.md'],
    sections: [
      {
        title: text('Membuat akun', 'Create an account'),
        steps: [
          text('Buka Daftar dari beranda, lalu pilih Orang Tua atau Tenaga Kesehatan.', 'Open Register from the home page, then choose Parent or Health Professional.'),
          text('Isi nama, email aktif, kata sandi minimal 6 karakter, dan konfirmasi kata sandi.', 'Enter your name, an active email, a password of at least 6 characters, and password confirmation.'),
          text('Pilih provinsi, kabupaten/kota, kecamatan, dan kelurahan/desa secara berurutan.', 'Select your province, city/regency, district, and village in order.'),
          text('Untuk akun Nakes, isi juga nama beserta gelar dan nomor SIP yang diminta.', 'For health professional accounts, also provide your professional name/title and requested SIP practice license number.'),
          text('Tekan Daftar Sekarang. Orang tua melanjutkan ke profil anak; Nakes menunggu verifikasi Admin untuk penugasan pasien.', 'Select Register Now. Parents continue to the child profile; professionals await administrator verification for patient assignment.'),
        ],
        note: text('Akun Admin tidak tersedia pada pendaftaran publik. Jangan membagikan kata sandi di chat atau kepada pengguna lain.', 'Administrator accounts are not available through public registration. Do not share passwords in chat or with other users.'),
      },
      {
        title: text('Masuk dan keluar', 'Sign in and sign out'),
        steps: [
          text('Buka Masuk, lalu isi email dan kata sandi akun Anda.', 'Open Sign In and enter your account email and password.'),
          text('Setelah masuk, dashboard mengikuti peran akun. Orang tua yang belum memiliki profil anak diarahkan untuk menambah anak.', 'After signing in, your dashboard follows your account role. Parents without a child profile are guided to add one.'),
          text('Untuk keluar, buka menu samping atau menu mobile, lalu pilih Keluar.', 'To sign out, open the sidebar or mobile menu and select Sign Out.'),
        ],
      },
      {
        title: text('Bahasa dan tema', 'Language and appearance'),
        paragraphs: [text('Buka Pengaturan pada sidebar desktop atau menu mobile. Tombol Bahasa beralih antara Indonesia dan Inggris; Mode Gelap / Mode Terang mengatur tampilan. Buku panduan ini juga memiliki pengaturan bahasa dan tema pada bagian atas halaman.', 'Open Settings in the desktop sidebar or mobile menu. Language switches between Indonesian and English; Dark / Light Mode changes the appearance. This guide also has language and theme controls at the top of the page.')],
      },
      {
        title: text('Kendala akun', 'Account troubleshooting'),
        questions: [
          { question: text('Email sudah terdaftar?', 'Email already registered?'), answer: text('Gunakan halaman Masuk untuk akun tersebut atau email lain saat mendaftar.', 'Use Sign In for that account, or register with a different email.') },
          { question: text('Email atau kata sandi tidak sesuai?', 'Email or password incorrect?'), answer: text('Periksa penulisan email serta huruf besar/kecil kata sandi. Jika percobaan dibatasi, tunggu sebelum mencoba kembali.', 'Check the email spelling and password capitalization. If attempts are temporarily limited, wait before trying again.') },
          { question: text('Pendaftaran belum bisa dikirim?', 'Cannot submit registration?'), answer: text('Pastikan konfirmasi kata sandi cocok dan keempat tingkat wilayah sudah dipilih. Akun Nakes juga memerlukan nomor SIP.', 'Make sure the password confirmation matches and all four region fields are selected. Health professional accounts also require a SIP number.') },
        ],
      },
    ],
  },
  {
    id: 'profil-dan-pertumbuhan',
    title: text('Profil anak dan pertumbuhan', 'Child profiles and growth'),
    description: text('Kelola profil anak, pengukuran berkala, grafik, dan CSV.', 'Manage child profiles, measurements, charts, and CSV exports.'),
    audiences: ['orang_tua', 'nakes'],
    keywords: ['tambah anak', 'onboarding', 'berat', 'tinggi', 'lingkar kepala', 'grafik', 'who', 'csv', 'child', 'growth', 'measurement'],
    sourceFiles: ['03_panduan_profil_anak_dan_kurva_pertumbuhan.md', '09_faq_dan_troubleshooting.md'],
    sections: [
      {
        title: text('Menambahkan profil anak', 'Add a child profile'),
        steps: [
          text('Pilih Tambah Anak pada menu, atau Tambah Anak Baru dari pemilih profil di dashboard.', 'Select Add Child from the menu, or Add New Child from the dashboard profile picker.'),
          text('Isi nama anak, jenis kelamin, dan tanggal lahir. Usia dihitung dari tanggal lahir.', 'Enter your child’s name, sex, and date of birth. Age is calculated from the birth date.'),
          text('Lanjutkan ke pengukuran fisik. Isi berat dalam kg dan tinggi/panjang dalam cm; lingkar kepala bersifat opsional saat pembuatan profil.', 'Continue to physical measurements. Enter weight in kg and height/length in cm; head circumference is optional when creating the profile.'),
          text('Simpan profil dan tunggu sampai proses selesai sebelum meninggalkan halaman.', 'Save the profile and wait for completion before leaving the page.'),
        ],
      },
      {
        title: text('Berpindah anak dan mencatat pengukuran', 'Switch children and record measurements'),
        steps: [
          text('Gunakan pemilih profil pada kartu sapaan dashboard untuk memilih anak yang sedang dipantau.', 'Use the profile picker on the dashboard greeting card to select the child you are tracking.'),
          text('Di bagian Pertumbuhan Berkala, pilih Input / Edit atau Kelola Data.', 'In Periodic Growth, select Input / Edit or Manage Data.'),
          text('Isi usia bulan ke, tanggal ukur, berat, tinggi, lingkar kepala, dan catatan jika diperlukan. Ikuti kolom wajib yang tampil pada formulir.', 'Enter the age in months, measurement date, weight, height, head circumference, and any notes. Complete the required fields shown in the form.'),
          text('Tekan Simpan Data. Jika bulan tersebut sudah memiliki catatan, pengukuran pada bulan itu akan diperbarui.', 'Select Save Data. If that month already has a record, the measurement for that month is updated.'),
        ],
        note: text('Pastikan profil anak yang dipilih benar sebelum mengisi data atau mengunduh catatan. Riwayat pertumbuhan dan skrining mengikuti profil aktif.', 'Check the selected child before entering or downloading records. Growth records and screening history follow the active profile.'),
      },
      {
        title: text('Memahami tampilan grafik', 'Understand the chart display'),
        paragraphs: [
          text('Pilih tab Berat, Tinggi, Lingkar Kepala, atau Semua Metrik. Sentuh atau arahkan kursor ke titik grafik untuk melihat rinciannya. Garis putus-putus menunjukkan median acuan yang ditampilkan aplikasi.', 'Choose Weight, Height, Head Circumference, or All Metrics. Tap or hover over a chart point to see its details. The dashed line shows the reference median displayed by the application.'),
          text('Profil baru dapat menampilkan titik awal perkiraan berlabel Standar WHO. Titik tersebut bukan hasil pengukuran anak. Perbarui dengan catatan pengukuran nyata dari Buku KIA, Posyandu, atau fasilitas kesehatan.', 'New profiles may show estimated starting points labeled WHO Standard. These are not measurements of your child. Replace them with actual measurements from your KIA book, Posyandu, or health facility.'),
        ],
        note: text('Grafik membantu pencatatan dan pembahasan bersama Nakes. Jangan menyimpulkan diagnosis atau status stunting hanya dari garis grafik.', 'Use the chart to maintain records and discuss them with a health professional. Do not determine a diagnosis or stunting status from chart lines alone.'),
      },
      {
        title: text('Mengunduh catatan CSV', 'Download CSV records'),
        paragraphs: [text('Tekan Export pada kartu pertumbuhan untuk mengunduh CSV berisi pengukuran, tanggal, dan catatan anak yang aktif. File dapat dibuka dengan aplikasi spreadsheet. CSV pertumbuhan berbeda dari laporan PDF hasil skrining.', 'Select Export on the growth card to download a CSV with the active child’s measurements, dates, and notes. Open it in a spreadsheet application. Growth CSV files are separate from screening PDF reports.')],
      },
    ],
    action: { id: 'onboarding', label: text('Tambahkan profil anak', 'Add a child profile'), roles: ['orang_tua'] },
  },
  {
    id: 'skrining-kpsp',
    title: text('Skrining KPSP dan hasil', 'KPSP screening and results'),
    description: text('Dari persiapan alat sampai menyimpan hasil dan laporan PDF.', 'From preparing the equipment to saving results and PDF reports.'),
    audiences: ['orang_tua', 'nakes'],
    keywords: ['kuesioner', 'alat', 'usia', 'skor', 'hasil', 'riwayat', 'pdf', 'local engine', 'ai', 'questionnaire', 'screening', 'score', 'history'],
    sourceFiles: ['04_panduan_skrining_kpsp_dan_analisis_ai.md', '09_faq_dan_troubleshooting.md', 'rusdi-app.json'],
    sections: [
      {
        title: text('Memilih profil dan kelompok usia', 'Choose the profile and age group'),
        steps: [
          text('Pilih profil anak yang sesuai di dashboard, lalu tekan Skrining atau Mulai Skrining.', 'Select the correct child profile on the dashboard, then choose Screening or Start Screening.'),
          text('Ikuti pilihan kelompok usia yang ditampilkan. Bila usia berada di antara dua kelompok, aplikasi dapat menampilkan dua pilihan terdekat.', 'Follow the age-group choices shown. When an age falls between groups, the application may show the two nearest choices.'),
          text('Baca daftar persiapan alat pada formulir usia tersebut, lalu pilih Saya Siap, Mulai Skrining.', 'Read the equipment list for that age group, then select I’m Ready, Start Screening.'),
        ],
        note: text('Tersedia 16 kelompok usia: 3, 6, 9, 12, 15, 18, 21, 24, 30, 36, 42, 48, 54, 60, 66, dan 72 bulan. Konfirmasikan pemilihan kelompok usia untuk kebutuhan klinis kepada Nakes.', 'There are 16 age groups: 3, 6, 9, 12, 15, 18, 21, 24, 30, 36, 42, 48, 54, 60, 66, and 72 months. Confirm the appropriate age group for clinical purposes with a health professional.'),
      },
      {
        title: text('Menjawab dan memeriksa kuesioner', 'Complete and review the questionnaire'),
        steps: [
          text('Baca petunjuk setiap pertanyaan dan ilustrasi jika tersedia.', 'Read each question’s instructions and any available illustration.'),
          text('Pilih Ya jika anak mampu melakukan kemampuan yang ditanyakan, atau Tidak jika belum mampu, sesuai pengamatan nyata.', 'Select Yes if your child can perform the activity, or No if they cannot yet, based on your observation.'),
          text('Gunakan Sebelumnya, Berikutnya, atau Periksa untuk meninjau dan mengubah jawaban.', 'Use Previous, Next, or Review to check and change your answers.'),
          text('Setelah 10 pertanyaan terjawab, tekan Kirim Hasil Skrining dan tunggu hasilnya.', 'Once all 10 questions are answered, select Submit Screening Results and wait for the result.'),
        ],
      },
      {
        title: text('Mengenali label hasil dan analisis', 'Understand result labels and analysis'),
        bullets: [
          text('Skor 9–10 ditampilkan dengan label Sesuai.', 'Scores of 9–10 are displayed as Appropriate.'),
          text('Skor 7–8 ditampilkan dengan label Meragukan.', 'Scores of 7–8 are displayed as Questionable.'),
          text('Skor 0–6 ditampilkan sebagai kemungkinan penyimpangan perkembangan.', 'Scores of 0–6 are displayed as possible developmental deviation.'),
          text('Kartu aspek merangkum Gerak Kasar, Gerak Halus, Bicara dan Bahasa, serta Sosialisasi dan Kemandirian.', 'Aspect cards summarize Gross Motor, Fine Motor, Speech and Language, and Social and Independence skills.'),
        ],
        paragraphs: [text('Analisis AI membantu menjelaskan hasil. Lencana Local Engine berarti server menggunakan analisis berbasis aturan lokal ketika layanan AI tidak tersedia. Untuk membahas kondisi dan tindak lanjut anak, gunakan konsultasi Nakes.', 'AI analysis helps explain the result. A Local Engine badge means the server is using local rule-based analysis when the AI service is unavailable. Discuss your child’s condition and next steps with a health professional.')],
      },
      {
        title: text('Menyimpan riwayat dan mengunduh PDF', 'Save history and download a PDF'),
        steps: [
          text('Tekan Simpan Hasil pada halaman hasil skrining agar hasil masuk ke riwayat.', 'Select Save Result on the result page to add it to your history.'),
          text('Buka kembali hasil melalui Riwayat Skrining pada dashboard anak yang sesuai.', 'Reopen it from Screening History on the correct child’s dashboard.'),
          text('Tekan Export PDF pada hasil atau detail riwayat untuk mengunduh laporan.', 'Select Export PDF on the result or history detail to download the report.'),
        ],
        note: text('Mengunduh PDF dan menyimpan hasil ke riwayat adalah dua tindakan terpisah. Pastikan Simpan Hasil berhasil jika Anda ingin membukanya lagi dari perangkat lain.', 'Downloading a PDF and saving a result to history are separate actions. Make sure Save Result succeeds if you want to reopen it on another device.'),
      },
    ],
    action: { id: 'dashboard', label: text('Buka dashboard untuk skrining', 'Open dashboard for screening'), roles: ['orang_tua'] },
  },
  {
    id: 'edukasi-dan-stimulasi',
    title: text('Edukasi dan stimulasi', 'Education and stimulation'),
    description: text('Temukan materi edukasi dan aktivitas pada fitur yang tersedia.', 'Find educational material and activities in KINDO.'),
    audiences: ['orang_tua', 'nakes'],
    keywords: ['aktivitas', 'pengasuhan', 'buku kia', 'idai', 'unicef', 'stimulation', 'education', 'parenting'],
    sourceFiles: ['05_panduan_edukasi_dan_stimulasi_tumbuh_kembang.md'],
    sections: [
      {
        title: text('Membuka materi edukasi', 'Open educational material'),
        steps: [
          text('Pilih Edukasi di sidebar atau menu mobile, atau Buka Panduan Edukasi di dashboard orang tua.', 'Select Education in the sidebar or mobile menu, or Open Education Guide on the parent dashboard.'),
          text('Pilih tab kategori hasil: Sesuai, Meragukan, atau Penyimpangan.', 'Choose a result category: Appropriate, Questionable, or Deviation.'),
          text('Gunakan filter aspek untuk melihat aktivitas Gerak Kasar, Gerak Halus, Bicara, atau Kemandirian.', 'Use the aspect filter for Gross Motor, Fine Motor, Speech, or Independence activities.'),
          text('Baca petunjuk aktivitas dan sumber rujukannya. Bagian edukasi juga tersedia pada halaman hasil skrining.', 'Read the activity instructions and references. Education is also available on the screening result page.'),
        ],
      },
      {
        title: text('Sumber bacaan lanjutan', 'Further reading'),
        paragraphs: [text('Pada bagian sumber tepercaya di halaman Edukasi, tersedia tautan ke Buku KIA Kemenkes, IDAI, PrimaKu, WHO, UNICEF, dan Ayo Sehat. Gunakan tombol buka atau salin tautan pada sumber yang ingin Anda baca.', 'The trusted resources section in Education links to the Kemenkes KIA book, IDAI, PrimaKu, WHO, UNICEF, and Ayo Sehat. Use the open or copy-link control for the resource you want to read.')],
        note: text('Buku panduan ini menjelaskan cara menggunakan fitur. Materi aktivitas dan stimulasi tetap tersedia pada halaman Edukasi agar mudah dibaca bersama hasil skrining.', 'This guide explains how to use the features. Activities and stimulation material remain on the Education page so you can read them alongside screening results.'),
      },
    ],
    action: { id: 'education', label: text('Buka halaman Edukasi', 'Open Education'), roles: ['orang_tua'] },
  },
  {
    id: 'konsultasi-dan-puskesmas',
    title: text('Konsultasi dan puskesmas', 'Consultations and health centers'),
    description: text('Terhubung dengan Nakes pendamping dan cari fasilitas terdekat.', 'Connect with your assigned professional and find nearby facilities.'),
    audiences: ['orang_tua', 'nakes'],
    keywords: ['chat', 'rujukan', 'pesan', 'lokasi', 'gps', 'peta', 'maps', 'radius', 'faskes', 'consultation', 'location', 'referral'],
    sourceFiles: ['06_panduan_konsultasi_nakes_dan_puskesmas_finder.md', 'RUSDI_INTEGRATION.md', 'rusdi-app.json'],
    sections: [
      {
        title: text('Chat dengan Nakes pendamping', 'Chat with your assigned professional'),
        steps: [
          text('Buka Konsultasi Nakes dari menu aplikasi.', 'Open Health Consultation from the application menu.'),
          text('Jika belum ada Nakes rujukan, lengkapi profil dan skrining anak agar dapat ditinjau oleh tenaga kesehatan.', 'If no professional has been assigned, complete your child’s profile and screening so a health professional can review them.'),
          text('Setelah Nakes terverifikasi mengklaim akun Anda sebagai pasien dampingan, kontak pendamping muncul pada daftar konsultasi.', 'After a verified professional claims your account as a patient, their contact appears in your consultation list.'),
          text('Pilih kontak pendamping, ketik pesan, lalu kirim. Pesan tetap tersimpan saat penerima sedang offline.', 'Select the assigned contact, type your message, and send it. Messages are retained when the recipient is offline.'),
        ],
        note: text('Orang tua hanya dapat berkonsultasi dengan Nakes rujukan yang ditugaskan. Petunjuk di sini mencakup chat teks; panggilan suara/video serta pengiriman berkas dan rekaman suara belum menjadi layanan lengkap.', 'Parents can consult only with their assigned professional. These instructions cover text chat; voice/video calls, file transfers, and voice recordings are not yet complete services.'),
      },
      {
        title: text('Mencari puskesmas', 'Find a health center'),
        steps: [
          text('Tekan Cari Puskesmas pada dashboard atau halaman hasil skrining.', 'Select Find Health Center on the dashboard or screening result page.'),
          text('Izinkan lokasi perangkat, pilih titik pada peta, atau cari wilayah secara manual.', 'Allow device location, choose a point on the map, or search for a region manually.'),
          text('Pilih radius pencarian 5, 10, atau 25 km. Tinjau nama, alamat yang tersedia, dan jarak fasilitas dari titik pencarian.', 'Choose a 5, 10, or 25 km search radius. Review facility names, available addresses, and distance from the search point.'),
          text('Tekan Lihat rute di Google Maps untuk membuka navigasi menuju fasilitas yang dipilih.', 'Select View Route in Google Maps to open navigation to your chosen facility.'),
        ],
        note: text('Jarak pada daftar adalah jarak garis lurus, bukan jarak perjalanan. Jika izin lokasi ditolak, pilih wilayah atau titik secara manual. Jika layanan pencarian tidak tersedia, gunakan Buka Google Maps.', 'Listed distances are straight-line distances, not travel distances. If location permission is denied, choose a region or point manually. If search is unavailable, use Open Google Maps.'),
      },
      {
        title: text('Jika kontak atau hasil pencarian belum muncul', 'If contacts or search results do not appear'),
        questions: [
          { question: text('Mengapa saya tidak bisa chat Nakes?', 'Why can’t I chat with a professional?'), answer: text('Periksa apakah akun sudah memiliki Nakes pendamping. Melengkapi skrining tidak otomatis menugaskan Nakes; penugasan dilakukan oleh Nakes terverifikasi.', 'Check whether a professional is assigned to your account. Completing screening does not automatically assign one; assignment is performed by a verified professional.') },
          { question: text('Puskesmas tidak ditemukan?', 'No health centers found?'), answer: text('Periksa titik atau wilayah pencarian, lalu perluas radius. Periksa juga pesan status layanan yang ditampilkan. Aplikasi tidak membuat daftar fasilitas pengganti ketika layanan gagal.', 'Check the search point or region, then expand the radius. Also review any service status message. The application does not invent replacement facilities when the service fails.') },
        ],
      },
    ],
    action: { id: 'consultation', label: text('Buka konsultasi', 'Open consultations'), roles: ['orang_tua', 'nakes'] },
  },
  {
    id: 'panduan-nakes',
    title: text('Panduan tenaga kesehatan', 'Health professional guide'),
    description: text('Verifikasi akun, penugasan pasien, dan pendampingan.', 'Account verification, patient assignment, and ongoing support.'),
    audiences: ['nakes'],
    keywords: ['sip', 'verifikasi', 'klaim', 'pasien', 'prioritas', 'nakes', 'health professional', 'verification', 'patient'],
    sourceFiles: ['07_panduan_nakes_dan_admin.md'],
    sections: [
      {
        title: text('Verifikasi akun Nakes', 'Professional account verification'),
        paragraphs: [text('Akun Nakes yang mendaftar melalui formulir publik menunggu pemeriksaan SIP oleh Admin. Selama belum terverifikasi, fitur klaim pasien dinonaktifkan. Periksa status verifikasi pada dashboard; akun yang ditambahkan langsung oleh Admin dapat langsung berstatus terverifikasi.', 'Professional accounts created through public registration await administrator review of the SIP license. Patient claiming is disabled until verification. Check the verification status on your dashboard; accounts added directly by an administrator may already be verified.')],
      },
      {
        title: text('Mengklaim dan meninjau pasien', 'Claim and review patients'),
        steps: [
          text('Buka Dashboard Nakes dan pilih daftar orang tua yang belum ditugaskan.', 'Open the Professional Dashboard and select the list of unassigned parents.'),
          text('Cari nama orang tua, email, atau nama anak; tinjau data yang ditampilkan.', 'Search for a parent’s name, email, or child’s name and review the displayed records.'),
          text('Pilih / Layani Pasien untuk menetapkan pendampingan. Akun harus sudah terverifikasi.', 'Select Serve / Claim Patient to assign care. Your account must be verified.'),
          text('Buka Pasien Saya untuk meninjau anak dan hasil skrining pasien dampingan.', 'Open My Patients to review children and screening results for your assigned patients.'),
        ],
        note: text('Daftar pasien membantu menyorot hasil skrining yang perlu perhatian. Gunakan pemeriksaan dan pertimbangan profesional saat menentukan tindak lanjut.', 'The patient list highlights screening results that need attention. Use clinical assessment and professional judgment when determining follow-up.'),
      },
      {
        title: text('Mendampingi melalui konsultasi', 'Provide support through consultations'),
        steps: [
          text('Pilih Chat Orang Tua pada kartu pasien atau buka Konsultasi Pasien dari menu.', 'Select Chat with Parent on a patient card, or open Patient Consultation from the menu.'),
          text('Pilih pasien dampingan. Gunakan pencarian atau filter Belum Dibaca untuk meninjau pesan.', 'Select an assigned patient. Use search or the Unread filter to review messages.'),
          text('Kirim pesan teks atau pilih balasan cepat, lalu pastikan pesan muncul pada percakapan.', 'Send a text message or select a quick reply, then check that it appears in the conversation.'),
        ],
      },
    ],
    action: { id: 'dashboard', label: text('Buka Dashboard Nakes', 'Open Professional Dashboard'), roles: ['nakes'] },
  },
  {
    id: 'panduan-admin',
    title: text('Panduan administrator', 'Administrator guide'),
    description: text('Kelola verifikasi Nakes dan pantau aktivitas administratif.', 'Manage professional verification and review administrative activity.'),
    audiences: ['admin'],
    keywords: ['admin', 'administrator', 'sip', 'verifikasi', 'audit', 'log', 'tambah nakes', 'verification'],
    sourceFiles: ['07_panduan_nakes_dan_admin.md'],
    sections: [
      {
        title: text('Memeriksa dan memverifikasi Nakes', 'Review and verify professionals'),
        steps: [
          text('Masuk menggunakan akun Admin dan buka antrean verifikasi tenaga kesehatan.', 'Sign in with an administrator account and open the professional verification queue.'),
          text('Pilih akun untuk meninjau nama, nomor SIP, email, dan wilayah praktik.', 'Select an account to review the name, SIP license number, email, and practice region.'),
          text('Setelah pemeriksaan selesai, pilih Verifikasi Nakes untuk menyetujui akun.', 'Once the review is complete, select Verify Professional to approve the account.'),
          text('Tinjau status terbaru dan catatan tindakan pada riwayat aktivitas.', 'Review the updated status and the action recorded in the activity history.'),
        ],
      },
      {
        title: text('Menambahkan akun Nakes', 'Add a professional account'),
        steps: [
          text('Buka formulir Tambah Tenaga Kesehatan pada dashboard Admin.', 'Open Add Health Professional on the administrator dashboard.'),
          text('Isi nama, nomor SIP, email, kata sandi, dan wilayah praktik secara lengkap.', 'Complete the name, SIP license number, email, password, and practice region.'),
          text('Periksa data sebelum menyimpan. Akun yang dibuat langsung oleh Admin otomatis terverifikasi.', 'Check the details before saving. Accounts created directly by an administrator are automatically verified.'),
        ],
      },
      {
        title: text('Statistik dan riwayat aktivitas', 'Statistics and activity history'),
        paragraphs: [text('Dashboard menampilkan ringkasan pengguna dan anak terdaftar serta Nakes terverifikasi. Riwayat aktivitas mencatat tindakan administratif seperti penambahan dan verifikasi Nakes, beserta akun tujuan dan waktunya.', 'The dashboard summarizes registered users and children, and verified professionals. Activity history records administrative actions such as adding and verifying professionals, including the target account and timestamp.')],
        note: text('Bab ini menjelaskan alur penggunaan. Membaca panduan Admin tidak memberikan akses Admin; setiap tindakan tetap mengikuti hak akun yang sedang login.', 'This chapter explains the workflow. Reading the administrator guide does not grant administrator access; actions still follow the signed-in account’s permissions.'),
      },
    ],
    action: { id: 'dashboard', label: text('Buka Dashboard Admin', 'Open Administrator Dashboard'), roles: ['admin'] },
  },
  {
    id: 'privasi-dan-faq',
    title: text('Privasi dan pertanyaan umum', 'Privacy and common questions'),
    description: text('Pahami penggunaan data, batas layanan, dan kendala umum.', 'Understand data use, service boundaries, and common issues.'),
    audiences: ['all'],
    keywords: ['privasi', 'data', 'hapus akun', 'faq', 'masalah', 'error', 'tugas', 'coming soon', 'privacy', 'troubleshooting'],
    sourceFiles: ['08_privasi_ketentuan_dan_batasan_medis.md', '09_faq_dan_troubleshooting.md', 'rusdi-app.json'],
    sections: [
      {
        title: text('Data dan keamanan akun', 'Data and account security'),
        paragraphs: [text('KINDO menggunakan data akun, profil anak, catatan pertumbuhan, hasil skrining, dan pesan konsultasi untuk menyediakan fitur aplikasi. Akses data mengikuti autentikasi dan hak akun. Gunakan kata sandi yang hanya Anda ketahui, dan keluar saat memakai perangkat bersama.', 'KINDO uses account details, child profiles, growth records, screening results, and consultation messages to provide its features. Data access follows authentication and account permissions. Keep your password private and sign out when using a shared device.')],
        note: text('Baca Kebijakan Privasi dan Syarat & Ketentuan melalui tautan di bawah halaman ini untuk penjelasan lengkap dan informasi permintaan penghapusan data.', 'Read the Privacy Policy and Terms of Service using the links below for full details and information about requesting data deletion.'),
      },
      {
        title: text('Batas layanan', 'Service boundaries'),
        paragraphs: [text('Hasil KPSP, grafik, materi edukasi, dan analisis AI membantu pemantauan dan diskusi dengan tenaga kesehatan. KINDO dan Rusdi tidak menggantikan diagnosis atau pemeriksaan langsung. Fitur konsultasi ditujukan untuk komunikasi rutin; pada kondisi gawat darurat, cari pertolongan medis langsung.', 'KPSP results, charts, educational material, and AI analysis support tracking and discussions with a health professional. KINDO and Rusdi do not replace a diagnosis or in-person examination. Consultations are intended for routine communication; seek immediate medical help in an emergency.')],
      },
      {
        title: text('Pertanyaan yang sering muncul', 'Frequently asked questions'),
        questions: [
          { question: text('Apakah satu akun bisa memantau beberapa anak?', 'Can one account track several children?'), answer: text('Ya. Tambahkan profil dari menu Tambah Anak, lalu gunakan pemilih profil pada dashboard untuk berpindah anak.', 'Yes. Add profiles through Add Child, then use the dashboard profile picker to switch children.') },
          { question: text('Mengapa tombol kirim hasil skrining belum aktif?', 'Why is Submit Screening Results disabled?'), answer: text('Pastikan seluruh 10 pertanyaan telah dijawab. Gunakan Periksa untuk menemukan pertanyaan yang belum diisi.', 'Make sure all 10 questions have answers. Use Review to find unanswered questions.') },
          { question: text('Mengapa hasil belum ada di riwayat meskipun PDF sudah diunduh?', 'Why is the result missing from history after downloading the PDF?'), answer: text('Unduhan PDF tidak otomatis menyimpan hasil. Pada halaman hasil, tekan Simpan Hasil dan periksa status penyimpanannya.', 'Downloading a PDF does not automatically save the result. Select Save Result on the result page and check the save status.') },
          { question: text('Apakah Local Engine berarti skrining harus diulang?', 'Does Local Engine mean I need to repeat screening?'), answer: text('Lencana tersebut menjelaskan asal analisis berbasis aturan lokal saat AI tidak tersedia. Tinjau hasil yang tampil dan diskusikan tindak lanjut dengan Nakes.', 'The badge identifies local rule-based analysis used when AI is unavailable. Review the displayed result and discuss follow-up with a health professional.') },
          { question: text('Mengapa menu Tugas tidak bisa dibuka?', 'Why can’t I open Tasks?'), answer: text('Menu Tugas masih bertanda Coming Soon dan belum aktif. Panduan ini tidak menetapkan tanggal ketersediaannya.', 'Tasks is marked Coming Soon and is not active yet. This guide does not specify a release date.') },
          { question: text('Bagaimana jika gambar pertanyaan tidak muncul?', 'What if a question’s illustration does not load?'), answer: text('Baca teks petunjuk dan panduan observasi pengganti yang ditampilkan. Periksa koneksi jika ilustrasi tetap diperlukan untuk memahami pertanyaan.', 'Read the instructions and alternative observation guidance shown. Check your connection if you still need the illustration to understand the question.') },
        ],
      },
    ],
  },
];

export const GUIDE_AUDIENCES: { id: GuideAudience; label: GuideText }[] = [
  { id: 'all', label: text('Semua panduan', 'All guides') },
  { id: 'orang_tua', label: text('Orang Tua', 'Parents') },
  { id: 'nakes', label: text('Tenaga Kesehatan', 'Health Professionals') },
  { id: 'admin', label: text('Admin', 'Administrators') },
];

const normalizeSearch = (value: string) => value.normalize('NFKC').toLocaleLowerCase().replace(/\s+/g, ' ').trim();

// Index only visible copy and keywords, once per lazy-loaded guide bundle.
const searchIndex = GUIDE_CHAPTERS.map(chapter => {
  const copy = [chapter.title, chapter.description, ...chapter.sections.flatMap(section => [
    section.title,
    ...(section.paragraphs || []),
    ...(section.steps || []),
    ...(section.bullets || []),
    ...(section.note ? [section.note] : []),
    ...(section.questions || []).flatMap(faq => [faq.question, faq.answer]),
  ])];
  return { chapter, searchable: normalizeSearch([...chapter.keywords, ...copy.flatMap(value => [value.id, value.en])].join(' ')) };
});

export function filterGuideChapters(query: string, audience: GuideAudience): GuideChapter[] {
  const words = normalizeSearch(query).split(' ').filter(Boolean);
  return searchIndex.filter(({ chapter, searchable }) => {
    if (audience !== 'all' && !chapter.audiences.includes('all') && !chapter.audiences.includes(audience)) return false;
    return words.every(word => searchable.includes(word));
  }).map(({ chapter }) => chapter);
}
