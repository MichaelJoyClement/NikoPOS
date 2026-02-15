# Nico POS & Inventory System

Sistem Manajemen Inventaris dan Point of Sale (POS) yang dibangun menggunakan NestJS (Backend) dan Next.js (Frontend).

## 🚀 Persiapan Awal (Prerequisites)

Pastikan perangkat Anda telah menginstal software berikut:

1.  **Node.js v18 atau v20**
    *   Unduh di [nodejs.org](https://nodejs.org/)
2.  **PostgreSQL**
    *   Unduh di [postgresql.org](https://www.postgresql.org/download/)
    *   Pastikan service PostgreSQL sudah berjalan (Running).
3.  **npm** (Bawaan dari instalasi Node.js)

---

## 🛠️ Struktur Project

-   `/backend`: API Server menggunakan NestJS dan Prisma ORM.
-   `/frontend`: Web Interface menggunakan Next.js dan Tailwind CSS.

---

## ⚙️ Langkah-Langkah Setup

### 1. Setup Database PostgreSQL

Ikuti perintah berikut untuk membuat database baru:

1.  Buka Terminal atau Command Prompt.
2.  Masuk ke PostgreSQL (gunakan user default `postgres`):
    ```bash
    psql -U postgres
    ```
3.  Jalankan perintah SQL berikut untuk membuat database:
    ```sql
    CREATE DATABASE nicopos;
    ```
4.  Ketik `\q` lalu tekan Enter untuk keluar dari psql.

### 2. Setup Backend (`/backend`)

1.  **Masuk ke direktori backend:**
    ```bash
    cd backend
    ```
2.  **Instalasi Library (Dependencies):**
    ```bash
    npm install
    ```
3.  **Konfigurasi Environment Variable:**
    Salin file `.env.example` menjadi `.env`:
    ```bash
    cp .env.example .env
    ```
4.  **Edit file `.env`:**
    Buka file `.env` di text editor dan ubah bagian `DATABASE_URL` dengan username dan password PostgreSQL Anda:
    ```env
    DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/nicopos?schema=public"
    ```
    *Ganti `USERNAME` dan `PASSWORD` sesuai dengan akun PostgreSQL Anda.*
5.  **Sinkronisasi Database (Prisma):**
    Jalankan perintah ini untuk membuat tabel ke dalam database `nicopos`:
    ```bash
    npx prisma migrate dev --name init
    npx prisma generate
    ```
6.  **Jalankan Server Backend:**
    ```bash
    npm run start:dev
    ```
    Backend akan berjalan otomatis di: `http://localhost:3001`

### 3. Setup Frontend (`/frontend`)

1.  **Buka terminal baru dan masuk ke direktori frontend:**
    ```bash
    cd frontend
    ```
2.  **Instalasi Library (Dependencies):**
    ```bash
    npm install
    ```
3.  **Jalankan Server Frontend:**
    ```bash
    npm run dev
    ```
    Buka browser dan akses aplikasi di: `http://localhost:3000`

---

## 📖 Ringkasan Perintah Penting

### Backend Commands
-   `npm run start:dev`: Menjalankan server backend (dengan fitur auto-reload).
-   `npx prisma studio`: Membuka tampilan web untuk melihat dan mengedit isi database secara langsung.
-   `npm run build`: Kompilasi project untuk tahap production.

### Frontend Commands
-   `npm run dev`: Menjalankan server frontend untuk tahap pengembangan.
-   `npm run build`: Membuat build aplikasi yang dioptimalkan untuk production.

---

## 💡 Troubleshooting

-   **Gagal Connect ke Database:** Periksa kembali `DATABASE_URL` di file `backend/.env`. Pastikan username, password, dan nama database (`nicopos`) sudah benar.
-   **Port Sudah Terpakai:** Pastikan port `3000` dan `3001` tidak sedang digunakan oleh aplikasi lain.
-   **Node Version:** Gunakan Node.js versi 18 ke atas untuk memastikan semua library kompatibel.
