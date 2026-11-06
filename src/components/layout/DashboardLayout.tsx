"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useLenis } from "lenis/react";
import {
  LayoutDashboard,
  Calendar,
  Users,
  UserCheck,
  QrCode,
  FileText,
  Home,
  LogOut,
  Clock,
  Menu,
  X,
  ShieldCheck,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { formatIndonesianTime } from "@/lib/utils";
import { BatikKawungPattern } from "@/components/ui/BatikElements";

interface DashboardLayoutProps {
  role: "ADMIN" | "LECTURER";
  children: React.ReactNode;
}

export default function DashboardLayout({ role, children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const lenis = useLenis();
  const [timeStr, setTimeStr] = useState<string>("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<{ name: string; email: string }>({
    name: role === "ADMIN" ? "Administrator BAAK" : "Dr. Budi Santoso, M.Kom.",
    email: role === "ADMIN" ? "admin@adminkampus.com" : "budi.santoso@dosenkampus.com",
  });

  useEffect(() => {
    setTimeStr(formatIndonesianTime(new Date()));
    const timer = setInterval(() => {
      setTimeStr(formatIndonesianTime(new Date()));
    }, 1000);

    // Retrieve active session if stored
    try {
      const sessionKey = role === "ADMIN" ? "ug_admin_session" : "ug_lecturer_session";
      const stored = localStorage.getItem(sessionKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.email) {
          setUserProfile((prev) => ({
            ...prev,
            email: parsed.email,
            name: parsed.name || prev.name,
          }));
        }
      }
    } catch (_) {}

    return () => clearInterval(timer);
  }, [role]);

  // Smooth scroll handler on link click
  const handleNavClick = () => {
    setIsMobileMenuOpen(false);
    if (lenis) {
      lenis.scrollTo(0, { duration: 0.8 });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleLogout = () => {
    try {
      if (role === "ADMIN") {
        localStorage.removeItem("ug_admin_session");
      } else {
        localStorage.removeItem("ug_lecturer_session");
      }
    } catch (_) {}
    router.push(role === "ADMIN" ? "/admin/login" : "/lecturer/login");
  };

  const adminNavItems = [
    {
      name: "Dashboard",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Jadwal & Plotting",
      href: "/admin/schedules",
      icon: Calendar,
    },
    {
      name: "Data Dosen",
      href: "/admin/lecturers",
      icon: UserCheck,
    },
    {
      name: "Data Mahasiswa",
      href: "/admin/students",
      icon: Users,
    },
    {
      name: "Rekapitulasi A4",
      href: "/admin/reports",
      icon: FileText,
    },
  ];

  const lecturerNavItems = [
    {
      name: "Jadwal Mengajar",
      href: "/lecturer/dashboard",
      icon: Calendar,
    },
    {
      name: "Layar Proyektor QR",
      href: "/lecturer/sessions/55555555-5555-5555-5555-555555555501",
      icon: QrCode,
    },
    {
      name: "Verifikasi Dispensasi",
      href: "/lecturer/permissions",
      icon: FileText,
    },
  ];

  const navItems = role === "ADMIN" ? adminNavItems : lecturerNavItems;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-purple-100 selection:text-purple-900">
      {/* ========================================================= */}
      {/* 1. MOBILE TOP APP BAR (< lg)                              */}
      {/* ========================================================= */}
      <header className="lg:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-2.5 flex items-center justify-between shadow-xs no-print">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 transition"
            aria-label="Toggle Menu Sidebar"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 relative flex items-center justify-center shrink-0 p-0.5 bg-white rounded-full border border-purple-200">
              <Image
                src="/images/logogundar.png"
                alt="Logo Gunadarma"
                width={28}
                height={28}
                className="object-contain"
                unoptimized
              />
            </div>
            <div>
              <span className="font-black text-xs text-slate-900">UG ATTENDANCE</span>
              <p className="text-[9px] text-slate-500 font-medium leading-none">
                {role === "ADMIN" ? "Admin BAAK" : "Portal Dosen"}
              </p>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
            {timeStr}
          </span>
          <button
            type="button"
            onClick={handleLogout}
            className="p-1.5 rounded-xl bg-purple-50 text-purple-900 hover:bg-purple-100 transition"
            title="Keluar"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ========================================================= */}
      {/* 2. SIDEBAR (DESKTOP FIXED + MOBILE DRAWER)                */}
      {/* ========================================================= */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-[270px] bg-white border-r border-slate-200/90 shadow-lg lg:shadow-none flex flex-col justify-between transition-transform duration-300 ease-in-out no-print ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Subtle Background Batik Kawung Accent */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.035] overflow-hidden">
          <BatikKawungPattern opacity={1} color="#581C87" className="w-full h-full" />
        </div>

        <div className="p-5 relative z-10 flex flex-col h-full justify-between overflow-y-auto">
          {/* Top Brand & Role Header */}
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <Link href="/" onClick={handleNavClick} className="flex items-center gap-3 group">
                <div className="w-11 h-11 relative flex items-center justify-center shrink-0 p-1 bg-white rounded-2xl border-2 border-purple-200 shadow-xs group-hover:scale-105 transition-transform">
                  <Image
                    src="/images/logogundar.png"
                    alt="Logo Universitas Gunadarma"
                    width={36}
                    height={36}
                    className="object-contain"
                    unoptimized
                    priority
                  />
                </div>
                <div>
                  <span className="font-black text-sm tracking-tight text-slate-900 group-hover:text-purple-950 transition-colors block">
                    UG ATTENDANCE
                  </span>
                  <p className="text-[10px] text-slate-500 font-semibold leading-tight">
                    Universitas Gunadarma
                  </p>
                </div>
              </Link>

              {/* Close button on mobile */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="lg:hidden p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Role Badge Indicator */}
            <div className="mt-4 p-2.5 rounded-xl bg-purple-50/80 border border-purple-100 flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-purple-900 text-white flex items-center justify-center shrink-0">
                {role === "ADMIN" ? (
                  <ShieldCheck className="w-4 h-4" />
                ) : (
                  <GraduationCap className="w-4 h-4" />
                )}
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-black uppercase tracking-wider text-purple-950 block truncate">
                  {role === "ADMIN" ? "Admin BAAK" : "Dosen Pengampu"}
                </span>
                <span className="text-[9px] text-purple-700 font-medium block truncate">
                  Sistem Presensi Kampus
                </span>
              </div>
            </div>

            {/* Navigation Menu List */}
            <div className="mt-6">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 px-2">
                Menu Utama
              </p>
              <nav className="space-y-1.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={handleNavClick}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? "bg-purple-900 text-white shadow-sm shadow-purple-950/20 translate-x-1"
                          : "text-slate-600 hover:text-purple-950 hover:bg-purple-50/80"
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? "text-purple-200" : "text-slate-400 group-hover:text-purple-800"
                        }`}
                      />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Secondary Navigation */}
            <div className="mt-6 pt-4 border-t border-slate-100">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 px-2">
                Pintasan
              </p>
              <Link
                href="/"
                onClick={handleNavClick}
                className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-purple-950 hover:bg-purple-50/60 transition"
              >
                <Home className="w-4 h-4 text-slate-400" />
                <span>Kembali ke Beranda</span>
              </Link>
            </div>
          </div>

          {/* Bottom Section: Clock, User Info & Logout */}
          <div className="pt-4 mt-6 border-t border-slate-100 space-y-3">
            {/* Live Clock */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
              <div className="flex items-center gap-1.5 text-slate-600 font-semibold text-[11px]">
                <Clock className="w-3.5 h-3.5 text-purple-900" />
                <span>Waktu Server</span>
              </div>
              <span className="font-mono font-bold text-slate-900 text-[11px]">{timeStr}</span>
            </div>

            {/* User Profile Info Card */}
            <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-950 via-purple-900 to-indigo-950 text-white shadow-sm relative overflow-hidden">
              <div className="relative z-10 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-extrabold truncate text-white leading-tight">
                    {userProfile.name}
                  </p>
                  <p className="text-[10px] text-purple-200 truncate mt-0.5 font-mono">
                    {userProfile.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <button
              type="button"
              onClick={handleLogout}
              className="w-full py-2.5 px-3 rounded-xl border border-rose-200 hover:border-rose-300 hover:bg-rose-50 text-rose-700 font-bold text-xs flex items-center justify-center gap-2 transition active:scale-[0.99] cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar dari Akun</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Backdrop overlay for mobile drawer */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden no-print"
        />
      )}

      {/* ========================================================= */}
      {/* 3. MAIN DASHBOARD CONTENT AREA                            */}
      {/* ========================================================= */}
      <div className="lg:pl-[270px] flex-1 flex flex-col min-w-0 transition-all duration-300">
        {children}
      </div>
    </div>
  );
}

