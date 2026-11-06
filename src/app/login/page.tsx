"use client";

import { useState, Suspense } from "react";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ShieldCheck,
  UserCheck,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Eye,
  EyeOff,
  Smartphone,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { BatikPhotoRibbon, BatikRosette } from "@/components/ui/BatikElements";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role") === "lecturer" ? "LECTURER" : "ADMIN";

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
        setError("Email Administrator wajib menggunakan domain resmi @adminkampus.com");
        return;
      }
    } else {
      if (!cleanEmail.includes("@")) {
        cleanEmail = `${cleanEmail}@dosenkampus.com`;
        setEmail(cleanEmail);
      }
      if (!cleanEmail.toLowerCase().endsWith("@dosenkampus.com")) {
        setError("Email Dosen wajib menggunakan domain resmi @dosenkampus.com");
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
    <div className="bg-white rounded-3xl shadow-xl border border-slate-200/90 max-w-lg w-full overflow-hidden">
      {/* Top Batik Ribbon Header */}
      <BatikPhotoRibbon className="w-full h-2" />

      <div className="p-8">
        {/* Logo and Headings */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 relative flex items-center justify-center mx-auto mb-3 p-1 bg-white rounded-2xl border border-purple-200 shadow-md">
            <Image
              src="/images/logogundar.png"
              alt="Logo Universitas Gunadarma"
              width={72}
              height={72}
              className="object-contain drop-shadow-xs"
              unoptimized
              priority
            />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-950 border border-purple-200 shadow-xs mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider">
              UG ATTENDANCE • PORTAL RESMI KAMPUS
            </span>
            <BatikRosette size={11} />
          </div>

          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Masuk ke Sistem Presensi
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pilih form login sesuai dengan peran Anda di Universitas Gunadarma.
          </p>
        </div>

        {/* 2 Distinct Role Selection Tabs */}
        <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => selectRole("ADMIN")}
            className={`py-3 px-3 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition ${
              role === "ADMIN"
                ? "bg-purple-900 text-white shadow-md"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <div className="text-left">
              <p className="leading-tight">Admin BAAK</p>
              <p className={`text-[10px] font-normal ${role === "ADMIN" ? "text-purple-200" : "text-slate-400"}`}>
                @adminkampus.com
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => selectRole("LECTURER")}
            className={`py-3 px-3 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition ${
              role === "LECTURER"
                ? "bg-purple-900 text-white shadow-md"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <div className="text-left">
              <p className="leading-tight">Dosen Pengampu</p>
              <p className={`text-[10px] font-normal ${role === "LECTURER" ? "text-purple-200" : "text-slate-400"}`}>
                @dosenkampus.com
              </p>
            </div>
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        {/* Dynamic Form based on selected Role */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                {role === "ADMIN" ? "Email Administrator" : "Email Dosen Pengampu"}
              </label>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                  role === "ADMIN"
                    ? "bg-purple-50 text-purple-900 border-purple-200"
                    : "bg-amber-50 text-amber-900 border-amber-200"
                }`}
              >
                {role === "ADMIN" ? "@adminkampus.com" : "@dosenkampus.com"}
              </span>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4 text-purple-900" />
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
                    ? "nama@adminkampus.com"
                    : "nama.dosen@dosenkampus.com"
                }
                required
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-700 text-slate-900"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Wajib menggunakan domain resmi{" "}
              <strong className="text-purple-950 font-semibold">
                {role === "ADMIN" ? "@adminkampus.com" : "@dosenkampus.com"}
              </strong>
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Kata Sandi (Password)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4 text-purple-900" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Masukkan kata sandi..."
                required
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-700 text-slate-900"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Quick Credential Hint */}
          <div
            className={`p-3.5 rounded-xl border text-xs ${
              role === "ADMIN"
                ? "bg-purple-50/80 border-purple-200/90 text-purple-950"
                : "bg-amber-50/80 border-amber-200/90 text-amber-950"
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold mb-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {role === "ADMIN"
                  ? "Kredensial Default Admin BAAK:"
                  : "Kredensial Default Dosen Pengampu:"}
              </span>
            </div>
            {role === "ADMIN" ? (
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    setEmail("admin@adminkampus.com");
                    setPassword("admin123");
                  }}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-purple-200 text-left hover:border-purple-400 transition flex items-center justify-between"
                >
                  <span className="font-bold text-[11px] text-purple-950">
                    admin@adminkampus.com
                  </span>
                  <span className="text-[10px] text-slate-500">Pass: admin123</span>
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    setEmail("budi.santoso@dosenkampus.com");
                    setPassword("0412088501");
                  }}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-amber-200 text-left hover:border-purple-400 transition flex items-center justify-between"
                >
                  <span className="font-bold text-[11px] text-slate-900">
                    budi.santoso@dosenkampus.com
                  </span>
                  <span className="text-[10px] text-slate-500">Pass: 0412088501</span>
                </button>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-purple-900 hover:bg-purple-800 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            <span>
              {isLoading
                ? "Memproses..."
                : role === "ADMIN"
                ? "Masuk Sebagai Admin"
                : "Masuk Sebagai Dosen"}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Direct page links */}
        <div className="mt-6 pt-5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <Link
            href="/admin/login"
            className="font-bold text-purple-900 hover:underline flex items-center gap-1"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Halaman Khusus Admin</span>
          </Link>
          <span className="hidden sm:inline text-slate-300">•</span>
          <Link
            href="/lecturer/login"
            className="font-bold text-purple-900 hover:underline flex items-center gap-1"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Halaman Khusus Dosen</span>
          </Link>
        </div>

        {/* Student notice */}
        <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
          <p className="text-[11px] text-slate-600 flex items-center justify-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-purple-800" />
            <span>
              Mahasiswa melakukan presensi melalui <strong>Aplikasi Mobile Flutter</strong> menggunakan NIM.
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <Suspense fallback={<div className="text-center p-8 text-slate-500">Memuat halaman masuk...</div>}>
          <LoginContent />
        </Suspense>
      </main>
    </div>
  );
}
