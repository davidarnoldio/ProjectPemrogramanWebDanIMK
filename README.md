# UG ATTENDANCE — SISTEM INFORMASI PRESENSI KAMPUS QR DINAMIS (5 DETIK) & NOTIFIKASI WHATSAPP REAL-TIME

Aplikasi skala produksi **UG Attendance** untuk Universitas Gunadarma yang menghubungkan **Biro Administrasi Akademik (Admin)**, **Dosen Pengampu**, dan **Mahasiswa** secara cerdas, aman, dan berintegritas tinggi.

---

## 🏛️ Arsitektur & Prinsip Inti
1. **Presensi QR Code Dinamis (Rolling 5 Detik)**:
   - Dosen membuka sesi perkuliahan di proyektor kelas (`/lecturer/sessions/[id]`).
   - QR Code yang ditampilkan berotasi setiap **5 detik** dengan cryptographic token **HMAC-SHA256**.
   - Masa berlaku token di database adalah **7 detik** (toleransi latensi 2 detik).
   - Menghilangkan kecurangan *titip absen* via screenshot / foto grup chat WhatsApp.
2. **Notifikasi WhatsApp Otomatis ke Orang Tua**:
   - Sistem **tidak memerlukan portal login orang tua**.
   - Nomor WhatsApp orang tua wajib terdaftar dengan normalisasi format internasional `628xxxxxxxxxx`.
   - Begitu mahasiswa memindai QR di kelas, sistem backend Next.js secara *asynchronous* (non-blocking) mengirimkan pesan WhatsApp real-time ke orang tua mengonfirmasikan jam, mata kuliah, kelas, dan nama dosen.
3. **Fleksibilitas Plotting Jadwal & Reschedule**:
   - Admin BAAK memiliki kendali penuh CRUD Master Dosen, Mata Kuliah, Mahasiswa, dan Jadwal Perkuliahan (`classes`).
   - Dosen di kelas dapat membuka sesi sesuai jadwal atau menandainya sebagai sesi pengganti (*rescheduled*).
4. **Otomatisasi Akun Mahasiswa & Dosen**:
   - Penambahan dosen baru otomatis membuat akun `{nidn}@lecturer.ug.ac.id` dengan password `{nidn}`.
   - Penambahan mahasiswa baru otomatis membuat akun `{nim}@student.ug.ac.id` dengan password `{nim}`, meng-enroll KRS sesuai kelasnya, dan memicu flag `must_change_password`.

---

## 🛠️ Tech Stack
- **Web App**: Next.js 14 (App Router, Server Actions, Route Handlers, TypeScript, Tailwind CSS, Lucide Icons, `qrcode.react`).
- **Mobile App**: Flutter (`supabase_flutter`, `mobile_scanner`, `dio`, `intl`).
- **Database & Realtime**: Supabase (PostgreSQL, Supabase Realtime `postgres_changes`, Row Level Security).
- **WhatsApp Gateway**: Fonnte API (`https://api.fonnte.com/send`).

---

## 🚀 Panduan Menjalankan Aplikasi

### 1. Web Application (Next.js)
```bash
# Instal dependensi (sudah terinstal)
npm install

# Menjalankan server development
npm run dev

# Akses via browser:
# http://localhost:3000
```

### Kredensial Akses Cepat (Demo):
- **Admin BAAK**: Masuk ke `/admin/dashboard`
- **Dosen Pengampu**: Masuk ke `/lecturer/dashboard` atau langsung buka Proyektor QR Sesi 5 di `/lecturer/sessions/55555555-5555-5555-5555-555555555501`
- **Mahasiswa Demo**:
  - NIM: `10124001` (Ahmad Fauzi — 2KA01)
  - NIM: `10124002` (Nadya Putri Utami — 2KA01)

### 2. Mobile Application (Flutter)
Folder `mobile_app/` berisi aplikasi Flutter siap pakai:
```bash
cd mobile_app

# Mengambil dependensi
flutter pub get

# Menjalankan aplikasi di emulator / device / chrome
flutter run
```

### 3. Database Supabase & Data Dummy
File skema dan seed SQL lengkap tersedia di:
`supabase/schema_and_seed.sql`

Jalankan skrip SQL tersebut di **Supabase SQL Editor** Anda untuk mengaktifkan:
- Tabel `profiles`, `lecturers`, `students`, `courses`, `classes`, `course_enrollments`, `class_sessions`, `attendances`, `permissions`.
- Publikasi Supabase Realtime pada tabel `attendances` dan `class_sessions`.
- Data dummy 5 Dosen, 5 Mata Kuliah, 5 Jadwal Kelas, dan 3 Mahasiswa.

---

## 📋 Struktur Halaman Web & API Routes

### A. Web Routes:
- `/` : Landing Page & Quick Role Switcher
- `/login` : Portal Login Unified (Admin / Dosen / Mahasiswa)
- `/admin/dashboard` : Statistik Mahasiswa, Dosen, Sesi Aktif, & Plotting Kelas
- `/admin/schedules` : Full CRUD Jadwal Perkuliahan & Plotting Dosen
- `/admin/lecturers` : Full CRUD Master Dosen & Auto-Auth Login
- `/admin/students` : Full CRUD Mahasiswa, Normalisasi WA Orang Tua, & Auto-Enroll KRS
- `/admin/reports` : Cetak Rekapitulasi Presensi Format A4 Resmi ber-Kop Surat Gunadarma (`@media print`)
- `/lecturer/dashboard` : Jadwal Mengajar & Tombol Buka Sesi Presensi
- `/lecturer/sessions/[id]` : Kontrol Sesi & Layar Proyektor QR Dinamis 5 Detik + Live Attendee Feed + Koreksi Manual Kehadiran
- `/lecturer/permissions` : Verifikasi Surat Izin / Sakit Mahasiswa

### B. REST API Endpoints:
- `POST /api/qr/rotate` : Rotasi token HMAC-SHA256 setiap 5 detik dengan expiry 7 detik
- `POST /api/attendance/scan` : Validasi pemindaian QR mobile, pencegahan titip absen, dan *trigger* pesan WhatsApp real-time ke orang tua
- `GET/POST /api/admin/schedules` : CRUD Jadwal & Plotting
- `PUT/DELETE /api/admin/schedules/[id]` : Edit / Hapus Jadwal
- `GET/POST /api/admin/lecturers` : CRUD Dosen
- `GET/POST /api/admin/students` : CRUD Mahasiswa & Auto-create auth
- `GET/PUT/PATCH /api/lecturer/sessions/[id]` : Kontrol Sesi & Koreksi Manual Kehadiran
- `GET/POST /api/student/me` & `permissions` : Endpoint dashboard & permohonan izin aplikasi mobile
