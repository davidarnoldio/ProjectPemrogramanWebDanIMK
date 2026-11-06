"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useLenis } from "lenis/react";
import { Calendar, ShieldCheck, GraduationCap } from "lucide-react";

interface FloatingNavbarProps {
  activeSection?: string;
}

export default function FloatingNavbar({ activeSection }: FloatingNavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const lenis = useLenis();
  const [formattedDate, setFormattedDate] = useState<string>("");

  useEffect(() => {
    const getFormattedDate = () => {
      const now = new Date();
      const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
      const months = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
      ];
      const dayName = days[now.getDay()];
      const day = now.getDate();
      const monthName = months[now.getMonth()];
      const year = now.getFullYear();
      return `${dayName}, ${day} ${monthName} ${year}`;
    };

    setFormattedDate(getFormattedDate());
    const timer = setInterval(() => {
      setFormattedDate(getFormattedDate());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const handleScrollToTop = () => {
    if (pathname !== "/") {
      router.push("/");
      return;
    }

    if (lenis) {
      lenis.scrollTo(0, { duration: 1.0 });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <header className="w-full pt-4 sm:pt-5 px-4 sm:px-6 lg:px-8 z-40 relative no-print">
      <div className="max-w-7xl mx-auto bg-white/95 backdrop-blur-md rounded-full shadow-sm border border-slate-200/80 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link
          href="/"
          onClick={(e) => {
            if (pathname === "/") {
              e.preventDefault();
              handleScrollToTop();
            }
          }}
          className="flex items-center gap-2.5 group cursor-pointer"
        >
          <div className="w-10 h-10 relative flex items-center justify-center shrink-0 p-1 bg-white rounded-full border border-purple-200 shadow-xs group-hover:scale-105 transition-transform">
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
            <span className="font-black text-sm tracking-tight text-slate-900 group-hover:text-purple-950 transition-colors">
              UG ATTENDANCE
            </span>
            <p className="text-[10px] text-slate-500 font-medium leading-none">
              Universitas Gunadarma
            </p>
          </div>
        </Link>

        {/* Center: Hari, Tanggal, dan Tahun (Menggantikan Beranda) */}
        <div className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-50/90 border border-purple-200/80 shadow-xs">
          <Calendar className="w-3.5 h-3.5 text-purple-800 shrink-0" />
          <span className="text-xs font-bold text-purple-950 tracking-tight">
            {formattedDate || "Memuat tanggal..."}
          </span>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/login"
            className="px-3.5 py-1.5 rounded-full border border-purple-300 bg-white hover:bg-purple-50 text-purple-950 text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-purple-800" />
            <span className="hidden sm:inline">Portal Admin</span>
            <span className="sm:hidden">Admin</span>
          </Link>
          <Link
            href="/lecturer/login"
            className="px-4 py-1.5 rounded-full bg-purple-950 hover:bg-purple-900 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Portal Dosen</span>
            <span className="sm:hidden">Dosen</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
