import { NextResponse } from "next/server";
import { dbStore } from "@/lib/store";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const nim = url.searchParams.get("nim") || "10124001"; // Default to Ahmad Fauzi

  const student = dbStore.students.find((s) => s.nim === nim);
  if (!student) {
    return NextResponse.json({ error: "Mahasiswa tidak ditemukan" }, { status: 404 });
  }

  // Find enrolled class IDs
  const enrolledClassIds = dbStore.enrollments
    .filter((e) => e.student_id === student.id)
    .map((e) => e.class_id);

  // Get enrolled class schedules with course and lecturer info
  const schedules = dbStore.classes
    .filter((c) => enrolledClassIds.includes(c.id) || c.class_name === student.class_group)
    .map((c) => dbStore.getEnrichedClass(c.id)!);

  // Get sessions for these classes
  const classIds = schedules.map((s) => s.id);
  const sessions = dbStore.sessions
    .filter((sess) => classIds.includes(sess.class_id))
    .map((sess) => dbStore.getEnrichedSession(sess.id)!);

  // Get student attendances
  const attendances = dbStore.attendances.filter((a) => a.student_id === student.id);

  // Attendance stats
  const totalCompletedSessions = sessions.filter((s) => s.status === "CLOSED").length || 1;
  const presentCount = attendances.filter((a) => a.status === "HADIR").length;
  const attendanceRate = Math.round((presentCount / Math.max(totalCompletedSessions, 1)) * 100);

  // Open sessions available right now for scanning
  const activeSessions = sessions.filter((s) => s.status === "OPEN");

  return NextResponse.json({
    student,
    schedules,
    sessions,
    attendances,
    activeSessions,
    stats: {
      totalCourses: schedules.length,
      totalPresent: presentCount,
      attendanceRate: Math.min(attendanceRate, 100),
    },
  });
}
