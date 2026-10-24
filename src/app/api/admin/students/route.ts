import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { dbStore } from "@/lib/store";
import { normalizeWhatsAppNumber } from "@/lib/utils";
import crypto from "crypto";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("students")
      .select("*")
      .order("nim", { ascending: true });

    if (!error && data && data.length > 0) {
      return NextResponse.json(data);
    }
  } catch (e) {
    console.warn("Supabase query fallback:", e);
  }

  return NextResponse.json(dbStore.students);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nim, name, department, class_group, semester = 4, parent_phone } = body;

    if (!nim || !name || !department || !class_group || !parent_phone) {
      return NextResponse.json(
        { error: "NIM, Nama Lengkap, Jurusan, Kelas, dan Nomor WhatsApp Orang Tua wajib diisi." },
        { status: 400 }
      );
    }

    // Check duplicate NIM
    const existing = dbStore.students.find((s) => s.nim === nim);
    if (existing) {
      return NextResponse.json(
        { error: `Mahasiswa dengan NIM ${nim} sudah terdaftar.` },
        { status: 400 }
      );
    }

    // 1. Normalisasi Nomor WhatsApp Orang Tua ke 628xxxxxxxxxx
    const normalizedParentPhone = normalizeWhatsAppNumber(parent_phone);
    if (!normalizedParentPhone.startsWith("628") || normalizedParentPhone.length < 10) {
      return NextResponse.json(
        { error: "Nomor WhatsApp Orang Tua tidak valid. Harus diawali dengan format nomor Indonesia (contoh: 0812... atau 628...)." },
        { status: 400 }
      );
    }

    const studentEmail = `${nim}@student.ug.ac.id`;
    let authUserId: string = crypto.randomUUID();

    // 2. Auto-generate Akun di Supabase Auth
    try {
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: studentEmail,
        password: nim, // default password NIM
        email_confirm: true,
        user_metadata: {
          name,
          role: "STUDENT",
          nim,
          class_group,
        },
      });

      if (!authError && authData.user) {
        authUserId = authData.user.id;
        // 3. Simpan profile dengan must_change_password = true
        await supabaseAdmin.from("profiles").upsert({
          id: authUserId,
          name,
          role: "STUDENT",
          must_change_password: true,
        });
      }
    } catch (authErr) {
      console.warn("Supabase auth create user fallback:", authErr);
    }

    const newStudentId = crypto.randomUUID();
    const newStudent = {
      id: newStudentId,
      profile_id: authUserId,
      nim,
      name,
      department,
      class_group,
      semester: Number(semester) || 4,
      parent_phone: normalizedParentPhone,
      device_id: null,
      created_at: new Date().toISOString(),
    };

    // 4. Simpan ke database students
    try {
      await supabaseAdmin.from("students").insert(newStudent);
    } catch (dbErr) {
      console.warn("Supabase student insert fallback:", dbErr);
    }

    dbStore.students.unshift(newStudent);

    // 5. Otomatis daftarkan mahasiswa ke course_enrollments yang sesuai dengan class_group-nya
    const matchingClasses = dbStore.classes.filter(
      (c) => c.class_name.toLowerCase() === class_group.toLowerCase()
    );

    for (const cls of matchingClasses) {
      const enrollmentObj = {
        id: crypto.randomUUID(),
        class_id: cls.id,
        student_id: newStudentId,
      };
      dbStore.enrollments.push(enrollmentObj);

      try {
        await supabaseAdmin.from("course_enrollments").insert({
          class_id: cls.id,
          student_id: newStudentId,
        });
      } catch (e) {
        // ignore duplicate or connection
      }
    }

    return NextResponse.json(
      {
        message: "Mahasiswa berhasil ditambahkan dan di-enroll ke kelas",
        data: newStudent,
        auth: {
          email: studentEmail,
          defaultPassword: nim,
          mustChangePassword: true,
        },
        enrolledClassesCount: matchingClasses.length,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Gagal menambahkan mahasiswa" },
      { status: 500 }
    );
  }
}
