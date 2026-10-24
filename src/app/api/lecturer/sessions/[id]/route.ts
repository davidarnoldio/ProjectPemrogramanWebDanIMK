import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { dbStore } from "@/lib/store";
import crypto from "crypto";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const session = dbStore.getEnrichedSession(id);

  if (!session) {
    return NextResponse.json({ error: "Sesi tidak ditemukan" }, { status: 404 });
  }

  const attendances = dbStore.getAttendancesForSession(id);
  const enrolledStudents = dbStore.getEnrolledStudents(session.class_id);

  return NextResponse.json({
    session,
    attendances,
    enrolledStudents,
    stats: {
      totalEnrolled: enrolledStudents.length,
      totalPresent: attendances.filter((a) => a.status === "HADIR").length,
      totalPermission: attendances.filter((a) => a.status === "IZIN").length,
      totalSick: attendances.filter((a) => a.status === "SAKIT").length,
      totalAbsent: attendances.filter((a) => a.status === "ALPA").length,
    },
  });
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { status, topic, custom_room } = body;

    const idx = dbStore.sessions.findIndex((s) => s.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: "Sesi tidak ditemukan" }, { status: 404 });
    }

    if (status) dbStore.sessions[idx].status = status;
    if (topic) dbStore.sessions[idx].topic = topic;
    if (custom_room !== undefined) dbStore.sessions[idx].custom_room = custom_room;
    if (status === "CLOSED") {
      dbStore.sessions[idx].ended_at = new Date().toISOString();
      dbStore.sessions[idx].active_qr_token = null;
    }

    try {
      await supabaseAdmin
        .from("class_sessions")
        .update({
          ...(status && { status }),
          ...(topic && { topic }),
          ...(custom_room !== undefined && { custom_room }),
          ...(status === "CLOSED" && {
            ended_at: new Date().toISOString(),
            active_qr_token: null,
          }),
        })
        .eq("id", id);
    } catch (e) {
      console.warn("Supabase session update fallback:", e);
    }

    return NextResponse.json({
      message: "Sesi berhasil diperbarui",
      data: dbStore.getEnrichedSession(id),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Gagal mengupdate sesi" }, { status: 500 });
  }
}

// Manual attendance correction by Lecturer
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id: sessionId } = params;
    const body = await req.json();
    const { studentId, status } = body; // status: 'HADIR' | 'IZIN' | 'SAKIT' | 'ALPA'

    if (!studentId || !status) {
      return NextResponse.json(
        { error: "Student ID dan Status presensi wajib dikirim" },
        { status: 400 }
      );
    }

    const student = dbStore.students.find((s) => s.id === studentId);
    if (!student) {
      return NextResponse.json({ error: "Mahasiswa tidak ditemukan" }, { status: 404 });
    }

    const existingIdx = dbStore.attendances.findIndex(
      (a) => a.session_id === sessionId && a.student_id === studentId
    );

    if (existingIdx !== -1) {
      dbStore.attendances[existingIdx].status = status;
      try {
        await supabaseAdmin
          .from("attendances")
          .update({ status })
          .eq("session_id", sessionId)
          .eq("student_id", studentId);
      } catch (e) {
        console.warn("Supabase attendance update fallback:", e);
      }
    } else {
      const newAtt = {
        id: crypto.randomUUID(),
        session_id: sessionId,
        student_id: studentId,
        status,
        scanned_at: new Date().toISOString(),
        students: student,
      };
      dbStore.attendances.unshift(newAtt);
      try {
        await supabaseAdmin.from("attendances").insert({
          id: newAtt.id,
          session_id: sessionId,
          student_id: studentId,
          status,
          scanned_at: newAtt.scanned_at,
        });
      } catch (e) {
        console.warn("Supabase attendance insert fallback:", e);
      }
    }

    return NextResponse.json({
      message: `Status presensi untuk ${student.name} berhasil diperbarui menjadi ${status}`,
      attendances: dbStore.getAttendancesForSession(sessionId),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Gagal mengubah status presensi" }, { status: 500 });
  }
}
