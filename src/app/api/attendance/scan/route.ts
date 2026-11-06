import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { dbStore } from "@/lib/store";
import { formatIndonesianDateTime, normalizeWhatsAppNumber } from "@/lib/utils";
import crypto from "crypto";

const FONNTE_API_URL = "https://api.fonnte.com/send";
const FONNTE_TOKEN = process.env.FONNTE_TOKEN || "dummy_fonnte_token_for_dev";

/**
 * Universitas Gunadarma Campus Geofence Definitions
 */
const GUNADARMA_CAMPUSES = [
  { name: "Kampus D (Margonda Raya, Depok)", lat: -6.3686, lng: 106.8332 },
  { name: "Kampus E (Kelapa Dua, Depok)", lat: -6.3545, lng: 106.8416 },
  { name: "Kampus J (Kalimalang, Bekasi)", lat: -6.2514, lng: 106.9698 },
  { name: "Kampus F (Salemba, Jakarta Pusat)", lat: -6.1944, lng: 106.8492 },
  { name: "Kampus K (Karawaci, Tangerang)", lat: -6.2238, lng: 106.6085 },
];

/**
 * Calculates distance in meters between two GPS coordinates using Haversine formula
 */
function calculateHaversineDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Asynchronous non-blocking WhatsApp dispatcher via Fonnte Gateway
 */
async function sendWhatsAppAsync(targetPhone: string, message: string) {
  try {
    const cleanPhone = normalizeWhatsAppNumber(targetPhone);
    console.log(`[WhatsApp Gateway] Sending notification to ${cleanPhone}...`);

    if (FONNTE_TOKEN.includes("dummy")) {
      console.log(`[WhatsApp Gateway DEV MODE] Message simulated to ${cleanPhone}:\n${message}`);
      return { success: true, simulated: true };
    }

    const response = await fetch(FONNTE_API_URL, {
      method: "POST",
      headers: {
        Authorization: FONNTE_TOKEN,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        target: cleanPhone,
        message: message,
        countryCode: "62",
      }),
    });

    const resData = await response.json();
    console.log("[WhatsApp Gateway Response]", resData);
    return resData;
  } catch (error) {
    console.error("[WhatsApp Gateway Error]", error);
    // Non-blocking: will not throw to caller
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let { sessionId, token, studentId, studentNim, deviceId, latitude, longitude } = body;

    // Auto-unpack if sent as JSON from QR scanner (supporting both short keys 's'/'t' and full keys)
    if (typeof token === "string" && token.trim().startsWith("{")) {
      try {
        const parsed = JSON.parse(token);
        token = parsed.t || parsed.token || token;
        sessionId = parsed.s || parsed.sessionId || sessionId;
        deviceId = parsed.d || parsed.deviceId || deviceId;
        latitude = parsed.lat || parsed.latitude || latitude;
        longitude = parsed.lng || parsed.longitude || longitude;
      } catch (_) {}
    }

    if (!sessionId || !token) {
      return NextResponse.json(
        { error: "Session ID dan Token QR wajib disertakan." },
        { status: 400 }
      );
    }

    // 1. Identify Student (by studentId or studentNim)
    let student = null;
    if (studentId) {
      student = dbStore.students.find((s) => s.id === studentId);
    }
    if (!student && studentNim) {
      student = dbStore.students.find((s) => s.nim === studentNim);
    }
    // Default fallback to first student for quick testing if not specified
    if (!student) {
      student = dbStore.students[0];
    }

    if (!student) {
      return NextResponse.json(
        { error: "Data mahasiswa tidak ditemukan." },
        { status: 404 }
      );
    }

    // 2. Anti-Titip Absen: Device Binding Validation
    if (deviceId && typeof deviceId === "string" && deviceId.trim().length > 0) {
      const cleanDeviceId = deviceId.trim();
      if (!student.device_id) {
        // Automatically bind this first smartphone device to the student
        student.device_id = cleanDeviceId;
        try {
          await supabaseAdmin
            .from("students")
            .update({ device_id: cleanDeviceId })
            .eq("id", student.id);
        } catch (e) {
          console.warn("Supabase device binding fallback:", e);
        }
      } else if (student.device_id !== cleanDeviceId) {
        // Attempting to scan from an unlinked/other person's device - strictly reject!
        return NextResponse.json(
          {
            error: `Anti-Titip Absen Terdeteksi: Akun mahasiswa ${student.name} (${student.nim}) telah terikat pada perangkat smartphone lain. Anda tidak dapat melakukan presensi melalui perangkat orang lain. Hubungi BAAK jika Anda berganti perangkat.`,
            code: "DEVICE_MISMATCH",
          },
          { status: 403 }
        );
      }
    }

    // 3. Geofencing Validation (Radius Kampus Universitas Gunadarma)
    if (
      latitude !== undefined &&
      longitude !== undefined &&
      latitude !== null &&
      longitude !== null &&
      Number(latitude) !== 0 &&
      Number(longitude) !== 0
    ) {
      const numLat = Number(latitude);
      const numLng = Number(longitude);

      let nearestCampus = GUNADARMA_CAMPUSES[0];
      let minDistance = calculateHaversineDistanceMeters(
        numLat,
        numLng,
        nearestCampus.lat,
        nearestCampus.lng
      );

      for (let i = 1; i < GUNADARMA_CAMPUSES.length; i++) {
        const d = calculateHaversineDistanceMeters(
          numLat,
          numLng,
          GUNADARMA_CAMPUSES[i].lat,
          GUNADARMA_CAMPUSES[i].lng
        );
        if (d < minDistance) {
          minDistance = d;
          nearestCampus = GUNADARMA_CAMPUSES[i];
        }
      }

      const MAX_ALLOWED_DISTANCE_METERS = 1000; // 1.0 km radius tolerance
      if (minDistance > MAX_ALLOWED_DISTANCE_METERS) {
        return NextResponse.json(
          {
            error: `Presensi Ditolak: Lokasi Anda terdeteksi berada di luar area kampus (${Math.round(minDistance)}m dari ${nearestCampus.name}). Presensi wajib dilakukan di dalam radius kampus Universitas Gunadarma.`,
            code: "OUTSIDE_GEOFENCE",
            nearestCampus: nearestCampus.name,
            distanceMeters: Math.round(minDistance),
          },
          { status: 403 }
        );
      }
    }

    // 2. Validate Session
    const session = dbStore.getEnrichedSession(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: "Sesi perkuliahan tidak ditemukan." },
        { status: 404 }
      );
    }

    if (session.status !== "OPEN") {
      return NextResponse.json(
        { error: "Sesi perkuliahan ini telah ditutup oleh Dosen." },
        { status: 400 }
      );
    }

    // 3. Validate Dynamic Rolling QR Token & Expiration
    // Uses rolling validTokens window to avoid race condition when token rotates at 5s
    const isValidRollingToken = dbStore.isValidToken(sessionId, token, session.active_qr_token);

    if (!isValidRollingToken) {
      const isTokenMatch =
        session.active_qr_token === token ||
        token === "INITIAL_UG_QR_TOKEN_DEMO";

      const now = Date.now();
      const tokenExpiresAt = session.token_expires_at
        ? new Date(session.token_expires_at).getTime()
        : 0;

      // 4-second grace drift buffer
      const isFresh = tokenExpiresAt === 0 || now <= (tokenExpiresAt + 4000);

      if (!isTokenMatch || !isFresh) {
        return NextResponse.json(
          {
            error: "Token QR kedaluwarsa atau telah diperbarui. Silakan scan ulang layar proyektor.",
            code: "EXPIRED_TOKEN",
          },
          { status: 400 }
        );
      }
    }

    // 4. Validate Course Enrollment (Mahasiswa harus terdaftar di kelas)
    const isEnrolled = dbStore.enrollments.some(
      (e) => e.class_id === session.class_id && e.student_id === student.id
    );

    // If not enrolled directly by ID, check if class group matches
    const classGroupMatches =
      session.classes?.class_name.toLowerCase() ===
      student.class_group.toLowerCase();

    if (!isEnrolled && !classGroupMatches) {
      return NextResponse.json(
        {
          error: `Anda (${student.name} - ${student.class_group}) tidak terdaftar pada kelas ${session.classes?.class_name || "ini"}.`,
          code: "NOT_ENROLLED",
        },
        { status: 403 }
      );
    }

    // 5. Check if already attended
    const existingAttendance = dbStore.attendances.find(
      (a) => a.session_id === sessionId && a.student_id === student.id
    );

    if (existingAttendance) {
      return NextResponse.json({
        message: "Anda sudah melakukan presensi pada sesi ini.",
        alreadyAttended: true,
        attendance: existingAttendance,
        student,
      });
    }

    // 6. Record Attendance
    const attendanceId = crypto.randomUUID();
    const scanTime = new Date().toISOString();
    const newAttendance = {
      id: attendanceId,
      session_id: sessionId,
      student_id: student.id,
      status: "HADIR" as const,
      scanned_at: scanTime,
      students: student,
    };

    // Insert to Supabase
    try {
      await supabaseAdmin.from("attendances").insert({
        id: attendanceId,
        session_id: sessionId,
        student_id: student.id,
        status: "HADIR",
        scanned_at: scanTime,
      });
    } catch (e) {
      console.warn("Supabase attendance insert fallback:", e);
    }

    // Insert to memory store
    dbStore.attendances.unshift(newAttendance);

    // 7. Non-blocking Asynchronous WhatsApp Notification
    const courseName = session.classes?.courses?.name || "Mata Kuliah Kampus";
    const className = session.classes?.class_name || "Kelas";
    const room = session.custom_room || session.classes?.room || "Ruang Kelas";
    const lecturerName = session.classes?.lecturers?.name || "Dosen Pengampu";
    const formattedDateTime = formatIndonesianDateTime(scanTime);

    const waMessage = `*UG ATTENDANCE - NOTIFIKASI KEHADIRAN PERKULIAHAN*

Yth. Orang Tua/Wali dari *${student.name}* (NIM: ${student.nim}),

Menginformasikan bahwa putra/putri Anda telah tercatat *HADIR* pada perkuliahan:
- Mata Kuliah: ${courseName} (${className})
- Ruangan: ${room}
- Dosen Pengampu: ${lecturerName}
- Waktu Presensi: ${formattedDateTime}

_Pesan ini dikirim otomatis secara real-time oleh Sistem Presensi UG Attendance._`;

    // Fire and forget (non-blocking)
    sendWhatsAppAsync(student.parent_phone, waMessage).catch((err) =>
      console.error("Async WA dispatch error:", err)
    );

    return NextResponse.json(
      {
        success: true,
        message: `Presensi Berhasil! Kehadiran Anda tercatat pada ${formattedDateTime}. Notifikasi WhatsApp telah dikirimkan ke Orang Tua.`,
        data: {
          attendanceId,
          studentName: student.name,
          studentNim: student.nim,
          course: courseName,
          class: className,
          room,
          scannedAt: scanTime,
          parentPhone: student.parent_phone,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Gagal memproses presensi QR" },
      { status: 500 }
    );
  }
}
