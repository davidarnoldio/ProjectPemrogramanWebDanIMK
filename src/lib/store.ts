import {
  Lecturer,
  Course,
  ClassSchedule,
  Student,
  ClassSession,
  Attendance,
  Permission,
} from "./supabase";

// In-Memory Seed Store matching supabase/schema_and_seed.sql
export const initialLecturers: Lecturer[] = [
  {
    id: "11111111-1111-1111-1111-111111111101",
    nidn: "0412088501",
    name: "Dr. Budi Santoso, S.Kom., M.M.S.I.",
    department: "Sistem Informasi",
    email: "budi.santoso@lecturer.ug.ac.id",
    phone: "6281210000001",
    created_at: new Date().toISOString(),
  },
  {
    id: "11111111-1111-1111-1111-111111111102",
    nidn: "0425039002",
    name: "Rina Wijaya, S.T., M.Kom.",
    department: "Sistem Informasi",
    email: "rina.wijaya@lecturer.ug.ac.id",
    phone: "6281210000002",
    created_at: new Date().toISOString(),
  },
  {
    id: "11111111-1111-1111-1111-111111111103",
    nidn: "0410118803",
    name: "Hendra Kusuma, S.Kom., M.T.I.",
    department: "Teknik Informatika",
    email: "hendra.kusuma@lecturer.ug.ac.id",
    phone: "6281210000003",
    created_at: new Date().toISOString(),
  },
  {
    id: "11111111-1111-1111-1111-111111111104",
    nidn: "0405079204",
    name: "Siti Aminah, S.Si., M.Kom.",
    department: "Sistem Informasi",
    email: "siti.aminah@lecturer.ug.ac.id",
    phone: "6281210000004",
    created_at: new Date().toISOString(),
  },
  {
    id: "11111111-1111-1111-1111-111111111105",
    nidn: "0419018705",
    name: "Arif Rahman Hakim, S.Kom., M.Sc.",
    department: "Teknik Informatika",
    email: "arif.hakim@lecturer.ug.ac.id",
    phone: "6281210000005",
    created_at: new Date().toISOString(),
  },
];

export const initialCourses: Course[] = [
  {
    id: "22222222-2222-2222-2222-222222222201",
    code: "AK045201",
    name: "Analisis & Perancangan Sistem Informasi",
    sks: 3,
    department: "Sistem Informasi",
  },
  {
    id: "22222222-2222-2222-2222-222222222202",
    code: "AK045202",
    name: "Pemrograman Web Berbasis Framework",
    sks: 3,
    department: "Sistem Informasi",
  },
  {
    id: "22222222-2222-2222-2222-222222222203",
    code: "AK045203",
    name: "Sistem Basis Data Lanjut",
    sks: 3,
    department: "Sistem Informasi",
  },
  {
    id: "22222222-2222-2222-2222-222222222204",
    code: "IT045301",
    name: "Pemrograman Perangkat Bergerak (Mobile)",
    sks: 3,
    department: "Teknik Informatika",
  },
  {
    id: "22222222-2222-2222-2222-222222222205",
    code: "AK045204",
    name: "Manajemen Proyek Sistem Informasi",
    sks: 2,
    department: "Sistem Informasi",
  },
];

export const initialClasses: ClassSchedule[] = [
  {
    id: "33333333-3333-3333-3333-333333333301",
    course_id: "22222222-2222-2222-2222-222222222201",
    lecturer_id: "11111111-1111-1111-1111-111111111101",
    class_name: "2KA01",
    room: "Ruang D401 - Kampus D",
    schedule_day: "Senin",
    start_time: "07:30",
    end_time: "10:00",
    academic_year: "2026/2027 Ganjil",
    created_at: new Date().toISOString(),
  },
  {
    id: "33333333-3333-3333-3333-333333333302",
    course_id: "22222222-2222-2222-2222-222222222202",
    lecturer_id: "11111111-1111-1111-1111-111111111102",
    class_name: "2KA01",
    room: "Lab Sistem Informasi E301",
    schedule_day: "Selasa",
    start_time: "10:30",
    end_time: "13:00",
    academic_year: "2026/2027 Ganjil",
    created_at: new Date().toISOString(),
  },
  {
    id: "33333333-3333-3333-3333-333333333303",
    course_id: "22222222-2222-2222-2222-222222222203",
    lecturer_id: "11111111-1111-1111-1111-111111111104",
    class_name: "2KA02",
    room: "Ruang E405 - Kampus E",
    schedule_day: "Rabu",
    start_time: "13:30",
    end_time: "16:00",
    academic_year: "2026/2027 Ganjil",
    created_at: new Date().toISOString(),
  },
  {
    id: "33333333-3333-3333-3333-333333333304",
    course_id: "22222222-2222-2222-2222-222222222204",
    lecturer_id: "11111111-1111-1111-1111-111111111103",
    class_name: "3IA01",
    room: "Lab Lanjut Mobile G202",
    schedule_day: "Kamis",
    start_time: "09:00",
    end_time: "11:30",
    academic_year: "2026/2027 Ganjil",
    created_at: new Date().toISOString(),
  },
  {
    id: "33333333-3333-3333-3333-333333333305",
    course_id: "22222222-2222-2222-2222-222222222205",
    lecturer_id: "11111111-1111-1111-1111-111111111105",
    class_name: "2KA01",
    room: "Ruang D308 - Kampus D",
    schedule_day: "Jumat",
    start_time: "08:30",
    end_time: "10:10",
    academic_year: "2026/2027 Ganjil",
    created_at: new Date().toISOString(),
  },
];

export const initialStudents: Student[] = [
  {
    id: "44444444-4444-4444-4444-444444444401",
    nim: "10124001",
    name: "Ahmad Fauzi",
    department: "Sistem Informasi",
    class_group: "2KA01",
    semester: 4,
    parent_phone: "6281299990001",
    created_at: new Date().toISOString(),
  },
  {
    id: "44444444-4444-4444-4444-444444444402",
    nim: "10124002",
    name: "Nadya Putri Utami",
    department: "Sistem Informasi",
    class_group: "2KA01",
    semester: 4,
    parent_phone: "6281299990002",
    created_at: new Date().toISOString(),
  },
  {
    id: "44444444-4444-4444-4444-444444444403",
    nim: "10124003",
    name: "Rizky Ramadhan",
    department: "Sistem Informasi",
    class_group: "2KA02",
    semester: 4,
    parent_phone: "6281299990003",
    created_at: new Date().toISOString(),
  },
];

export interface Enrollment {
  id: string;
  class_id: string;
  student_id: string;
}

export const initialEnrollments: Enrollment[] = [
  { id: "e1", class_id: "33333333-3333-3333-3333-333333333301", student_id: "44444444-4444-4444-4444-444444444401" },
  { id: "e2", class_id: "33333333-3333-3333-3333-333333333301", student_id: "44444444-4444-4444-4444-444444444402" },
  { id: "e3", class_id: "33333333-3333-3333-3333-333333333302", student_id: "44444444-4444-4444-4444-444444444401" },
  { id: "e4", class_id: "33333333-3333-3333-3333-333333333302", student_id: "44444444-4444-4444-4444-444444444402" },
  { id: "e5", class_id: "33333333-3333-3333-3333-333333333305", student_id: "44444444-4444-4444-4444-444444444401" },
];

export const initialSessions: ClassSession[] = [
  {
    id: "55555555-5555-5555-5555-555555555501",
    class_id: "33333333-3333-3333-3333-333333333302",
    meeting_number: 5,
    topic: "State Management & Supabase Realtime di Next.js",
    custom_room: "Lab Sistem Informasi E301",
    status: "OPEN",
    active_qr_token: "INITIAL_UG_QR_TOKEN_DEMO",
    token_expires_at: new Date(Date.now() + 3600 * 1000).toISOString(),
    started_at: new Date().toISOString(),
    is_rescheduled: false,
  },
  {
    id: "55555555-5555-5555-5555-555555555502",
    class_id: "33333333-3333-3333-3333-333333333301",
    meeting_number: 4,
    topic: "Analisis Kebutuhan Sistem & DFD Level 1",
    custom_room: "Ruang D401 - Kampus D",
    status: "CLOSED",
    active_qr_token: null,
    token_expires_at: null,
    started_at: new Date(Date.now() - 7 * 86400 * 1000).toISOString(),
    ended_at: new Date(Date.now() - 7 * 86400 * 1000 + 7200 * 1000).toISOString(),
    is_rescheduled: false,
  },
];

export const initialAttendances: Attendance[] = [
  {
    id: "att-1",
    session_id: "55555555-5555-5555-5555-555555555502",
    student_id: "44444444-4444-4444-4444-444444444401",
    status: "HADIR",
    scanned_at: new Date(Date.now() - 7 * 86400 * 1000).toISOString(),
  },
  {
    id: "att-2",
    session_id: "55555555-5555-5555-5555-555555555502",
    student_id: "44444444-4444-4444-4444-444444444402",
    status: "HADIR",
    scanned_at: new Date(Date.now() - 7 * 86400 * 1000).toISOString(),
  },
];

export const initialPermissions: Permission[] = [];

// Global In-Memory Singleton Store
class DatabaseStore {
  lecturers = [...initialLecturers];
  courses = [...initialCourses];
  classes = [...initialClasses];
  students = [...initialStudents];
  enrollments = [...initialEnrollments];
  sessions = [...initialSessions];
  attendances = [...initialAttendances];
  permissions = [...initialPermissions];

  // Helper to populate relations
  getEnrichedClasses(): ClassSchedule[] {
    return this.classes.map((cls) => {
      const course = this.courses.find((c) => c.id === cls.course_id);
      const lecturer = this.lecturers.find((l) => l.id === cls.lecturer_id);
      return {
        ...cls,
        courses: course,
        lecturers: lecturer,
      };
    });
  }

  getEnrichedClass(id: string): ClassSchedule | undefined {
    const cls = this.classes.find((c) => c.id === id);
    if (!cls) return undefined;
    const course = this.courses.find((c) => c.id === cls.course_id);
    const lecturer = this.lecturers.find((l) => l.id === cls.lecturer_id);
    return {
      ...cls,
      courses: course,
      lecturers: lecturer,
    };
  }

  getEnrichedSession(sessionId: string): ClassSession | undefined {
    const session = this.sessions.find((s) => s.id === sessionId);
    if (!session) return undefined;
    const cls = this.getEnrichedClass(session.class_id);
    return {
      ...session,
      classes: cls,
    };
  }

  getAttendancesForSession(sessionId: string): Attendance[] {
    return this.attendances
      .filter((a) => a.session_id === sessionId)
      .map((a) => {
        const student = this.students.find((s) => s.id === a.student_id);
        return {
          ...a,
          students: student,
        };
      });
  }

  getEnrolledStudents(classId: string): Student[] {
    const studentIds = this.enrollments
      .filter((e) => e.class_id === classId)
      .map((e) => e.student_id);
    return this.students.filter((s) => studentIds.includes(s.id));
  }

  // Rolling valid tokens cache: sessionId -> Map<token, expiresAtTimestamp>
  validTokens: Map<string, Map<string, number>> = new Map();

  addValidToken(sessionId: string, token: string, expiresAtMs: number) {
    if (!this.validTokens.has(sessionId)) {
      this.validTokens.set(sessionId, new Map());
    }
    const sessionMap = this.validTokens.get(sessionId)!;
    sessionMap.set(token, expiresAtMs);

    // Clean up tokens older than 30 seconds
    const now = Date.now();
    sessionMap.forEach((exp, t) => {
      if (now > exp + 30000) {
        sessionMap.delete(t);
      }
    });
  }

  isValidToken(sessionId: string, token: string, activeToken?: string | null): boolean {
    if (token === "INITIAL_UG_QR_TOKEN_DEMO") return true;
    if (activeToken && token === activeToken) return true;

    const sessionMap = this.validTokens.get(sessionId);
    if (!sessionMap) return false;

    const expiresAt = sessionMap.get(token);
    if (!expiresAt) return false;

    // Generous buffer: allow up to 4 seconds of network/clock drift tolerance
    return Date.now() <= expiresAt + 4000;
  }
}

// Ensure singleton across Next.js dev reloads
declare global {
  // eslint-disable-next-line no-var
  var __ug_db_store: DatabaseStore | undefined;
}

if (!global.__ug_db_store || typeof (global.__ug_db_store as any).isValidToken !== "function") {
  global.__ug_db_store = new DatabaseStore();
}

export const dbStore = global.__ug_db_store;
