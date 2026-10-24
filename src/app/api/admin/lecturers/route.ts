import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { dbStore } from "@/lib/store";
import crypto from "crypto";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("lecturers")
      .select("*")
      .order("name", { ascending: true });

    if (!error && data && data.length > 0) {
      return NextResponse.json(data);
    }
  } catch (e) {
    console.warn("Supabase query fallback:", e);
  }

  return NextResponse.json(dbStore.lecturers);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nidn, name, department, email, phone } = body;

    if (!nidn || !name || !department || !email) {
      return NextResponse.json(
        { error: "NIDN, Nama Lengkap, Program Studi, dan Email wajib diisi." },
        { status: 400 }
      );
    }

    // Check duplicate NIDN in store
    const existing = dbStore.lecturers.find((l) => l.nidn === nidn);
    if (existing) {
      return NextResponse.json(
        { error: `Dosen dengan NIDN ${nidn} sudah terdaftar.` },
        { status: 400 }
      );
    }

    const lecturerEmail = email || `${nidn}@lecturer.ug.ac.id`;
    let authUserId: string = crypto.randomUUID();

    // 1. Attempt Auto-create user in Supabase Auth
    try {
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: lecturerEmail,
        password: nidn, // default password is NIDN
        email_confirm: true,
        user_metadata: {
          name,
          role: "LECTURER",
          nidn,
        },
      });

      if (!authError && authData.user) {
        authUserId = authData.user.id;
        // Insert into profiles
        await (supabaseAdmin.from("profiles") as any).upsert({
          id: authUserId,
          name,
          role: "LECTURER",
          must_change_password: true,
        });
      }
    } catch (authErr) {
      console.warn("Supabase auth create user fallback:", authErr);
    }

    const newLecturer = {
      id: crypto.randomUUID(),
      profile_id: authUserId,
      nidn,
      name,
      department,
      email: lecturerEmail,
      phone: phone || null,
      created_at: new Date().toISOString(),
    };

    // 2. Insert into lecturers table
    try {
      await supabaseAdmin.from("lecturers").insert(newLecturer);
    } catch (dbErr) {
      console.warn("Supabase insert fallback:", dbErr);
    }

    // 3. Save to in-memory store
    dbStore.lecturers.unshift(newLecturer);

    return NextResponse.json(
      {
        message: "Dosen dan akun login berhasil dibuat",
        data: newLecturer,
        auth: {
          email: lecturerEmail,
          defaultPassword: nidn,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Gagal menambahkan data dosen" },
      { status: 500 }
    );
  }
}
