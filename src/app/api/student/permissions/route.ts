import { NextResponse } from "next/server";
import { dbStore } from "@/lib/store";
import crypto from "crypto";

export async function GET() {
  const permissions = dbStore.permissions.map((p) => {
    const student = dbStore.students.find((s) => s.id === p.student_id);
    const session = dbStore.getEnrichedSession(p.session_id);
    return {
      ...p,
      students: student,
      class_sessions: session,
    };
  });

  return NextResponse.json(permissions);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { session_id, student_id, type, reason, attachment_url } = body;

    if (!session_id || !student_id || !type || !reason) {
      return NextResponse.json(
        { error: "Sesi, Mahasiswa, Tipe (IZIN/SAKIT), dan Alasan wajib diisi" },
        { status: 400 }
      );
    }

    const newPermission = {
      id: crypto.randomUUID(),
      session_id,
      student_id,
      type: type as "IZIN" | "SAKIT",
      reason,
      attachment_url: attachment_url || null,
      status: "PENDING" as const,
      created_at: new Date().toISOString(),
    };

    dbStore.permissions.unshift(newPermission);

    return NextResponse.json(
      { message: "Surat izin/sakit berhasil diajukan dan menunggu persetujuan dosen", data: newPermission },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Gagal mengajukan izin" }, { status: 500 });
  }
}

// Lecturer approval/rejection endpoint
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { permissionId, status } = body; // status: 'APPROVED' | 'REJECTED'

    const permIdx = dbStore.permissions.findIndex((p) => p.id === permissionId);
    if (permIdx === -1) {
      return NextResponse.json({ error: "Pengajuan tidak ditemukan" }, { status: 404 });
    }

    dbStore.permissions[permIdx].status = status;

    // If approved, also record in attendances with status IZIN or SAKIT
    if (status === "APPROVED") {
      const perm = dbStore.permissions[permIdx];
      const existingAtt = dbStore.attendances.find(
        (a) => a.session_id === perm.session_id && a.student_id === perm.student_id
      );

      if (existingAtt) {
        existingAtt.status = perm.type;
      } else {
        const student = dbStore.students.find((s) => s.id === perm.student_id);
        dbStore.attendances.unshift({
          id: crypto.randomUUID(),
          session_id: perm.session_id,
          student_id: perm.student_id,
          status: perm.type,
          scanned_at: new Date().toISOString(),
          students: student,
        });
      }
    }

    return NextResponse.json({
      message: `Pengajuan izin telah di-${status.toLowerCase()}`,
      data: dbStore.permissions[permIdx],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Gagal mengubah status izin" }, { status: 500 });
  }
}
