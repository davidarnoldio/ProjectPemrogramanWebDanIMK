import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { dbStore } from "@/lib/store";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const {
      course_id,
      lecturer_id,
      class_name,
      room,
      schedule_day,
      start_time,
      end_time,
      academic_year,
    } = body;

    // Supabase update
    try {
      await supabaseAdmin
        .from("classes")
        .update({
          course_id,
          lecturer_id,
          class_name,
          room,
          schedule_day,
          start_time,
          end_time,
          academic_year,
        })
        .eq("id", id);
    } catch (e) {
      console.warn("Supabase update fallback:", e);
    }

    // In-memory update
    const index = dbStore.classes.findIndex((c) => c.id === id);
    if (index !== -1) {
      dbStore.classes[index] = {
        ...dbStore.classes[index],
        ...(course_id && { course_id }),
        ...(lecturer_id && { lecturer_id }),
        ...(class_name && { class_name }),
        ...(room && { room }),
        ...(schedule_day && { schedule_day }),
        ...(start_time && { start_time }),
        ...(end_time && { end_time }),
        ...(academic_year && { academic_year }),
      };
    }

    const updated = dbStore.getEnrichedClass(id);
    return NextResponse.json({
      message: "Jadwal perkuliahan berhasil diperbarui",
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Gagal mengupdate jadwal" }, { status: 500 });
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
      await supabaseAdmin.from("classes").delete().eq("id", id);
    } catch (e) {
      console.warn("Supabase delete fallback:", e);
    }

    // In-memory delete
    dbStore.classes = dbStore.classes.filter((c) => c.id !== id);

    return NextResponse.json({ message: "Jadwal perkuliahan berhasil dihapus" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Gagal menghapus jadwal" }, { status: 500 });
  }
}
