import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { dbStore } from "@/lib/store";
import { normalizeWhatsAppNumber } from "@/lib/utils";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { name, department, class_group, semester, parent_phone } = body;

    const normalizedParentPhone = parent_phone
      ? normalizeWhatsAppNumber(parent_phone)
      : undefined;

    // Supabase update
    try {
      await supabaseAdmin
        .from("students")
        .update({
          ...(name && { name }),
          ...(department && { department }),
          ...(class_group && { class_group }),
          ...(semester && { semester: Number(semester) }),
          ...(normalizedParentPhone && { parent_phone: normalizedParentPhone }),
        })
        .eq("id", id);
    } catch (e) {
      console.warn("Supabase update fallback:", e);
    }

    // In-memory update
    const idx = dbStore.students.findIndex((s) => s.id === id);
    if (idx !== -1) {
      dbStore.students[idx] = {
        ...dbStore.students[idx],
        ...(name && { name }),
        ...(department && { department }),
        ...(class_group && { class_group }),
        ...(semester && { semester: Number(semester) }),
        ...(normalizedParentPhone && { parent_phone: normalizedParentPhone }),
      };
    }

    return NextResponse.json({
      message: "Data mahasiswa berhasil diperbarui",
      data: dbStore.students[idx],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Gagal mengupdate mahasiswa" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Supabase delete
    try {
      await supabaseAdmin.from("students").delete().eq("id", id);
    } catch (e) {
      console.warn("Supabase delete fallback:", e);
    }

    // In-memory delete
    dbStore.students = dbStore.students.filter((s) => s.id !== id);
    dbStore.enrollments = dbStore.enrollments.filter((e) => e.student_id !== id);

    return NextResponse.json({ message: "Data mahasiswa berhasil dihapus" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Gagal menghapus mahasiswa" }, { status: 500 });
  }
}
