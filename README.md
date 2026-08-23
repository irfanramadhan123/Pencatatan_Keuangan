# Uangku - Aplikasi Pencatatan Keuangan 💰

**Uangku** adalah aplikasi pelacakan finansial pribadi (personal financial tracker) berbasis *full-stack* yang dirancang untuk membantu pengguna mencatat, mengelola, dan menganalisis keuangan mereka secara mudah, terorganisir, dan aman. 

Aplikasi ini dilengkapi dengan visualisasi data grafik interaktif, manajemen anggaran, serta sistem keamanan modern berbasis JWT dan Google OAuth 2.0.

---

## 🚀 Fitur Utama

- 🔐 **Autentikasi Aman & Praktis**: Login sekali klik dengan Google Sign-In (OAuth 2.0) atau menggunakan akun standar berbasis JWT (JSON Web Tokens).
- 📊 **Visualisasi Data Interaktif**: Grafik statistik pendapatan dan pengeluaran menggunakan library **Recharts** untuk mempermudah pemantauan alur kas bulanan.
- 💸 **Manajemen Transaksi**: Catat pemasukan dan pengeluaran secara rinci beserta deskripsi, tanggal, kategori, dan sumber dana.
- 🎯 **Target Tabungan (Savings Target)**: Buat perencanaan target tabungan masa depan dan pantau progres pencapaian tabungan Anda secara berkala.
- 📂 **Manajemen Kategori & Sumber Dana**: Kustomisasi kategori transaksi dan kelola berbagai sumber dana Anda (seperti Dompet Fisik, Rekening Bank, atau E-Wallet).
- 📉 **Sistem Anggaran (Budgeting Limit)**: Tetapkan batas maksimal pengeluaran bulanan per kategori untuk membantu mengendalikan pengeluaran berlebih.
- 🌓 **Dukungan Mode Gelap**: Desain antarmuka premium yang mendukung transisi Mode Gelap (Dark Mode) dan Mode Terang (Light Mode) demi kenyamanan visual pengguna.

---

## 🛠️ Stack Teknologi

### Frontend (Client-side)
* **React.js (Vite)** – Pembuatan antarmuka web SPA (Single Page Application) yang cepat dan responsif.
* **Vanilla CSS** – Desain UI/UX buatan tangan yang bersih, adaptif (responsive layout), serta transisi mode gelap yang halus.
* **Recharts** – Peta dan visualisasi statistik interaktif.
* **Lucide React** – Library ikon modern berkualitas tinggi.

### Backend (Server-side)
* **Node.js & Express.js** – Server API yang andal dan terstruktur.
* **PostgreSQL** – Sistem manajemen database relasional yang kuat untuk menjaga integritas data finansial.
* **Google Auth Library** – Integrasi sistem masuk resmi Google OAuth 2.0.
* **JSON Web Token (JWT)** – Penanganan sesi login pengguna secara terenkripsi.

---

## 📂 Struktur Folder Proyek

```text
Pencatatan Keuangan/
├── backend/            # Aplikasi Server (Express API & Database Configuration)
│   ├── src/
│   │   ├── config/     # Database Connection & Configuration
│   │   ├── controllers/# Logic & Request Handlers (Authentication, Transactions, Dashboard)
│   │   ├── middleware/ # Auth & Security Middleware (JWT Validator)
│   │   └── routes/     # Endpoint Router
│   ├── migrate.js      # Script Migrasi Database PostgreSQL
│   └── seed.js         # Script Dummy Data Database
└── frontend/           # Aplikasi Client (React SPA)
    ├── src/
    │   ├── components/ # Reusable UI Components (Dashboard, Modals, Navbar)
    │   ├── pages/      # Halaman Utama (Dashboard, Login, Landing Page)
    │   ├── services/   # Axios API Connection Configuration
    │   └── styles/     # Styling System (CSS & Theme System)
    └── index.html      # Entrypoint HTML Utama
```

---

## ⚙️ Persyaratan Sistem (Local Development)

Sebelum menjalankan aplikasi di komputer lokal Anda, pastikan Anda telah memasang:
1. [Node.js](https://nodejs.org/) (Versi LTS direkomendasikan)
2. [PostgreSQL Server](https://www.postgresql.org/) aktif
3. Google Developer Account (untuk konfigurasi Client ID OAuth 2.0)
