---
id: kindo-rag-index
title: Indeks Knowledge Base KINDO untuk Implementasi RAG Chatbot
category: meta
audience: [developer]
language: id
keywords: [rag, chatbot, knowledge base, chunking, metadata, embedding, system prompt, guardrail]
last_updated: 2026-11-27
---

# Indeks Knowledge Base KINDO (`app_knowledge/`)

Folder `app_knowledge/` berisi kumpulan dokumen Markdown terstruktur yang disusun khusus sebagai sumber pengetahuan (**Retrieval-Augmented Generation / RAG**) untuk fitur **Chatbot KINDO** (GrowthSync). Seluruh isi dokumen diekstrak secara akurat dari kode sumber dan dokumentasi resmi aplikasi KINDO.

## Daftar Dokumen

| No | File | Kategori (`category`) | Audiens (`audience`) | Cakupan Utama |
|---|---|---|---|---|
| 1 | `01_tentang_kindo.md` | `general` | `all`, `orang_tua`, `nakes`, `admin` | Profil KINDO, masalah yang diselesaikan, fitur utama, biaya gratis, bahasa (ID/EN), Dark/Light Mode, navigasi, tim UMS. |
| 2 | `02_panduan_akun_dan_peran_pengguna.md` | `account` | `all`, `orang_tua`, `nakes`, `admin` | Peran RBAC, langkah registrasi Orang Tua & Nakes, domisili Wilayah.id, login/logout, live presence, error autentikasi. |
| 3 | `03_panduan_profil_anak_dan_kurva_pertumbuhan.md` | `growth_tracking` | `orang_tua`, `nakes` | Onboarding anak 3 langkah, multi-profil (Child Switcher), kurva antropometri WHO, input/edit pengukuran, ekspor CSV. |
| 4 | `04_panduan_skrining_kpsp_dan_analisis_ai.md` | `kpsp_screening` | `orang_tua`, `nakes` | 16 usia KPSP (3–72 bln), 4 domain, daftar alat peraga lengkap, aturan pemilihan usia, skor 0–10, Gemini AI & Local Engine, simpan riwayat, ekspor PDF. |
| 5 | `05_panduan_edukasi_dan_stimulasi_tumbuh_kembang.md` | `education` | `orang_tua`, `nakes` | Fitur Edukasi 3 kategori, filter 4 aspek, aktivitas harian di rumah, protokol tindak lanjut Kemenkes, 6 tautan resmi (Buku KIA, IDAI, PrimaKu, WHO, UNICEF, Ayo Sehat). |
| 6 | `06_panduan_konsultasi_nakes_dan_puskesmas_finder.md` | `consultation_and_facilities` | `orang_tua`, `nakes` | Aturan rujukan resmi Telekonsultasi, quick questions, panggilan suara/video, deteksi lokasi Puskesmas Finder (GPS/IP/manual/default), navigasi rute Google Maps. |
| 7 | `07_panduan_nakes_dan_admin.md` | `role_guides` | `nakes`, `admin` | Panduan Nakes (verifikasi SIP, KPI, triage prioritas skor terendah, klaim pasien, Konsultasi Pasien) & Admin (verifikasi Nakes, tambah Nakes otomatis terverifikasi, audit logs). |
| 8 | `08_privasi_ketentuan_dan_batasan_medis.md` | `legal_and_safety` | `all`, `orang_tua`, `nakes`, `admin` | Kebijakan Privasi, Syarat & Ketentuan, keamanan Firebase Firestore, hak pengguna, Disclaimer Medis, eskalasi darurat 119/IGD. |
| 9 | `09_faq_dan_troubleshooting.md` | `faq_troubleshooting` | `all`, `orang_tua`, `nakes`, `admin` | Tanya-jawab umum dan solusi kendala teknis yang paling sering dialami pengguna. |

## Rekomendasi Teknis Implementasi RAG

### 1. Strategi Parsing & Chunking
- **Hapus atau parse YAML frontmatter** (`--- ... ---`) menjadi *chunk metadata* (`id`, `title`, `category`, `audience`, `keywords`).
- Gunakan **Markdown Header Splitter** berdasarkan heading `##` dan `###` terlebih dahulu, lalu lanjutkan dengan *recursive character splitting* berukuran **500–800 karakter** dengan **overlap 80–120 karakter** bila suatu subbagian terlalu panjang.
- Sisipkan judul dokumen (`# Title`) dan judul bagian (`## Section`) ke awal setiap chunk (contextual prefix) agar hasil embedding tetap akurat pada kueri singkat.

### 2. Metadata Filtering Berdasarkan Peran Pengguna
Karena KINDO memiliki 3 peran (`orang_tua`, `nakes`, `admin`), Anda dapat memfilter hasil pencarian vektor menggunakan field `audience`:
- Untuk pengguna belum login / umum: filter `audience` mengandung `"all"`.
- Untuk Orang Tua: filter `audience` mengandung `"orang_tua"` atau `"all"`.
- Untuk Nakes: filter `audience` mengandung `"nakes"` atau `"all"`.
- Untuk Admin: filter `audience` mengandung `"admin"` atau `"all"`.

### 3. Rekomendasi System Prompt Guardrail untuk Chatbot KINDO
Saat merakit *system prompt* Chatbot, pastikan LLM mematuhi aturan berikut:
1. **Grounding**: Jawab pertanyaan mengenai aplikasi KINDO berdasarkan potongan konteks dari `app_knowledge/`. Jika informasi tidak ada di konteks, sampaikan dengan jujur daripada mengarang fitur yang belum ada.
2. **Batasan Medis**: Selalu tegaskan bahwa KINDO dan Chatbot bersifat edukatif serta deteksi dini, **bukan pengganti diagnosis Dokter Spesialis Anak atau Tenaga Kesehatan**.
3. **Eskalasi Darurat**: Jika pengguna menyebutkan gejala gawat darurat pada balita (kejang, sesak napas, tidak sadar, demam tinggi ekstrem, dehidrasi berat, atau cedera serius), segera arahkan untuk menghubungi **119** atau pergi ke **IGD terdekat** sebelum memberikan informasi lain.
4. **Bahasa Respons**: Ikuti bahasa pengguna (Bahasa Indonesia atau Bahasa Inggris) dengan nada ramah, suportif, ringkas, dan jelas.
