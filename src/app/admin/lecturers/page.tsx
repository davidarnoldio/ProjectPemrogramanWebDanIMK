"use client";

import { useEffect, useState } from "react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import {
  UserCheck,
  Plus,
  Search,
  Edit2,
  Trash2,
  Mail,
  Phone,
  Key,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  Building,
} from "lucide-react";

export default function AdminLecturersPage() {
  const [lecturers, setLecturers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    nidn: "",
    name: "",
    department: "Sistem Informasi",
    email: "",
    phone: "",
  });

  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
    details?: string;
  } | null>(null);

  const fetchLecturers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/lecturers");
      const data = await res.json();
      setLecturers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLecturers();
  }, []);

  const openAddModal = () => {
    setIsEditMode(false);
    setSelectedId(null);
    setFormData({
      nidn: "",
      name: "",
      department: "Sistem Informasi",
      email: "",
      phone: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: any) => {
    setIsEditMode(true);
    setSelectedId(item.id);
    setFormData({
      nidn: item.nidn,
      name: item.name,
      department: item.department,
      email: item.email,
      phone: item.phone || "",
    });
    setIsModalOpen(true);
  };

  const handleNidnChange = (val: string) => {
    setFormData((prev) => ({
      ...prev,
      nidn: val,
      email: isEditMode ? prev.email : val ? `${val}@dosenkampus.com` : "",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = isEditMode
        ? `/api/admin/lecturers/${selectedId}`
        : "/api/admin/lecturers";
      const method = isEditMode ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || "Gagal menyimpan data dosen");
      }

      setNotification({
        type: "success",
        message: isEditMode
          ? "Data dosen berhasil diperbarui!"
          : "Dosen dan Akun Login otomatis berhasil dibuat!",
        details: !isEditMode
          ? `Email: ${formData.nidn}@dosenkampus.com | Password: ${formData.nidn}`
          : undefined,
      });

      setIsModalOpen(false);
      fetchLecturers();
      setTimeout(() => setNotification(null), 6000);
    } catch (err: any) {
      setNotification({
        type: "error",
        message: err.message || "Terjadi kesalahan",
      });
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (
      !confirm(
        `Apakah Anda yakin ingin menghapus data dosen "${name}" beserta akun login terkait?`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/lecturers/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setNotification({
          type: "success",
          message: "Data dosen berhasil dihapus.",
        });
        fetchLecturers();
        setTimeout(() => setNotification(null), 4000);
      }
    } catch (err) {
      alert("Gagal menghapus dosen");
    }
  };

  const filtered = lecturers.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.nidn.includes(search) ||
      item.department.toLowerCase().includes(search.toLowerCase()) ||
      item.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {/* Toast Notification */}
        {notification && (
          <div
            className={`fixed top-20 right-6 z-50 p-4 rounded-xl shadow-lg border flex flex-col gap-1 transition-all max-w-md ${
              notification.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                : "bg-rose-50 border-rose-200 text-rose-900"
            }`}
          >
            <div className="flex items-center gap-2">
              {notification.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600" />
              )}
              <span className="text-sm font-bold">{notification.message}</span>
              <button
                onClick={() => setNotification(null)}
                className="ml-auto text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {notification.details && (
              <p className="text-xs bg-emerald-100/70 p-2 rounded-lg font-mono text-emerald-800 mt-1">
                {notification.details}
              </p>
            )}
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-900 mb-1.5">
              <UserCheck className="w-3.5 h-3.5 text-purple-700" />
              <span>Master Data Dosen & Tenaga Pengajar</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Data Dosen Pengampu
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Kelola profil dosen. Akun login dibuat otomatis pada domain{" "}
              <code className="text-purple-800 font-mono">@lecturer.ug.ac.id</code>.
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="px-4 py-2.5 rounded-xl bg-purple-900 hover:bg-purple-800 text-white text-sm font-bold flex items-center gap-2 shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Dosen Baru</span>
          </button>
        </div>

        {/* Search */}
        <ScrollReveal direction="up" delay={0.05}>
          <div className="my-6">
            <div className="relative max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama, NIDN, program studi, atau email dosen..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-700 shadow-sm"
              />
            </div>
          </div>
        </ScrollReveal>

        {/* Table */}
        <ScrollReveal direction="up" delay={0.1}>
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs uppercase font-bold text-slate-500 tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-6">Nama Lengkap & Gelar</th>
                  <th className="py-3.5 px-6">NIDN</th>
                  <th className="py-3.5 px-6">Program Studi</th>
                  <th className="py-3.5 px-6">Email Login Resmi</th>
                  <th className="py-3.5 px-6">No. WhatsApp / HP</th>
                  <th className="py-3.5 px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400 text-sm">
                      Tidak ada data dosen yang sesuai.
                    </td>
                  </tr>
                ) : (
                  filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-purple-50/20 transition">
                      <td className="py-4 px-6 font-bold text-slate-900">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-900 font-black text-xs flex items-center justify-center">
                            {item.name.charAt(0)}
                          </div>
                          <span>{item.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-mono text-purple-900 font-bold text-xs">
                        {item.nidn}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <Building className="w-3.5 h-3.5 text-slate-400" />
                          <span>{item.department}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-mono text-xs text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span>{item.email}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-600">
                        <div className="flex items-center gap-1.5 text-xs">
                          <Phone className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{item.phone || "-"}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(item)}
                            className="p-1.5 text-slate-500 hover:text-purple-900 hover:bg-purple-100 rounded-lg transition"
                            title="Edit Dosen"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id, item.name)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Hapus Dosen"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        </ScrollReveal>

        {/* Modal Tambah / Edit Dosen */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-900 flex items-center justify-center">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {isEditMode ? "Edit Profil Dosen" : "Tambah Dosen & Buat Akun"}
                  </h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                {/* NIDN */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    NIDN (Nomor Induk Dosen Nasional)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 0412088501"
                    value={formData.nidn}
                    onChange={(e) => handleNidnChange(e.target.value)}
                    required
                    disabled={isEditMode}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-700 disabled:bg-slate-100"
                  />
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nama Lengkap & Gelar Akademik
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Dr. Budi Santoso, S.Kom., M.M.S.I."
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-700"
                  />
                </div>

                {/* Department */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Program Studi
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) =>
                      setFormData({ ...formData, department: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-700"
                  >
                    <option value="Sistem Informasi">Sistem Informasi</option>
                    <option value="Teknik Informatika">Teknik Informatika</option>
                    <option value="Sistem Komputer">Sistem Komputer</option>
                    <option value="Teknologi Informasi">Teknologi Informasi</option>
                  </select>
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Email Akun
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      required
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      No. WhatsApp / HP
                    </label>
                    <input
                      type="text"
                      placeholder="62812xxxxxxx"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-700"
                    />
                  </div>
                </div>

                {/* Auto-create credential preview notice */}
                {!isEditMode && (
                  <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-xs text-purple-900 flex items-start gap-2">
                    <Key className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Otomatisasi Akun Login:</span>
                      <p className="mt-0.5 text-purple-800">
                        Akun dosen dibuat otomatis dengan email{" "}
                        <span className="font-mono font-semibold">
                          {formData.nidn || "{nidn}"}@dosenkampus.com
                        </span>{" "}
                        dan password awal default adalah NIDN dosen.
                      </p>
                    </div>
                  </div>
                )}

                {/* Buttons */}
                <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-sm font-bold bg-purple-900 hover:bg-purple-800 text-white shadow-sm transition"
                  >
                    {isEditMode ? "Simpan Perubahan" : "Simpan Dosen"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
