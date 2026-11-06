"use client";

import { useState, Suspense } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ShieldCheck,
  UserCheck,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  Smartphone,
} from "lucide-react";
import Link from "next/link";
import LoginFloatingNavbar from "@/components/LoginFloatingNavbar";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role") === "admin" ? "ADMIN" : "LECTURER";

  const [role, setRole] = useState<"ADMIN" | "LECTURER">(initialRole);
  const [email, setEmail] = useState(
    initialRole === "ADMIN" ? "admin@adminkampus.com" : "budi.santoso@dosenkampus.com"
  );
  const [password, setPassword] = useState(
    initialRole === "ADMIN" ? "admin123" : "0412088501"
  );
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const selectRole = (newRole: "ADMIN" | "LECTURER") => {
    setRole(newRole);
    setError(null);
    if (newRole === "ADMIN") {
      setEmail("admin@adminkampus.com");
      setPassword("admin123");
    } else {
      setEmail("budi.santoso@dosenkampus.com");
      setPassword("0412088501");
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    let cleanEmail = email.trim();
    if (role === "ADMIN") {
      if (!cleanEmail.includes("@")) {
        cleanEmail = `${cleanEmail}@adminkampus.com`;
        setEmail(cleanEmail);
      }
      if (!cleanEmail.toLowerCase().endsWith("@adminkampus.com")) {
        setError("Email Administrator wajib menggunakan domain @adminkampus.com");
        return;
      }
    } else {
      if (!cleanEmail.includes("@")) {
        cleanEmail = `${cleanEmail}@dosenkampus.com`;
        setEmail(cleanEmail);
      }
      if (!cleanEmail.toLowerCase().endsWith("@dosenkampus.com")) {
        setError("Email Dosen wajib menggunakan domain @dosenkampus.com");
        return;
      }
    }

    if (!password) {
      setError("Kata sandi wajib diisi.");
      return;
    }

    setIsLoading(true);

    if (role === "ADMIN") {
      try {
        localStorage.setItem(
          "ug_admin_session",
          JSON.stringify({ email: cleanEmail, role: "ADMIN" })
        );
      } catch (_) {}
      setTimeout(() => router.push("/admin/dashboard"), 300);
    } else {
      try {
        localStorage.setItem(
          "ug_lecturer_session",
          JSON.stringify({ email: cleanEmail, role: "LECTURER" })
        );
      } catch (_) {}
      setTimeout(() => router.push("/lecturer/dashboard"), 300);
    }
  };

  return (
    <div className="max-w-[430px] w-full bg-white rounded-[28px] shadow-2xl border border-slate-100 p-8 sm:p-9 relative overflow-hidden">
      {/* Card Top-Left Artistic Wave Swoosh */}
      <div className="absolute top-0 left-0 w-36 h-28 pointer-events-none overflow-hidden rounded-tl-[28px]">
        <svg viewBox="0 0 160 140" className="w-full h-full">
          <path
            d="M-20,-20 L140,-20 C100,55 55,85 -20,105 Z"
            fill="#9333EA"
            opacity="0.3"
          />
          <path
            d="M-20,-20 L115,-20 C85,45 40,75 -20,85 Z"
            fill="url(#cardSwoosh)"
          />
          <defs>
            <linearGradient id="cardSwoosh" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#581C87" />
              <stop offset="100%" stopColor="#7E22CE" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Centered Gunadarma Circular Logo */}
      <div className="w-20 h-20 mx-auto relative rounded-full border-2 border-purple-200/90 p-1.5 shadow-md bg-white mb-3 mt-1 flex items-center justify-center">
        <Image
          src="/images/logogundar.png"
          alt="Logo Universitas Gunadarma"
          width={68}
          height={68}
          className="object-contain"
          unoptimized
          priority
        />
      </div>

      {/* Heading */}
      <h1 className="text-xl sm:text-2xl font-black text-purple-950 tracking-tight text-center">
        {role === "ADMIN" ? "Masuk Portal Admin" : "Masuk Portal Dosen"}
      </h1>
      <p className="text-xs text-slate-500 mt-1 text-center font-medium">
        {role === "ADMIN"
          ? "Biro Administrasi Akademik & Kemahasiswaan (BAAK)"
          : "Sistem Presensi Perkuliahan Universitas Gunadarma"}
      </p>

      {/* Clean Role Switch Pills */}
      <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-2xl mt-5 mb-2">
        <button
          type="button"
          onClick={() => selectRole("LECTURER")}
          className={`py-2 px-3 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition ${
            role === "LECTURER"
              ? "bg-purple-900 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Dosen</span>
        </button>

        <button
          type="button"
          onClick={() => selectRole("ADMIN")}
          className={`py-2 px-3 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition ${
            role === "ADMIN"
              ? "bg-purple-900 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Admin</span>
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mt-3 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleLogin} className="space-y-4 mt-4">
        <div>
          <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider mb-1.5">
            <Mail className="w-3.5 h-3.5 inline mr-1.5 text-purple-900" />
            EMAIL
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-4 h-4 text-purple-800" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError(null);
              }}
              placeholder={
                role === "ADMIN"
                  ? "admin@adminkampus.com"
                  : "budi.santoso@dosenkampus.com"
              }
              required
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-700 focus:border-transparent text-slate-900 bg-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider mb-1.5">
            <Lock className="w-3.5 h-3.5 inline mr-1.5 text-purple-900" />
            KATA SANDI
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-4 h-4 text-purple-800" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(null);
              }}
              placeholder="••••••••••"
              required
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-700 focus:border-transparent text-slate-900 bg-white tracking-widest"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-800 via-purple-900 to-purple-950 hover:from-purple-700 hover:to-purple-900 text-white font-bold text-sm shadow-md shadow-purple-950/20 flex items-center justify-center gap-2 transition active:scale-[0.99] disabled:opacity-50"
        >
          <span>{isLoading ? "Memproses..." : "Masuk"}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      {/* Switch Button */}
      <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <Link
          href="/admin/login"
          className="font-bold text-purple-900 hover:underline flex items-center gap-1"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Portal Admin</span>
        </Link>
        <span className="text-slate-300">•</span>
        <Link
          href="/lecturer/login"
          className="font-bold text-purple-900 hover:underline flex items-center gap-1"
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Portal Dosen</span>
        </Link>
      </div>

      {/* Mobile App Student Notice */}
      <div className="mt-4 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
        <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1">
          <Smartphone className="w-3.5 h-3.5 text-purple-800" />
          <span>Mahasiswa login melalui Aplikasi Mobile.</span>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50/70 relative overflow-hidden flex flex-col justify-between font-sans">
      {/* 1. Left Campus Building Fade Background */}
      <div className="absolute left-0 top-0 bottom-0 w-full sm:w-1/2 pointer-events-none select-none z-0 overflow-hidden">
        <Image
          src="/images/campus_gunadarma.jpg"
          alt="Kampus Universitas Gunadarma"
          fill
          priority
          className="object-cover object-left opacity-30 mix-blend-multiply"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-50/80 to-slate-50" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-transparent to-transparent" />
      </div>

      {/* 2. Top-Right Dot Matrix Grid */}
      <div className="absolute top-20 right-8 sm:right-16 w-24 h-24 pointer-events-none select-none z-0 opacity-25 grid grid-cols-6 gap-2">
        {Array.from({ length: 36 }).map((_, i) => (
          <div key={i} className="w-1.5 h-1.5 rounded-full bg-purple-700" />
        ))}
      </div>

      {/* 3. Bottom-Right Flowing Purple Curves */}
      <div className="absolute right-0 bottom-0 w-full sm:w-2/3 h-72 sm:h-96 pointer-events-none select-none z-0 overflow-hidden">
        <svg viewBox="0 0 1000 500" className="w-full h-full" preserveAspectRatio="none">
          <path
            d="M250,500 C450,450 650,220 1000,180 L1000,500 Z"
            fill="url(#bottomWave1)"
            opacity="0.25"
          />
          <path
            d="M400,500 C600,420 750,280 1000,260 L1000,500 Z"
            fill="url(#bottomWave2)"
            opacity="0.9"
          />
          <defs>
            <linearGradient id="bottomWave1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#C084FC" />
              <stop offset="100%" stopColor="#581C87" />
            </linearGradient>
            <linearGradient id="bottomWave2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7E22CE" />
              <stop offset="100%" stopColor="#3B0764" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* 4. Top Floating Island Navbar */}
      <LoginFloatingNavbar currentRole="LECTURER" />

      {/* 5. Center Login Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 z-10 relative my-6">
        <ScrollReveal direction="up" delay={0.1} scale className="max-w-[430px] w-full">
          <Suspense fallback={<div className="text-center p-8 text-slate-500">Memuat...</div>}>
            <LoginContent />
          </Suspense>
        </ScrollReveal>
      </main>

      {/* Footer minimal info */}
      <footer className="w-full py-3 text-center text-[11px] text-slate-400 z-10 relative">
        Universitas Gunadarma • Biro Administrasi Akademik &amp; Kemahasiswaan (BAAK)
      </footer>
    </div>
  );
}
