import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { dbStore } from "@/lib/store";
import crypto from "crypto";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const lecturerId = url.searchParams.get("lecturerId");

  let sessions = dbStore.sessions
    .map((s) => dbStore.getEnrichedSession(s.id))
    .filter(Boolean) as any[];

  if (lecturerId) {
    sessions = sessions.filter(
      (s) => s.classes?.lecturer_id === lecturerId
    );
  }

  return NextResponse.json(sessions);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { class_id, meeting_number, topic, custom_room, is_rescheduled } = body;

    if (!class_id || !meeting_number) {
      return NextResponse.json(
        { error: "Kelas dan Nomor Pertemuan wajib diisi" },
        { status: 400 }
      );
    }

    const newId = crypto.randomUUID();
    const newSession = {
      id: newId,
      class_id,
      meeting_number: Number(meeting_number),
      topic: topic || `Pertemuan ke-${meeting_number}`,
      custom_room: custom_room || null,
      is_rescheduled: Boolean(is_rescheduled),
      status: "OPEN" as const,
      active_qr_token: "INITIAL_UG_TOKEN_" + Math.random().toString(36).substring(2, 9),
      token_expires_at: new Date(Date.now() + 7000).toISOString(),
      started_at: new Date().toISOString(),
      ended_at: null,
      created_at: new Date().toISOString(),
    };

    try {
      await supabaseAdmin.from("class_sessions").insert(newSession);
    } catch (e) {
      console.warn("Supabase session insert fallback:", e);
    }

    dbStore.sessions.unshift(newSession);
    const enriched = dbStore.getEnrichedSession(newId);

    return NextResponse.json(
      { message: "Sesi perkuliahan berhasil dibuka", data: enriched },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Gagal membuat sesi" }, { status: 500 });
  }
}
