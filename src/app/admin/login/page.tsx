"use client";

import { useState } from "react";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Eye,
  EyeOff,
  UserCheck,
} from "lucide-react";
import Link from "next/link";
import { BatikPhotoRibbon, BatikRosette } from "@/components/ui/BatikElements";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@adminkampus.com");
  const [password, setPassword] = useState("admin123");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (val: string) => {
    const trimmed = val.trim().toLowerCase();
    if (!trimmed.endsWith("@adminkampus.com")) {
      return "Email Administrator wajib menggunakan domain resmi @adminkampus.com";
    }
    return null;
  };

  const handleQuickFill = (selectedEmail: string, selectedPass: string) => {
    setEmail(selectedEmail);
    setPassword(selectedPass);
    setError(null);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    let cleanEmail = email.trim();
    // Auto-append domain if user only typed username
    if (!cleanEmail.includes("@")) {
      cleanEmail = `${cleanEmail}@adminkampus.com`;
      setEmail(cleanEmail);
    }

    const validationError = validateEmail(cleanEmail);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!password) {
      setError("Kata sandi wajib diisi.");
      return;
    }

    setIsLoading(true);

    // Save admin session flag if needed
    try {
      localStorage.setItem(
        "ug_admin_session",
        JSON.stringify({
          email: cleanEmail,
          role: "ADMIN",
          name: "Administrator BAAK",
          loggedInAt: new Date().toISOString(),
        })
      );
    } catch (_) {}

    setTimeout(() => {
      router.push("/admin/dashboard");
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200/90 max-w-md w-full overflow-hidden">
          {/* Top Decorative Batik Ribbon */}
          <BatikPhotoRibbon className="w-full h-2" />

          <div className="p-8">
            {/* Header with Logo */}
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

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-950 border border-purple-300 shadow-xs mb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-800" />
                <span className="text-[10px] font-black uppercase tracking-wider">
                  Portal Administrator BAAK
                </span>
                <BatikRosette size={11} />
              </div>

              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Masuk Portal Admin
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Kelola data dosen, mahasiswa, jadwal perkuliahan, dan rekap presensi.
              </p>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="font-semibold">{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Email Administrator
                  </label>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-900 border border-purple-200">
                    @adminkampus.com
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
                    placeholder="nama@adminkampus.com"
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-700 text-slate-900"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Gunakan alamat email berakhiran <strong className="text-purple-950 font-semibold">@adminkampus.com</strong>
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Kata Sandi
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

              {/* Quick Fill Demo Credentials */}
              <div className="p-3.5 rounded-xl bg-purple-50/80 border border-purple-200/90 text-xs">
                <div className="flex items-center gap-1.5 text-purple-950 font-bold mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-purple-700" />
                  <span>Kredensial Cepat Administrator:</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickFill("admin@adminkampus.com", "admin123")}
                    className="px-2.5 py-1.5 rounded-lg bg-white border border-purple-200 text-left hover:border-purple-400 transition"
                  >
                    <p className="font-bold text-[11px] text-purple-950">admin@adminkampus.com</p>
                    <p className="text-[10px] text-slate-500">Pass: admin123</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickFill("baak@adminkampus.com", "baak123")}
                    className="px-2.5 py-1.5 rounded-lg bg-white border border-purple-200 text-left hover:border-purple-400 transition"
                  >
                    <p className="font-bold text-[11px] text-purple-950">baak@adminkampus.com</p>
                    <p className="text-[10px] text-slate-500">Pass: baak123</p>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-purple-900 hover:bg-purple-800 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                <span>{isLoading ? "Memproses Masuk..." : "Masuk Sebagai Admin"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Switch to Lecturer Login */}
            <div className="mt-6 pt-5 border-t border-slate-200 text-center">
              <p className="text-xs text-slate-500">
                Bukan Administrator Kampus?
              </p>
              <Link
                href="/lecturer/login"
                className="mt-1 inline-flex items-center gap-1.5 text-xs font-bold text-purple-900 hover:text-purple-700 hover:underline"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Masuk ke Portal Dosen (@dosenkampus.com)</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

