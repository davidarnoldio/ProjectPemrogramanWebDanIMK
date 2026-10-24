"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import {
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  BookOpen,
  Paperclip,
  Check,
  X,
  AlertCircle,
} from "lucide-react";
import { formatIndonesianDateTime } from "@/lib/utils";

export default function LecturerPermissionsPage() {
  const [permissions, setPermissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/student/permissions");
      const data = await res.json();
      setPermissions(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  const handleAction = async (
    permissionId: string,
    status: "APPROVED" | "REJECTED"
  ) => {
    try {
      const res = await fetch("/api/student/permissions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissionId, status }),
      });
      const data = await res.json();
      if (res.ok) {
        setNotification(
          `Pengajuan izin berhasil di-${
            status === "APPROVED" ? "setujui (APPROVED)" : "tolak (REJECTED)"
          }`
        );
        fetchPermissions();
        setTimeout(() => setNotification(null), 4000);
      }
    } catch (e) {
      alert("Gagal memproses dispensasi");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {notification && (
          <div className="fixed top-20 right-6 z-50 p-4 rounded-xl shadow-lg border bg-emerald-50 border-emerald-200 text-emerald-900 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span className="text-sm font-bold">{notification}</span>
          </div>
        )}

        <div className="pb-6 border-b border-slate-200">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-900 mb-1.5">
            <FileText className="w-3.5 h-3.5 text-purple-700" />
            <span>Verifikasi Dispensasi Mahasiswa</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Persetujuan Surat Izin & Keterangan Sakit
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Tinjau dan verifikasi surat permohonan izin atau surat keterangan sakit dokter yang diajukan mahasiswa.
          </p>
        </div>

        {/* List of Permissions */}
        <div className="my-8 space-y-4">
          {permissions.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-30 text-purple-600" />
              <h3 className="font-bold text-base text-slate-700">
                Tidak Ada Pengajuan Dispensasi Baru
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Semua surat permohonan izin mahasiswa telah diverifikasi atau belum ada pengajuan baru.
              </p>
            </div>
          ) : (
            permissions.map((perm) => (
              <div
                key={perm.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2.5 py-1 rounded-md text-xs font-black uppercase ${
                        perm.type === "SAKIT"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {perm.type}
                    </span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        perm.status === "PENDING"
                          ? "bg-slate-100 text-slate-700"
                          : perm.status === "APPROVED"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      Status: {perm.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900">
                    {perm.students?.name || "Mahasiswa"} (NIM:{" "}
                    {perm.students?.nim || "-"}) • Kelas {perm.students?.class_group}
                  </h3>

                  <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    &ldquo;{perm.reason}&rdquo;
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {formatIndonesianDateTime(perm.created_at)}
                    </span>
                    {perm.attachment_url && (
                      <a
                        href={perm.attachment_url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-purple-700 font-bold hover:underline"
                      >
                        <Paperclip className="w-3.5 h-3.5" />
                        <span>Lihat Lampiran Bukti / Surat Dokter</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Approval buttons */}
                {perm.status === "PENDING" ? (
                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    <button
                      onClick={() => handleAction(perm.id, "APPROVED")}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
                    >
                      <Check className="w-4 h-4" />
                      <span>Setujui</span>
                    </button>
                    <button
                      onClick={() => handleAction(perm.id, "REJECTED")}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
                    >
                      <X className="w-4 h-4" />
                      <span>Tolak</span>
                    </button>
                  </div>
                ) : (
                  <div className="shrink-0">
                    <span className="text-xs font-bold text-slate-400">
                      Telah Diproses
                    </span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
