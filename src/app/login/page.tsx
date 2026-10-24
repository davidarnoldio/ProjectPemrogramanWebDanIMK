"use client";

import { useState } from "react";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  ShieldCheck,
  UserCheck,
  Smartphone,
  ArrowRight,
  Sparkles,
  Lock,
  Mail,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<"ADMIN" | "LECTURER" | "STUDENT">("ADMIN");
  const [identifier, setIdentifier] = useState("admin@ug.ac.id");
  const [password, setPassword] = useState("admin123");

  const selectRole = (newRole: "ADMIN" | "LECTURER" | "STUDENT") => {
    setRole(newRole);
    if (newRole === "ADMIN") {
      setIdentifier("admin@ug.ac.id");
      setPassword("admin123");
    } else if (newRole === "LECTURER") {
      setIdentifier("0425039002@lecturer.ug.ac.id");
      setPassword("0425039002");
    } else {
      setIdentifier("10124001");
      setPassword("10124001");
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (role === "ADMIN") {
      router.push("/admin/dashboard");
    } else if (role === "LECTURER") {
      router.push("/lecturer/dashboard");
    } else {
      router.push("/lecturer/sessions/55555555-5555-5555-5555-555555555501");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200/80 max-w-md w-full p-8">
          <div className="text-center mb-6">
            <div className="w-20 h-20 relative flex items-center justify-center mx-auto mb-3 p-1 bg-white rounded-2xl border border-purple-200 shadow-md">
              <Image
                src="/images/logogundar.png"
                alt="Logo Universitas Gunadarma"
                width={72}
                height={72}
                className="object-contain drop-shadow-sm"
                unoptimized
                priority
              />
            </div>
            <p className="text-[11px] font-black tracking-widest text-purple-900 uppercase">
              UNIVERSITAS GUNADARMA
            </p>
            <h1 className="text-xl font-black text-slate-900 mt-1">
              Masuk ke UG Attendance
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Biro Administrasi Akademik &amp; Kemahasiswaan (BAAK)
            </p>
          </div>

          {/* Role selector tabs */}
          <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1.5 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => selectRole("ADMIN")}
              className={`py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1 transition ${
                role === "ADMIN"
                  ? "bg-purple-900 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
            <button
              type="button"
              onClick={() => selectRole("LECTURER")}
              className={`py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1 transition ${
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
              onClick={() => selectRole("STUDENT")}
              className={`py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1 transition ${
                role === "STUDENT"
                  ? "bg-purple-900 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mahasiswa</span>
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {role === "STUDENT" ? "NIM Mahasiswa" : "Email Pengguna"}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Kata Sandi (Password)
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-700 font-mono"
              />
            </div>

            {/* Hint Box */}
            <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-[11px] text-purple-950 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Kredensial Default Terisi:</span>
                <p className="text-purple-800">
                  {role === "ADMIN" &&
                    "Login Admin Biro Akademik untuk mengelola dosen, mahasiswa, dan plotting jadwal."}
                  {role === "LECTURER" &&
                    "Login Dosen Pengampu untuk membuka sesi perkuliahan dan proyektor QR."}
                  {role === "STUDENT" &&
                    "Aplikasi Mobile Flutter menggunakan NIM (10124001) dan password NIM."}
                </p>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-purple-900 hover:bg-purple-800 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition"
            >
              <span>Masuk Sekarang</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
