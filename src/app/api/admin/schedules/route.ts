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

    // Check if bulk/batch upload (Array or { items: [...] })
    const items = Array.isArray(body)
      ? body
      : Array.isArray(body?.items)
      ? body.items
      : null;

    if (items) {
      if (items.length === 0) {
        return NextResponse.json({ error: "Daftar jadwal kosong." }, { status: 400 });
      }

      const createdList = [];

      for (const item of items) {
        let courseId = item.course_id;

        // Auto-match course by code or name if not provided directly
        if (!courseId && (item.course_code || item.course_name)) {
          const matchedCourse = dbStore.courses.find(
            (c) =>
              (item.course_code && c.code.toLowerCase() === item.course_code.toLowerCase()) ||
              (item.course_name && c.name.toLowerCase() === item.course_name.toLowerCase())
          );

          if (matchedCourse) {
            courseId = matchedCourse.id;
          } else {
            // Auto-create new course if not yet in master
            const newCourseId = crypto.randomUUID();
            const newCourse = {
              id: newCourseId,
              code: item.course_code || `MK-${Math.floor(1000 + Math.random() * 9000)}`,
              name: item.course_name || "Mata Kuliah Baru",
              sks: Number(item.sks) || 3,
              department: item.department || "Sistem Informasi",
            };
            dbStore.courses.push(newCourse);
            courseId = newCourseId;
          }
        }

        const lecturerId = item.lecturer_id;
        const className = item.class_name;
        const room = item.room;
        const scheduleDay = item.schedule_day;
        const startTime = item.start_time;
        const endTime = item.end_time;
        const academicYear = item.academic_year || "2026/2027 Ganjil";

        if (!courseId || !lecturerId || !className || !room || !scheduleDay || !startTime || !endTime) {
          continue; // Skip invalid rows
        }

        const newId = crypto.randomUUID();
        const newClass = {
          id: newId,
          course_id: courseId,
          lecturer_id: lecturerId,
          class_name: className,
          room: room,
          schedule_day: scheduleDay,
          start_time: startTime,
          end_time: endTime,
          academic_year: academicYear,
          created_at: new Date().toISOString(),
        };

        try {
          await supabaseAdmin.from("classes").insert(newClass);
        } catch (e) {
          console.warn("Supabase batch insert fallback:", e);
        }

        dbStore.addClassSchedule(newClass);
        const enriched = dbStore.getEnrichedClass(newId);
        if (enriched) createdList.push(enriched);
      }

      return NextResponse.json(
        {
          message: `${createdList.length} jadwal perkuliahan berhasil diunggah`,
          count: createdList.length,
          data: createdList,
        },
        { status: 201 }
      );
    }

    // Single schedule addition
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

    // Update in-memory store & auto-enroll matching students
    dbStore.addClassSchedule(newClass);
    const enriched = dbStore.getEnrichedClass(newId);

    return NextResponse.json(
      { message: "Jadwal perkuliahan berhasil ditambahkan", data: enriched },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Gagal membuat jadwal" }, { status: 500 });
  }
}
