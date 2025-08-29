Aplikasi Keuangan Cerdas
<p align="center">
<img src="https://placehold.co/150x150/7c3aed/ffffff?text=AKC" alt="Logo Aplikasi Keuangan Cerdas" style="border-radius: 50%;">
</p>

<p align="center">
<strong>Solusi modern untuk mengelola keuangan pribadi Anda dengan cerdas.</strong>
</p>

<p align="center">
<img src="https://img.shields.io/badge/Framework-Next.js_14-000000.svg?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js">
<img src="https://img.shields.io/badge/UI_Library-React-61DAFB.svg?style=for-the-badge&logo=react&logoColor=black" alt="React">
<img src="https://img.shields.io/badge/Language-TypeScript-3178C6.svg?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
<img src="https://img.shields.io/badge/Styling-Tailwind_CSS-38B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS">
<img src="https://img.shields.io/badge/Backend-Supabase-3FCF8E.svg?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase">
<img src="https://img.shields.io/badge/AI-Google_Gemini-4285F4.svg?style=for-the-badge&logo=google-gemini&logoColor=white" alt="Gemini">
</p>

📝 Deskripsi
Aplikasi Keuangan Cerdas (AKC) adalah sebuah platform manajemen keuangan pribadi yang dirancang untuk membantu Anda melacak pemasukan dan pengeluaran dengan mudah dan efisien. Dibangun dengan tumpukan teknologi modern, aplikasi ini tidak hanya menawarkan antarmuka yang bersih dan responsif tetapi juga ditenagai oleh kecerdasan buatan (AI) untuk mengkategorikan transaksi secara otomatis, memberikan Anda wawasan mendalam tentang kebiasaan finansial Anda.

✨ Fitur Utama
📊 Dasbor Interaktif: Visualisasikan ringkasan keuangan Anda dalam satu tampilan yang mudah dipahami.

💸 Pencatatan Transaksi: Catat pemasukan dan pengeluaran dengan cepat dan mudah.

🤖 Kategorisasi Otomatis (AI): Biarkan AI (ditenagai oleh Genkit dan Gemini) secara cerdas mengkategorikan setiap transaksi Anda untuk analisis yang lebih akurat.

📈 Laporan Keuangan: Dapatkan laporan periodik untuk memahami alur kas Anda.

🔒 Keamanan Data: Menggunakan Supabase sebagai backend, data Anda disimpan dengan aman.

📱 Desain Responsif: Akses dan kelola keuangan Anda dari perangkat apa pun, baik desktop maupun mobile.

🛠️ Teknologi yang Digunakan
Frontend:

Next.js - Framework React untuk aplikasi web modern.

React - Pustaka JavaScript untuk membangun antarmuka pengguna.

TypeScript - Menambahkan tipe statis pada JavaScript untuk skalabilitas.

Tailwind CSS - Framework CSS untuk desain yang cepat dan kustom.

Shadcn/ui - Komponen UI yang indah dan dapat diakses.

Backend & Database:

Supabase - Alternatif Firebase open-source untuk database, otentikasi, dan penyimpanan.

AI & Genkit:

Genkit - Framework open-source untuk membangun aplikasi yang ditenagai AI.

Google Gemini - Model AI yang digunakan untuk pemrosesan bahasa alami.

🚀 Cara Instalasi dan Menjalankan
Ikuti langkah-langkah di bawah ini untuk menjalankan proyek ini di lingkungan lokal Anda.

1. Prasyarat
Pastikan Anda telah menginstal perangkat lunak berikut:

Node.js (v18 atau lebih tinggi)

npm atau yarn

2. Kloning Repositori
git clone https://github.com/username/repository-anda.git
cd repository-anda

3. Instalasi Dependensi
Jalankan perintah berikut untuk menginstal semua paket yang dibutuhkan:

npm install

atau jika Anda menggunakan yarn:

yarn install

4. Konfigurasi Lingkungan
Aplikasi ini membutuhkan koneksi ke Supabase.

Salin file .env.example menjadi .env.local:

cp .env.example .env.local

Buka file .env.local dan isi dengan kredensial Supabase Anda. Anda bisa mendapatkannya dari dasbor proyek Supabase Anda (Settings > API).

NEXT_PUBLIC_SUPABASE_URL=URL_PROYEK_SUPABASE_ANDA
NEXT_PUBLIC_SUPABASE_ANON_KEY=KUNCI_ANON_PUBLIK_ANDA

5. Menjalankan Server Pengembangan
Setelah semua konfigurasi selesai, jalankan server pengembangan:

npm run dev

Buka http://localhost:3000 di peramban Anda untuk melihat aplikasi berjalan.

Terima kasih telah menggunakan Aplikasi Keuangan Cerdas! Jika Anda memiliki saran atau menemukan bug, jangan ragu untuk membuat issue atau pull request.
