"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  GraduationCap,
  Calendar,
  Users,
  UserCheck,
  QrCode,
  FileText,
  LayoutDashboard,
  ShieldCheck,
  Clock,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import { formatIndonesianTime } from "@/lib/utils";
import { BatikPhotoRibbon, BatikRosette } from "@/components/ui/BatikElements";

export default function Navbar() {
  const pathname = usePathname();
  const [timeStr, setTimeStr] = useState<string>("");
  const isAdmin = pathname.startsWith("/admin");
  const isLecturer = pathname.startsWith("/lecturer");

  useEffect(() => {
    setTimeStr(formatIndonesianTime(new Date()));
    const timer = setInterval(() => {
      setTimeStr(formatIndonesianTime(new Date()));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-sm no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-12 h-12 relative flex items-center justify-center shrink-0 p-1 bg-white rounded-xl shadow-xs border border-purple-200/90 group-hover:border-purple-400 group-hover:shadow-md transition-all">
                <Image
                  src="/images/logogundar.png"
                  alt="Universitas Gunadarma Logo"
                  width={44}
                  height={44}
                  className="object-contain drop-shadow-xs"
                  unoptimized
                  priority
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-base sm:text-lg tracking-tight text-slate-900 group-hover:text-purple-950 transition-colors">
                    UG ATTENDANCE
                  </span>
                  <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-purple-50 text-purple-900 border border-purple-200 shadow-xs">
                    <BatikRosette size={11} />
                    <span className="text-[10px] font-black uppercase tracking-wider">
                      BAAK
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-purple-950/70 font-semibold hidden sm:flex items-center gap-1.5">
                  <span>Universitas Gunadarma</span>
                  <span className="text-purple-300">•</span>
                  <span className="text-slate-500 font-medium">Layanan Presensi Akademik</span>
                </p>
              </div>
            </Link>
          </div>

          {/* Navigation Links based on active section */}
          <nav className="hidden md:flex items-center gap-1">
            {isAdmin ? (
              <>
                <Link
                  href="/admin/dashboard"
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${
                    pathname === "/admin/dashboard"
                      ? "bg-purple-900 text-white shadow-sm"
                      : "text-slate-600 hover:text-purple-900 hover:bg-purple-50"
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <Link
                  href="/admin/schedules"
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${
                    pathname === "/admin/schedules"
                      ? "bg-purple-900 text-white shadow-sm"
                      : "text-slate-600 hover:text-purple-900 hover:bg-purple-50"
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  Jadwal & Plotting
                </Link>
                <Link
                  href="/admin/lecturers"
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${
                    pathname === "/admin/lecturers"
                      ? "bg-purple-900 text-white shadow-sm"
                      : "text-slate-600 hover:text-purple-900 hover:bg-purple-50"
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  Data Dosen
                </Link>
                <Link
                  href="/admin/students"
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${
                    pathname === "/admin/students"
                      ? "bg-purple-900 text-white shadow-sm"
                      : "text-slate-600 hover:text-purple-900 hover:bg-purple-50"
                  }`}
                >
                  <Users className="w-4 h-4" />
                  Data Mahasiswa
                </Link>
                <Link
                  href="/admin/reports"
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${
                    pathname === "/admin/reports"
                      ? "bg-purple-900 text-white shadow-sm"
                      : "text-slate-600 hover:text-purple-900 hover:bg-purple-50"
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  Cetak Rekap A4
                </Link>
              </>
            ) : isLecturer ? (
              <>
                <Link
                  href="/lecturer/dashboard"
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${
                    pathname === "/lecturer/dashboard"
                      ? "bg-purple-900 text-white shadow-sm"
                      : "text-slate-600 hover:text-purple-900 hover:bg-purple-50"
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  Jadwal Mengajar
                </Link>
                <Link
                  href="/lecturer/sessions/55555555-5555-5555-5555-555555555501"
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${
                    pathname.includes("/lecturer/sessions")
                      ? "bg-purple-900 text-white shadow-sm"
                      : "text-slate-600 hover:text-purple-900 hover:bg-purple-50"
                  }`}
                >
                  <QrCode className="w-4 h-4 text-amber-400" />
                  Layar Proyektor QR (5 Detik)
                </Link>
                <Link
                  href="/lecturer/permissions"
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${
                    pathname === "/lecturer/permissions"
                      ? "bg-purple-900 text-white shadow-sm"
                      : "text-slate-600 hover:text-purple-900 hover:bg-purple-50"
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  Verifikasi Dispensasi
                </Link>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-7 text-sm font-semibold text-slate-600">
                <Link
                  href="/"
                  className="text-slate-600 hover:text-purple-900 transition py-1"
                >
                  Beranda
                </Link>
                <Link
                  href="/#keunggulan"
                  className="text-slate-600 hover:text-purple-900 transition py-1"
                >
                  Tentang
                </Link>
                <Link
                  href="/#panduan"
                  className="text-slate-600 hover:text-purple-900 transition py-1"
                >
                  Panduan
                </Link>
              </div>
            )}
          </nav>

          {/* Right Tools / Status & Clock */}
          <div className="flex items-center gap-3">
            {/* Clock */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200/80">
              <Clock className="w-3.5 h-3.5 text-purple-900" />
              <span>{timeStr || "WIB"}</span>
            </div>

            {/* Role indicator shown when already inside /admin or /lecturer */}
            {isAdmin || isLecturer ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/admin/dashboard"
                  className={`text-xs px-2.5 py-1.5 rounded-lg font-semibold flex items-center gap-1 transition-all ${
                    isAdmin
                      ? "bg-purple-900 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Admin
                </Link>
                <Link
                  href="/lecturer/dashboard"
                  className={`text-xs px-2.5 py-1.5 rounded-lg font-semibold flex items-center gap-1 transition-all ${
                    isLecturer
                      ? "bg-purple-900 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5" />
                  Dosen
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/admin/login"
                  className="text-xs px-3 py-1.5 rounded-lg font-bold bg-purple-900 hover:bg-purple-800 text-white flex items-center gap-1.5 shadow-xs transition"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Login Admin</span>
                  <span className="sm:hidden">Admin</span>
                </Link>
                <Link
                  href="/lecturer/login"
                  className="text-xs px-3 py-1.5 rounded-lg font-bold bg-purple-50 hover:bg-purple-100 text-purple-950 border border-purple-200 flex items-center gap-1.5 transition"
                >
                  <UserCheck className="w-3.5 h-3.5 text-purple-900" />
                  <span className="hidden sm:inline">Login Dosen</span>
                  <span className="sm:hidden">Dosen</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Vibrant traditional Indonesian Batik ribbon trim */}
      <BatikPhotoRibbon className="w-full h-2" />
    </header>
  );
}
