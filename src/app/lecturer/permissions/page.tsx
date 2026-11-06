"use client";

import { useEffect, useState } from "react";
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
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export default function LecturerPermissionsPage() {
  const [permissions, setPermissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);
  const [previewPerm, setPreviewPerm] = useState<any | null>(null);

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
        <ScrollReveal direction="up" delay={0.08}>
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
                        <button
                          type="button"
                          onClick={() => setPreviewPerm(perm)}
                          className="flex items-center gap-1 text-purple-700 font-bold hover:underline cursor-pointer"
                        >
                          <Paperclip className="w-3.5 h-3.5" />
                          <span>Lihat Lampiran Bukti / Surat Dokter</span>
                        </button>
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
        </ScrollReveal>
      </main>

      {/* Attachment Preview Modal */}
      {previewPerm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-700" />
                <h3 className="font-black text-slate-900 text-sm">
                  Pratinjau Dokumen Lampiran
                </h3>
              </div>
              <button
                onClick={() => setPreviewPerm(null)}
                className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Document Preview Card */}
            <div className="p-6 overflow-y-auto space-y-4">
              <div className="border-2 border-slate-800 rounded-xl p-5 bg-amber-50/20 font-serif relative">
                {/* Simulated Hospital/Clinic Letterhead */}
                <div className="text-center border-b-2 border-slate-800 pb-3 mb-4">
                  <h4 className="font-black text-sm tracking-wide text-slate-900 uppercase">
                    KLINIK PRATAMA UNIVERSITAS GUNADARMA
                  </h4>
                  <p className="text-[11px] text-slate-600 font-sans">
                    Jl. Margonda Raya 100, Depok • Telp. (021) 78881112
                  </p>
                  <p className="text-[10px] font-bold text-purple-900 uppercase font-sans mt-1">
                    SURAT KETERANGAN DOKTER / DISPENSASI KESEHATAN
                  </p>
                </div>

                <div className="space-y-2 text-xs font-sans text-slate-800">
                  <div className="flex">
                    <span className="w-28 text-slate-500">Nama Pasien:</span>
                    <strong className="text-slate-900 font-bold">
                      {previewPerm.students?.name || "Ahmad Fauzi"}
                    </strong>
                  </div>
                  <div className="flex">
                    <span className="w-28 text-slate-500">NIM / Kelas:</span>
                    <span>
                      {previewPerm.students?.nim || "10124001"} •{" "}
                      {previewPerm.students?.class_group || "2KA01"}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="w-28 text-slate-500">Jenis Izin:</span>
                    <span className="font-bold text-purple-800 uppercase">
                      {previewPerm.type}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="w-28 text-slate-500">Alasan Medis:</span>
                    <span className="font-medium italic">
                      &ldquo;{previewPerm.reason}&rdquo;
                    </span>
                  </div>
                  <div className="flex">
                    <span className="w-28 text-slate-500">Tautan Berkas:</span>
                    <a
                      href={previewPerm.attachment_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-purple-700 underline truncate max-w-[200px]"
                    >
                      {previewPerm.attachment_url}
                    </a>
                  </div>
                </div>

                <div className="mt-6 pt-3 border-t border-slate-300 flex justify-end font-sans text-[11px] text-slate-700">
                  <div className="text-center">
                    <p>Dokter Pemeriksa,</p>
                    <div className="h-10 flex items-center justify-center">
                      <span className="text-[10px] text-purple-900 font-mono font-bold border border-purple-300 px-2 py-0.5 rounded bg-purple-50">
                        TERVERIFIKASI
                      </span>
                    </div>
                    <p className="font-bold underline">
                      dr. Hendra Pratama, Sp.PD
                    </p>
                    <p className="text-[10px] text-slate-500">SIP: 446/1029/DISKES</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Status saat ini:{" "}
                <strong className="text-slate-900">{previewPerm.status}</strong>
              </span>
              {previewPerm.status === "PENDING" ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      handleAction(previewPerm.id, "REJECTED");
                      setPreviewPerm(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
                  >
                    <X className="w-4 h-4" />
                    <span>Tolak</span>
                  </button>
                  <button
                    onClick={() => {
                      handleAction(previewPerm.id, "APPROVED");
                      setPreviewPerm(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
                  >
                    <Check className="w-4 h-4" />
                    <span>Setujui</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setPreviewPerm(null)}
                  className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition"
                >
                  Tutup
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
