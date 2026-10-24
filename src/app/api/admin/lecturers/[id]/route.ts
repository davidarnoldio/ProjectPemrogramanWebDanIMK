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
    const { nidn, name, department, email, phone } = body;

    // Supabase update
    try {
      await supabaseAdmin
        .from("lecturers")
        .update({ nidn, name, department, email, phone })
        .eq("id", id);
    } catch (e) {
      console.warn("Supabase update fallback:", e);
    }

    // In-memory update
    const idx = dbStore.lecturers.findIndex((l) => l.id === id);
    if (idx !== -1) {
      dbStore.lecturers[idx] = {
        ...dbStore.lecturers[idx],
        ...(nidn && { nidn }),
        ...(name && { name }),
        ...(department && { department }),
        ...(email && { email }),
        ...(phone !== undefined && { phone }),
      };
    }

    return NextResponse.json({
      message: "Data dosen berhasil diperbarui",
      data: dbStore.lecturers[idx],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Gagal mengupdate dosen" }, { status: 500 });
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
      await supabaseAdmin.from("lecturers").delete().eq("id", id);
    } catch (e) {
      console.warn("Supabase delete fallback:", e);
    }

    // In-memory delete
    dbStore.lecturers = dbStore.lecturers.filter((l) => l.id !== id);

    return NextResponse.json({ message: "Data dosen berhasil dihapus" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Gagal menghapus dosen" }, { status: 500 });
  }
}
