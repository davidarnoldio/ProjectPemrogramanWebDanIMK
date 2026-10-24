import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { dbStore } from "@/lib/store";
import crypto from "crypto";

const QR_SECRET_KEY = process.env.QR_SECRET_KEY || "ug_attendance_super_secret_dynamic_qr_key_2026";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID wajib dikirim" }, { status: 400 });
    }

    // 1. Generate unique cryptographic HMAC-SHA256 token
    const timestamp = Date.now();
    const randomSalt = crypto.randomBytes(16).toString("hex");
    const payload = `${sessionId}:${timestamp}:${randomSalt}`;
    
    const hmacToken = crypto
      .createHmac("sha256", QR_SECRET_KEY)
      .update(payload)
      .digest("hex");

    // 2. Token validity: 12 seconds (5s rotation + generous camera scan & network latency buffer)
    const expiresTimestamp = timestamp + 12000;
    const expiresAt = new Date(expiresTimestamp).toISOString();

    // 3. Register in rolling valid tokens store
    dbStore.addValidToken(sessionId, hmacToken, expiresTimestamp);

    // 4. Update class_sessions in Supabase
    try {
      await supabaseAdmin
        .from("class_sessions")
        .update({
          status: "OPEN",
          active_qr_token: hmacToken,
          token_expires_at: expiresAt,
        })
        .eq("id", sessionId);
    } catch (dbErr) {
      console.warn("Supabase session token update fallback:", dbErr);
    }

    // 5. Update in-memory store
    const sessionIdx = dbStore.sessions.findIndex((s) => s.id === sessionId);
    if (sessionIdx !== -1) {
      dbStore.sessions[sessionIdx].status = "OPEN";
      dbStore.sessions[sessionIdx].active_qr_token = hmacToken;
      dbStore.sessions[sessionIdx].token_expires_at = expiresAt;
    } else {
      // If session not found, create one or register it
      dbStore.sessions.push({
        id: sessionId,
        class_id: dbStore.classes[0]?.id || "default",
        meeting_number: 1,
        topic: "Perkuliahan Tatap Muka",
        status: "OPEN",
        active_qr_token: hmacToken,
        token_expires_at: expiresAt,
        started_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      sessionId,
      token: hmacToken,
      expiresAt,
      validitySeconds: 7,
      rotationIntervalSeconds: 5,
      timestamp,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Gagal merotasi token QR" },
      { status: 500 }
    );
  }
}
