"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import DynamicQRProjector from "@/components/DynamicQRProjector";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  CheckCircle2,
  Clock,
  Lock,
  Edit3,
  Calendar,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Check,
  UserX,
  FileText,
} from "lucide-react";
import { formatIndonesianDateTime, formatIndonesianTime } from "@/lib/utils";

export default function LecturerSessionControllerPage() {
  const params = useParams();
  const sessionId = (params?.id as string) || "55555555-5555-5555-5555-555555555501";
  const [sessionData, setSessionData] = useState<any>(null);
  const [attendances, setAttendances] = useState<any[]>([]);
  const [enrolledStudents, setEnrolledStudents] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    totalEnrolled: 0,
    totalPresent: 0,
    totalPermission: 0,
    totalSick: 0,
    totalAbsent: 0,
  });
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fetchSessionDetails = async () => {
    try {
      const res = await fetch(`/api/lecturer/sessions/${sessionId}`);
      const data = await res.json();
      if (data.session) {
        setSessionData(data.session);
        setAttendances(data.attendances || []);
        setEnrolledStudents(data.enrolledStudents || []);
        setStats(data.stats || {});
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessionDetails();
    const interval = setInterval(fetchSessionDetails, 5000);
    return () => clearInterval(interval);
  }, [sessionId]);

  const handleCloseSession = async () => {
    if (
      !confirm(
        "Apakah Anda yakin ingin MENUTUP sesi presensi perkuliahan ini? Mahasiswa tidak akan dapat memindai QR lagi."
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/lecturer/sessions/${sessionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CLOSED" }),
      });
      if (res.ok) {
        setStatusMessage("Sesi presensi resmi DITUTUP.");
        fetchSessionDetails();
        setTimeout(() => setStatusMessage(null), 4000);
      }
    } catch (e) {
      alert("Gagal menutup sesi");
    }
  };

  const handleManualStatusChange = async (
    studentId: string,
    newStatus: "HADIR" | "IZIN" | "SAKIT" | "ALPA"
  ) => {
    try {
      const res = await fetch(`/api/lecturer/sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, status: newStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMessage(`Status mahasiswa diubah menjadi ${newStatus}`);
        fetchSessionDetails();
        setTimeout(() => setStatusMessage(null), 3000);
      }
    } catch (e) {
      alert("Gagal mengubah status kehadiran mahasiswa");
    }
  };

  if (loading && !sessionData) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="flex items-center gap-3">
          <RotateCcw className="w-6 h-6 animate-spin text-purple-400" />
          <span className="font-semibold text-lg">Memuat Sesi Presensi QR...</span>
        </div>
      </div>
    );
  }

  const courseName = sessionData?.classes?.courses?.name || "Mata Kuliah";
  const className = sessionData?.classes?.class_name || "Kelas";
  const roomName =
    sessionData?.custom_room || sessionData?.classes?.room || "Ruang Kuliah";
  const isOpen = sessionData?.status === "OPEN";

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1">
        {/* Navigation Breadcrumb & Status Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
          <Link
            href="/lecturer/dashboard"
            className="inline-flex items-center gap-2 text-xs font-bold text-purple-900 hover:text-purple-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Jadwal Mengajar</span>
          </Link>

          {statusMessage && (
            <div className="px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold animate-bounce">
              {statusMessage}
            </div>
          )}

          <div className="flex items-center gap-3">
            {isOpen ? (
              <button
                onClick={handleCloseSession}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-sm transition"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Tutup Sesi Presensi</span>
              </button>
            ) : (
              <span className="px-3 py-1.5 rounded-xl bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span>Sesi Selesai (CLOSED)</span>
              </span>
            )}
          </div>
        </div>

        {/* 1. Dynamic Rolling QR Projector Component */}
        {isOpen ? (
          <div className="mb-8">
            <DynamicQRProjector
              sessionId={sessionId}
              initialToken={sessionData.active_qr_token}
              courseName={courseName}
              className={className}
              roomName={roomName}
              meetingNumber={sessionData.meeting_number}
              totalEnrolled={enrolledStudents.length}
            />
          </div>
        ) : (
          <div className="mb-8 p-10 rounded-3xl bg-slate-900 text-white text-center border border-slate-800">
            <div className="w-16 h-16 rounded-2xl bg-white/10 text-slate-400 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold">Sesi Perkuliahan Telah Ditutup</h2>
            <p className="text-slate-400 text-sm mt-1 max-w-md mx-auto">
              QR code tidak lagi aktif untuk pemindaian. Anda tetap dapat melakukan koreksi data presensi mahasiswa pada tabel di bawah.
            </p>
          </div>
        )}

        {/* 2. Quick Attendance Metrics Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Mahasiswa
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {enrolledStudents.length}
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
              Hadir (Scan QR)
            </span>
            <div className="text-2xl font-black text-emerald-700 mt-1">
              {attendances.filter((a) => a.status === "HADIR").length}
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">
              Izin
            </span>
            <div className="text-2xl font-black text-amber-700 mt-1">
              {attendances.filter((a) => a.status === "IZIN").length}
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
              Sakit
            </span>
            <div className="text-2xl font-black text-blue-700 mt-1">
              {attendances.filter((a) => a.status === "SAKIT").length}
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600">
              Alpa / Belum Scan
            </span>
            <div className="text-2xl font-black text-rose-700 mt-1">
              {Math.max(
                0,
                enrolledStudents.length -
                  attendances.filter((a) => a.status === "HADIR").length -
                  attendances.filter((a) => a.status === "IZIN").length -
                  attendances.filter((a) => a.status === "SAKIT").length
              )}
            </div>
          </div>
        </div>

        {/* 3. Manual Attendance Correction & Enrolled Roster Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                Koreksi Presensi Manual Mahasiswa di Kelas
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Dosen dapat mengubah status kehadiran secara manual jika mahasiswa mengalami kendala kamera perangkat.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-100 text-purple-900 border border-purple-200">
              Kelas {className}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500 tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-6">Nama Mahasiswa</th>
                  <th className="py-3 px-6">NIM</th>
                  <th className="py-3 px-6">Waktu Scan QR</th>
                  <th className="py-3 px-6 text-center">Status Kehadiran</th>
                  <th className="py-3 px-6 text-right">Koreksi Manual Dosen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {enrolledStudents.map((st) => {
                  const att = attendances.find((a) => a.student_id === st.id);
                  const currentStatus = att ? att.status : "ALPA";
                  const scannedTime = att?.scanned_at
                    ? formatIndonesianTime(att.scanned_at)
                    : "-";

                  return (
                    <tr key={st.id} className="hover:bg-purple-50/20 transition">
                      <td className="py-4 px-6 font-bold text-slate-900">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-900 font-bold text-xs flex items-center justify-center">
                            {st.name.charAt(0)}
                          </div>
                          <span>{st.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-mono text-xs font-bold text-purple-900">
                        {st.nim}
                      </td>
                      <td className="py-4 px-6 text-xs font-mono text-slate-600">
                        {scannedTime}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                            currentStatus === "HADIR"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : currentStatus === "IZIN"
                              ? "bg-amber-100 text-amber-800 border border-amber-200"
                              : currentStatus === "SAKIT"
                              ? "bg-blue-100 text-blue-800 border border-blue-200"
                              : "bg-rose-100 text-rose-800 border border-rose-200"
                          }`}
                        >
                          {currentStatus === "HADIR" && <Check className="w-3.5 h-3.5" />}
                          <span>{currentStatus}</span>
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="inline-flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                          <button
                            onClick={() => handleManualStatusChange(st.id, "HADIR")}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                              currentStatus === "HADIR"
                                ? "bg-emerald-600 text-white shadow-sm"
                                : "text-slate-600 hover:text-emerald-700"
                            }`}
                          >
                            Hadir
                          </button>
                          <button
                            onClick={() => handleManualStatusChange(st.id, "IZIN")}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                              currentStatus === "IZIN"
                                ? "bg-amber-500 text-white shadow-sm"
                                : "text-slate-600 hover:text-amber-700"
                            }`}
                          >
                            Izin
                          </button>
                          <button
                            onClick={() => handleManualStatusChange(st.id, "SAKIT")}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                              currentStatus === "SAKIT"
                                ? "bg-blue-600 text-white shadow-sm"
                                : "text-slate-600 hover:text-blue-700"
                            }`}
                          >
                            Sakit
                          </button>
                          <button
                            onClick={() => handleManualStatusChange(st.id, "ALPA")}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                              currentStatus === "ALPA"
                                ? "bg-rose-600 text-white shadow-sm"
                                : "text-slate-600 hover:text-rose-700"
                            }`}
                          >
                            Alpa
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
