import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { dbStore } from "@/lib/store";
import crypto from "crypto";

export async function GET() {
  try {
    // Attempt Supabase query
    const { data, error } = await supabaseAdmin
      .from("classes")
      .select("*, courses(*), lecturers(*)")
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      return NextResponse.json(data);
    }
  } catch (err) {
    console.warn("Supabase query fallback to memory store:", err);
  }

  // Fallback to in-memory store
  return NextResponse.json(dbStore.getEnrichedClasses());
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      course_id,
      lecturer_id,
      class_name,
      room,
      schedule_day,
      start_time,
      end_time,
      academic_year = "2026/2027 Ganjil",
    } = body;

    if (!course_id || !lecturer_id || !class_name || !room || !schedule_day || !start_time || !end_time) {
      return NextResponse.json(
        { error: "Semua field jadwal perkuliahan wajib diisi." },
        { status: 400 }
      );
    }

    const newId = crypto.randomUUID();
    const newClass = {
      id: newId,
      course_id,
      lecturer_id,
      class_name,
      room,
      schedule_day,
      start_time,
      end_time,
      academic_year,
      created_at: new Date().toISOString(),
    };

    // Try Supabase insert
    try {
      await supabaseAdmin.from("classes").insert(newClass);
    } catch (e) {
      console.warn("Supabase insert fallback:", e);
    }

    // Update in-memory store
    dbStore.classes.unshift(newClass);
    const enriched = dbStore.getEnrichedClass(newId);

    return NextResponse.json(
      { message: "Jadwal perkuliahan berhasil ditambahkan", data: enriched },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Gagal membuat jadwal" }, { status: 500 });
  }
}
