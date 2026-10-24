"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";
import {
  RotateCcw,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  Radio,
  AlertTriangle,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { formatIndonesianTime } from "@/lib/utils";

interface DynamicQRProjectorProps {
  sessionId: string;
  initialToken?: string;
  courseName: string;
  className: string;
  roomName: string;
  meetingNumber: number;
  totalEnrolled: number;
  onAttendanceScanned?: (newAttendance: any) => void;
}

export default function DynamicQRProjector({
  sessionId,
  initialToken = "INITIAL_UG_QR_TOKEN_DEMO",
  courseName,
  className: classGroup,
  roomName,
  meetingNumber,
  totalEnrolled,
  onAttendanceScanned,
}: DynamicQRProjectorProps) {
  const [token, setToken] = useState<string>(initialToken);
  const [expiresAt, setExpiresAt] = useState<string>("");
  const [countdown, setCountdown] = useState<number>(5.0);
  const [isRotating, setIsRotating] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [liveAttendances, setLiveAttendances] = useState<any[]>([]);
  const [rotationCount, setRotationCount] = useState<number>(1);

  const containerRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Sound chime synthesizer on scan
  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {
      console.warn("Audio play prevented:", e);
    }
  };

  // Function to rotate token via API
  const rotateToken = async () => {
    try {
      setIsRotating(true);
      const res = await fetch("/api/qr/rotate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      const data = await res.json();
      if (data.token) {
        setToken(data.token);
        setExpiresAt(data.expiresAt);
        setCountdown(5.0);
        setRotationCount((prev) => prev + 1);
      }
    } catch (err) {
      console.error("Token rotation error:", err);
    } finally {
      setIsRotating(false);
    }
  };

  // Rotate token on mount and setup 5-second interval
  useEffect(() => {
    rotateToken();

    // High precision countdown timer (every 100ms)
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 0.1) {
          rotateToken();
          return 5.0;
        }
        return Math.max(0, +(prev - 0.1).toFixed(1));
      });
    }, 100);

    return () => clearInterval(countdownInterval);
  }, [sessionId]);

  // Supabase Realtime Subscription + Polling Fallback for Live Feed
  useEffect(() => {
    // 1. Initial fetch of attendees
    const fetchSessionAttendances = async () => {
      try {
        const res = await fetch(`/api/lecturer/sessions/${sessionId}`);
        const data = await res.json();
        if (data.attendances) {
          setLiveAttendances(data.attendances);
        }
      } catch (e) {
        console.warn("Attendances load fallback:", e);
      }
    };
    fetchSessionAttendances();

    // 2. Supabase Realtime Channel
    let channel: any = null;
    try {
      channel = supabase
        .channel(`attendance-session-${sessionId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "attendances",
            filter: `session_id=eq.${sessionId}`,
          },
          (payload) => {
            console.log("Realtime attendance event received:", payload);
            playChime();
            fetchSessionAttendances();
          }
        )
        .subscribe();
    } catch (realtimeErr) {
      console.warn("Supabase realtime subscription fallback:", realtimeErr);
    }

    // 3. Fallback polling every 3 seconds for 100% reliability
    const pollingTimer = setInterval(() => {
      fetchSessionAttendances();
    }, 3000);

    return () => {
      if (channel) supabase.removeChannel(channel);
      clearInterval(pollingTimer);
    };
  }, [sessionId, soundEnabled]);

  // Fullscreen Toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true));
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  };

  // Construct QR Payload: JSON with session, token, and host for mobile discovery
  const currentHost =
    typeof window !== "undefined" && window.location.host
      ? window.location.host
      : "192.168.100.58:3000";

  const qrPayload = JSON.stringify({
    app: "UG_ATTENDANCE",
    s: sessionId,
    t: token,
    m: meetingNumber,
    ts: Date.now(),
    h: currentHost,
  });

  const progressPercentage = (countdown / 5.0) * 100;

  return (
    <div
      ref={containerRef}
      className={`relative w-full rounded-3xl overflow-hidden transition-all duration-300 ${
        isFullscreen
          ? "fixed inset-0 z-50 bg-slate-950 p-6 flex flex-col justify-between"
          : "bg-gradient-to-b from-slate-900 via-purple-950 to-slate-950 text-white p-6 sm:p-8 shadow-2xl border border-purple-900/50"
      }`}
    >
      {/* Background Ambience */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Projector Toolbar */}
      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white p-1 flex items-center justify-center shrink-0 shadow-lg shadow-purple-600/30 border border-purple-300">
            <Image
              src="/images/logogundar.png"
              alt="Logo Universitas Gunadarma"
              width={42}
              height={42}
              className="object-contain"
              unoptimized
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg text-white">
                {courseName}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-xs font-black">
                {classGroup}
              </span>
            </div>
            <p className="text-xs text-purple-200">
              Pertemuan ke-{meetingNumber} • {roomName} • Toleransi Masa Berlaku 7 Detik
            </p>
          </div>
        </div>

        {/* Action Controls: Sound, Manual Rotate, Fullscreen */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2.5 rounded-xl border transition ${
              soundEnabled
                ? "bg-white/10 border-white/20 text-emerald-400 hover:bg-white/20"
                : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/15"
            }`}
            title={soundEnabled ? "Audio Notifikasi Aktif" : "Audio Dimatikan"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={rotateToken}
            disabled={isRotating}
            className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-purple-200 flex items-center gap-1.5 transition"
            title="Paksa Rotasi Token Sekarang"
          >
            <RotateCcw
              className={`w-3.5 h-3.5 ${isRotating ? "animate-spin" : ""}`}
            />
            <span>Refresh Token</span>
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white transition"
            title={isFullscreen ? "Keluar Layar Penuh" : "Mode Proyektor Penuh"}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Main Projector Body: QR + Real-Time Feed */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 my-6 items-center">
        {/* Left Column: Huge Dynamic QR Display */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center text-center">
          {/* Outer glowing frame */}
          <div className="relative group">
            <div className="absolute -inset-2 bg-gradient-to-r from-purple-600 via-indigo-500 to-amber-400 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse" />

            <div className="relative p-6 sm:p-8 bg-white rounded-3xl shadow-2xl flex flex-col items-center">
              {/* QR Code SVG */}
              <div className="w-[260px] h-[260px] sm:w-[320px] sm:h-[320px] flex items-center justify-center">
                <QRCodeSVG
                  value={qrPayload}
                  size={280}
                  level="H"
                  includeMargin={false}
                  fgColor="#2e1065" // Deep academic purple
                  bgColor="#ffffff"
                  imageSettings={{
                    src: "/images/logogundar.png",
                    x: undefined,
                    y: undefined,
                    height: 52,
                    width: 52,
                    excavate: true,
                  }}
                />
              </div>

              {/* Watermark / Anti-Titip Absen Notice */}
              <div className="mt-4 flex items-center gap-2 text-[11px] font-bold text-purple-950 uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-purple-700" />
                <span>ROLLING HMAC TOKEN #{rotationCount} • UNIVERSITAS GUNADARMA</span>
              </div>
            </div>
          </div>

          {/* Dynamic 5-Second Countdown Bar */}
          <div className="w-full max-w-sm mt-6">
            <div className="flex items-center justify-between text-xs font-bold mb-1.5 px-1">
              <span className="text-purple-300 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-300" />
                Rotasi Token Berikutnya:
              </span>
              <span className="font-mono text-amber-300 text-sm">
                {countdown.toFixed(1)}s
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/20">
              <div
                className="h-full bg-gradient-to-r from-purple-500 via-indigo-400 to-amber-300 rounded-full transition-all duration-100 ease-linear"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              QR berganti otomatis setiap 5 detik. Foto / titip screenshot otomatis kedaluwarsa.
            </p>
          </div>
        </div>

        {/* Right Column: Live Attendance Feed & Realtime Scanner List */}
        <div className="lg:col-span-5 flex flex-col h-full bg-white/5 rounded-2xl border border-white/10 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                <span>Live Feed Kehadiran</span>
                <span className="text-[10px] font-mono text-purple-300 font-semibold px-2 py-0.5 bg-white/10 rounded-full">
                  Supabase Realtime
                </span>
              </h3>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
              <Users className="w-3.5 h-3.5" />
              <span>
                {liveAttendances.length} / {totalEnrolled} Hadir
              </span>
            </div>
          </div>

          {/* Attendee Scanned List */}
          <div className="mt-3 flex-1 overflow-y-auto max-h-[380px] space-y-2.5 pr-1">
            {liveAttendances.length === 0 ? (
              <div className="text-center py-16 text-slate-400 text-xs">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p>Menunggu mahasiswa melakukan pemindaian QR di kelas...</p>
              </div>
            ) : (
              liveAttendances.map((att: any, idx: number) => {
                const studentName = att.students?.name || "Mahasiswa";
                const studentNim = att.students?.nim || "-";
                const scanTime = att.scanned_at
                  ? formatIndonesianTime(att.scanned_at)
                  : "-";

                return (
                  <div
                    key={att.id || idx}
                    className="p-3 rounded-xl bg-white/10 border border-white/15 flex items-center justify-between gap-3 transform hover:scale-[1.01] transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-black text-xs flex items-center justify-center shrink-0">
                        {studentName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-white">
                          {studentName}
                        </div>
                        <div className="text-[11px] font-mono text-purple-300">
                          NIM: {studentNim}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>HADIR</span>
                      </span>
                      <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                        {scanTime}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* WhatsApp Automation Badge */}
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-purple-200">
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Notifikasi WhatsApp terkirim ke Orang Tua
            </span>
            <span className="text-slate-400 font-mono">Fonnte API</span>
          </div>
        </div>
      </div>
    </div>
  );
}
