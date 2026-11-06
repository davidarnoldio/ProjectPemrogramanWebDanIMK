-- ============================================================================
-- UG ATTENDANCE — SISTEM INFORMASI PRESENSI KAMPUS QR DINAMIS (5 DETIK)
-- DATABASE SCHEMA & SEED DATA (SUPABASE / POSTGRESQL)
-- ============================================================================

-- Clean up existing tables if resetting
DROP TABLE IF EXISTS permissions CASCADE;
DROP TABLE IF EXISTS attendances CASCADE;
DROP TABLE IF EXISTS class_sessions CASCADE;
DROP TABLE IF EXISTS course_enrollments CASCADE;
DROP TABLE IF EXISTS classes CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS lecturers CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

DROP TYPE IF EXISTS permission_status CASCADE;
DROP TYPE IF EXISTS attendance_status CASCADE;
DROP TYPE IF EXISTS session_status CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- ENUMS
CREATE TYPE user_role AS ENUM ('ADMIN', 'LECTURER', 'STUDENT');
CREATE TYPE session_status AS ENUM ('DRAFT', 'OPEN', 'CLOSED');
CREATE TYPE attendance_status AS ENUM ('HADIR', 'IZIN', 'SAKIT', 'ALPA');
CREATE TYPE permission_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- 1. PROFILES (Extends Supabase auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role user_role NOT NULL,
    must_change_password BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. LECTURERS (Data Dosen)
CREATE TABLE lecturers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID UNIQUE REFERENCES profiles(id) ON DELETE SET NULL,
    nidn TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    department TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. STUDENTS (Data Mahasiswa)
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID UNIQUE REFERENCES profiles(id) ON DELETE SET NULL,
    nim TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    department TEXT NOT NULL,
    class_group TEXT NOT NULL, -- Contoh: 2KA01
    semester INT NOT NULL DEFAULT 4,
    parent_phone TEXT NOT NULL, -- Wajib format 628xxxxxxxxxx
    device_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. COURSES (Mata Kuliah)
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    sks INT NOT NULL,
    department TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CLASSES / SCHEDULES (Jadwal Perkuliahan & Plotting Dosen - Diatur oleh Admin)
CREATE TABLE classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    lecturer_id UUID NOT NULL REFERENCES lecturers(id) ON DELETE CASCADE,
    class_name TEXT NOT NULL, -- Contoh: 2KA01, 2KA02, 3IA01
    room TEXT NOT NULL, -- Contoh: E402, Lab Sistem Informasi
    schedule_day TEXT NOT NULL, -- Senin, Selasa, Rabu, Kamis, Jumat, Sabtu
    start_time TEXT NOT NULL, -- Contoh: 08:00
    end_time TEXT NOT NULL, -- Contoh: 10:30
    academic_year TEXT NOT NULL DEFAULT '2026/2027 Ganjil',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. COURSE ENROLLMENTS (KRS Mahasiswa)
CREATE TABLE course_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(class_id, student_id)
);

-- 7. CLASS SESSIONS (Sesi Pertemuan & Rolling Token 5 Detik)
CREATE TABLE class_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    meeting_number INT NOT NULL,
    topic TEXT,
    custom_room TEXT,
    is_rescheduled BOOLEAN DEFAULT FALSE,
    status session_status DEFAULT 'DRAFT',
    active_qr_token TEXT,
    token_expires_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ATTENDANCES (Data Presensi)
CREATE TABLE attendances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES class_sessions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    status attendance_status DEFAULT 'HADIR',
    scanned_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(session_id, student_id)
);

-- 9. PERMISSIONS (Pengajuan Surat Izin/Sakit)
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES class_sessions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    type attendance_status NOT NULL,
    reason TEXT NOT NULL,
    attachment_url TEXT,
    status permission_status DEFAULT 'PENDING',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) but allow service_role and authenticated users to access
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE lecturers ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendances ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;

-- Allow public read & service_role full access (for development/production API service client)
CREATE POLICY "Public Read Profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Service Role Profiles" ON profiles FOR ALL USING (true);

CREATE POLICY "Public Read Lecturers" ON lecturers FOR SELECT USING (true);
CREATE POLICY "Service Role Lecturers" ON lecturers FOR ALL USING (true);

CREATE POLICY "Public Read Students" ON students FOR SELECT USING (true);
CREATE POLICY "Service Role Students" ON students FOR ALL USING (true);

CREATE POLICY "Public Read Courses" ON courses FOR SELECT USING (true);
CREATE POLICY "Service Role Courses" ON courses FOR ALL USING (true);

CREATE POLICY "Public Read Classes" ON classes FOR SELECT USING (true);
CREATE POLICY "Service Role Classes" ON classes FOR ALL USING (true);

CREATE POLICY "Public Read Enrollments" ON course_enrollments FOR SELECT USING (true);
CREATE POLICY "Service Role Enrollments" ON course_enrollments FOR ALL USING (true);

CREATE POLICY "Public Read Sessions" ON class_sessions FOR SELECT USING (true);
CREATE POLICY "Service Role Sessions" ON class_sessions FOR ALL USING (true);

CREATE POLICY "Public Read Attendances" ON attendances FOR SELECT USING (true);
CREATE POLICY "Service Role Attendances" ON attendances FOR ALL USING (true);

CREATE POLICY "Public Read Permissions" ON permissions FOR SELECT USING (true);
CREATE POLICY "Service Role Permissions" ON permissions FOR ALL USING (true);

-- Aktifkan Supabase Realtime untuk Live Feed Presensi
ALTER PUBLICATION supabase_realtime ADD TABLE attendances;
ALTER PUBLICATION supabase_realtime ADD TABLE class_sessions;

-- ============================================================================
-- DUMMY SEED DATA (DOSEN, MATA KULIAH, JADWAL MENGAJAR, & MAHASISWA)
-- ============================================================================

-- 1. Dummy Dosen
INSERT INTO lecturers (id, nidn, name, department, email, phone) VALUES
('11111111-1111-1111-1111-111111111101', '0412088501', 'Dr. Budi Santoso, S.Kom., M.M.S.I.', 'Sistem Informasi', 'budi.santoso@dosenkampus.com', '6281210000001'),
('11111111-1111-1111-1111-111111111102', '0425039002', 'Rina Wijaya, S.T., M.Kom.', 'Sistem Informasi', 'rina.wijaya@dosenkampus.com', '6281210000002'),
('11111111-1111-1111-1111-111111111103', '0410118803', 'Hendra Kusuma, S.Kom., M.T.I.', 'Teknik Informatika', 'hendra.kusuma@dosenkampus.com', '6281210000003'),
('11111111-1111-1111-1111-111111111104', '0405079204', 'Siti Aminah, S.Si., M.Kom.', 'Sistem Informasi', 'siti.aminah@dosenkampus.com', '6281210000004'),
('11111111-1111-1111-1111-111111111105', '0419018705', 'Arif Rahman Hakim, S.Kom., M.Sc.', 'Teknik Informatika', 'arif.hakim@dosenkampus.com', '6281210000005');

-- 2. Dummy Mata Kuliah
INSERT INTO courses (id, code, name, sks, department) VALUES
('22222222-2222-2222-2222-222222222201', 'AK045201', 'Analisis & Perancangan Sistem Informasi', 3, 'Sistem Informasi'),
('22222222-2222-2222-2222-222222222202', 'AK045202', 'Pemrograman Web Berbasis Framework', 3, 'Sistem Informasi'),
('22222222-2222-2222-2222-222222222203', 'AK045203', 'Sistem Basis Data Lanjut', 3, 'Sistem Informasi'),
('22222222-2222-2222-2222-222222222204', 'IT045301', 'Pemrograman Perangkat Bergerak (Mobile)', 3, 'Teknik Informatika'),
('22222222-2222-2222-2222-222222222205', 'AK045204', 'Manajemen Proyek Sistem Informasi', 2, 'Sistem Informasi');

-- 3. Dummy Mahasiswa
INSERT INTO students (id, nim, name, department, class_group, semester, parent_phone) VALUES
('44444444-4444-4444-4444-444444444401', '10124001', 'Ahmad Fauzi', 'Sistem Informasi', '2KA01', 4, '6281299990001'),
('44444444-4444-4444-4444-444444444402', '10124002', 'Nadya Putri Utami', 'Sistem Informasi', '2KA01', 4, '6281299990002'),
('44444444-4444-4444-4444-444444444403', '10124003', 'Rizky Ramadhan', 'Sistem Informasi', '2KA02', 4, '6281299990003');

-- 4. JADWAL MENGAJAR (CLASSES) - DIKOSONGKAN
-- Data dummy jadwal mengajar perkuliahan dikosongkan agar dosen dapat mengunggah (upload) 
-- atau menginput jadwal secara manual melalui Portal Dosen.
-- INSERT INTO classes ... (Dikosongkan)
-- INSERT INTO course_enrollments ... (Dikosongkan)
-- INSERT INTO class_sessions ... (Dikosongkan)
-- INSERT INTO attendances ... (Dikosongkan)
