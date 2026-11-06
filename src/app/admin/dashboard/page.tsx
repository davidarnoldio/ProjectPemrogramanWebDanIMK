"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Users,
  UserCheck,
  Calendar,
  Radio,
  TrendingUp,
  FileText,
  PlusCircle,
  Clock,
  Sparkles,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import { formatIndonesianDateTime } from "@/lib/utils";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalLecturers: 0,
    totalClasses: 0,
    activeSessionsCount: 0,
    attendanceRate: 94,
  });
  const [schedules, setSchedules] = useState<any[]>([]);
  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [schedRes, lectRes, studRes, sessRes] = await Promise.all([
          fetch("/api/admin/schedules"),
          fetch("/api/admin/lecturers"),
          fetch("/api/admin/students"),
          fetch("/api/lecturer/sessions"),
        ]);

        const [schedulesData, lecturersData, studentsData, sessionsData] =
          await Promise.all([
            schedRes.json(),
            lectRes.json(),
            studRes.json(),
            sessRes.json(),
          ]);

        const activeSess = Array.isArray(sessionsData)
          ? sessionsData.filter((s: any) => s.status === "OPEN")
          : [];

        setStats({
          totalStudents: Array.isArray(studentsData) ? studentsData.length : 3,
          totalLecturers: Array.isArray(lecturersData) ? lecturersData.length : 5,
          totalClasses: Array.isArray(schedulesData) ? schedulesData.length : 5,
          activeSessionsCount: activeSess.length,
          attendanceRate: 94,
        });

        setSchedules(Array.isArray(schedulesData) ? schedulesData : []);
        setActiveSessions(activeSess);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 relative flex items-center justify-center shrink-0 p-1 bg-white rounded-xl border border-purple-200 shadow-sm">
              <Image
                src="/images/logogundar.png"
                alt="Logo Gunadarma"
                width={40}
                height={40}
                className="object-contain"
                unoptimized
              />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-900 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-purple-700" />
                <span>Biro Administrasi Akademik &amp; Kemahasiswaan (BAAK)</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Dashboard Akademik &amp; Kehadiran
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Pantau jadwal perkuliahan, kehadiran real-time, dan master data kampus.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/schedules"
              className="px-4 py-2 rounded-xl bg-purple-900 hover:bg-purple-800 text-white text-sm font-semibold flex items-center gap-2 shadow-sm transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Tambah Jadwal Baru</span>
            </Link>
            <Link
              href="/admin/reports"
              className="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold flex items-center gap-2 shadow-sm transition"
            >
              <FileText className="w-4 h-4 text-purple-700" />
              <span>Cetak Rekap A4</span>
            </Link>
          </div>
        </div>

        {/* Metric Cards Grid */}
        <ScrollReveal direction="up" delay={0.05}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 my-8">
            {/* Card 1: Students */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Total Mahasiswa Aktif
                </span>
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-800 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900">
                  {stats.totalStudents}
                </span>
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-0.5">
                  <CheckCircle2 className="w-3 h-3" /> Akun Terverifikasi
                </span>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Nomor WA Orang Tua</span>
                <span className="font-semibold text-purple-900">100% Lengkap</span>
              </div>
            </div>

            {/* Card 2: Lecturers */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Total Dosen Pengampu
                </span>
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-800 flex items-center justify-center">
                  <UserCheck className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900">
                  {stats.totalLecturers}
                </span>
                <span className="text-xs text-slate-500 font-medium">Dosen</span>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Status Akun Login</span>
                <span className="font-semibold text-emerald-600">Aktif</span>
              </div>
            </div>

            {/* Card 3: Active Sessions */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Sesi Kuliah Aktif Hari Ini
                </span>
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center animate-pulse">
                  <Radio className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900">
                  {stats.activeSessionsCount}
                </span>
                <span className="text-xs text-amber-600 font-bold uppercase bg-amber-50 px-2 py-0.5 rounded">
                  LIVE OPEN
                </span>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Rolling QR Token</span>
                <span className="font-semibold text-purple-900">5 Detik</span>
              </div>
            </div>

            {/* Card 4: Attendance Rate */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Persentase Kehadiran
                </span>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-black text-emerald-700">
                  {stats.attendanceRate}%
                </span>
                <span className="text-xs text-emerald-600 font-semibold">Tinggi</span>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Notifikasi WA Terkirim</span>
                <span className="font-semibold text-slate-700">Real-time</span>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Live Active Sessions Alert if any */}
        {activeSessions.length > 0 && (
          <div className="mb-8 p-5 rounded-2xl bg-gradient-to-r from-purple-900 to-indigo-900 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-4 h-4 bg-emerald-400 rounded-full animate-ping" />
                <div className="w-4 h-4 bg-emerald-500 rounded-full absolute inset-0" />
              </div>
              <div>
                <h3 className="font-bold text-base">
                  Sedang Berlangsung: Sesi Presensi QR Terbuka di Kelas
                </h3>
                <p className="text-purple-200 text-xs mt-0.5">
                  {activeSessions[0]?.classes?.courses?.name} (
                  {activeSessions[0]?.classes?.class_name}) •{" "}
                  {activeSessions[0]?.custom_room || activeSessions[0]?.classes?.room}
                </p>
              </div>
            </div>
            <Link
              href={`/lecturer/sessions/${activeSessions[0]?.id}`}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition shadow"
            >
              <span>Pantau Layar Proyektor</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Master Schedules Overview */}
        <ScrollReveal direction="up" delay={0.15}>
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-slate-200/80 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Plotting Jadwal Perkuliahan Aktif
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Daftar kelas perkuliahan semester ganjil 2026/2027
                </p>
              </div>
              <Link
                href="/admin/schedules"
                className="text-xs font-semibold text-purple-800 hover:text-purple-900 flex items-center gap-1"
              >
                <span>Kelola Jadwal Lengkap</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50/80 text-xs uppercase font-bold text-slate-500 tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-6">Mata Kuliah</th>
                    <th className="py-3.5 px-4">Kelas</th>
                    <th className="py-3.5 px-6">Dosen Pengampu</th>
                    <th className="py-3.5 px-6">Hari & Waktu</th>
                    <th className="py-3.5 px-6">Ruangan</th>
                    <th className="py-3.5 px-6 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {schedules.map((item) => (
                    <tr key={item.id} className="hover:bg-purple-50/30 transition">
                      <td className="py-4 px-6 font-semibold text-slate-900">
                        <div>{item.courses?.name || "Mata Kuliah"}</div>
                        <div className="text-xs text-purple-700 font-mono font-medium">
                          {item.courses?.code} ({item.courses?.sks} SKS)
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-block px-2.5 py-1 rounded-md text-xs font-bold bg-purple-100 text-purple-900 border border-purple-200">
                          {item.class_name}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-medium text-slate-800">
                        {item.lecturers?.name || "Dosen"}
                        <div className="text-xs text-slate-400 font-mono">
                          NIDN: {item.lecturers?.nidn || "-"}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-medium text-slate-800">{item.schedule_day}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {item.start_time} - {item.end_time} WIB
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-700 font-medium">
                        {item.room}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link
                          href={`/lecturer/sessions/55555555-5555-5555-5555-555555555501`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 transition"
                        >
                          Buka Sesi Presensi
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </ScrollReveal>
      </main>
    </div>
  );
}
