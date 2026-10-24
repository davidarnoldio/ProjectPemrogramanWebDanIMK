import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dummy-ug-project.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dummy_anon_key";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dummy_service_role_key";

/**
 * Standard public Supabase client (Client-side & public queries)
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Privileged Supabase Admin client using Service Role (Server-side API routes & Auth admin)
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/**
 * Types for UG Attendance Data Models
 */
export type UserRole = "ADMIN" | "LECTURER" | "STUDENT";
export type SessionStatus = "DRAFT" | "OPEN" | "CLOSED";
export type AttendanceStatus = "HADIR" | "IZIN" | "SAKIT" | "ALPA";
export type PermissionStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface Profile {
  id: string;
  name: string;
  role: UserRole;
  must_change_password: boolean;
  created_at?: string;
}

export interface Lecturer {
  id: string;
  profile_id?: string | null;
  nidn: string;
  name: string;
  department: string;
  email: string;
  phone?: string | null;
  created_at?: string;
}

export interface Student {
  id: string;
  profile_id?: string | null;
  nim: string;
  name: string;
  department: string;
  class_group: string;
  semester: number;
  parent_phone: string;
  device_id?: string | null;
  created_at?: string;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  sks: number;
  department: string;
  created_at?: string;
}

export interface ClassSchedule {
  id: string;
  course_id: string;
  lecturer_id: string;
  class_name: string;
  room: string;
  schedule_day: string;
  start_time: string;
  end_time: string;
  academic_year: string;
  created_at?: string;
  // Joined relations
  courses?: Course;
  lecturers?: Lecturer;
}

export interface ClassSession {
  id: string;
  class_id: string;
  meeting_number: number;
  topic?: string | null;
  custom_room?: string | null;
  is_rescheduled?: boolean;
  status: SessionStatus;
  active_qr_token?: string | null;
  token_expires_at?: string | null;
  started_at?: string | null;
  ended_at?: string | null;
  created_at?: string;
  // Joined relation
  classes?: ClassSchedule;
}

export interface Attendance {
  id: string;
  session_id: string;
  student_id: string;
  status: AttendanceStatus;
  scanned_at?: string;
  // Joined relations
  students?: Student;
}

export interface Permission {
  id: string;
  session_id: string;
  student_id: string;
  type: AttendanceStatus;
  reason: string;
  attachment_url?: string | null;
  status: PermissionStatus;
  created_at?: string;
  // Joined relations
  students?: Student;
  class_sessions?: ClassSession;
}
