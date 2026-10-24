"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import {
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  MessageSquare,
  Key,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  Smartphone,
  GraduationCap,
  Filter,
} from "lucide-react";
import { normalizeWhatsAppNumber } from "@/lib/utils";

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    nim: "",
    name: "",
    department: "Sistem Informasi",
    class_group: "2KA01",
    semester: 4,
    parent_phone: "",
  });

  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
    details?: string;
  } | null>(null);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/students");
      const data = await res.json();
      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const openAddModal = () => {
    setIsEditMode(false);
    setSelectedId(null);
    setFormData({
      nim: "",
      name: "",
      department: "Sistem Informasi",
      class_group: "2KA01",
      semester: 4,
      parent_phone: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: any) => {
    setIsEditMode(true);
    setSelectedId(item.id);
    setFormData({
      nim: item.nim,
      name: item.name,
      department: item.department,
      class_group: item.class_group,
      semester: item.semester,
      parent_phone: item.parent_phone,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = isEditMode
        ? `/api/admin/students/${selectedId}`
        : "/api/admin/students";
      const method = isEditMode ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || "Gagal menyimpan data mahasiswa");
      }

      setNotification({
        type: "success",
        message: isEditMode
          ? "Data mahasiswa berhasil diperbarui!"
          : "Mahasiswa dan Akun Login Mobile berhasil dibuat!",
        details: !isEditMode
          ? `Login Flutter: ${formData.nim} | Password: ${formData.nim} (Wajib Ganti Password) | WA Orang Tua: ${normalizeWhatsAppNumber(formData.parent_phone)}`
          : undefined,
      });

      setIsModalOpen(false);
      fetchStudents();
      setTimeout(() => setNotification(null), 7000);
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
        `Apakah Anda yakin ingin menghapus data mahasiswa "${name}" beserta akun login terkait?`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/students/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setNotification({
          type: "success",
          message: "Data mahasiswa berhasil dihapus.",
        });
        fetchStudents();
        setTimeout(() => setNotification(null), 4000);
      }
    } catch (err) {
      alert("Gagal menghapus mahasiswa");
    }
  };

  const uniqueClasses = Array.from(new Set(students.map((s) => s.class_group)));

  const filtered = students.filter((item) => {
    const matchSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.nim.includes(search) ||
      item.class_group.toLowerCase().includes(search.toLowerCase()) ||
      item.parent_phone.includes(search);

    const matchClass =
      classFilter === "ALL" || item.class_group === classFilter;

    return matchSearch && matchClass;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {/* Toast */}
        {notification && (
          <div
            className={`fixed top-20 right-6 z-50 p-4 rounded-xl shadow-lg border flex flex-col gap-1 transition-all max-w-lg ${
              notification.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-950"
                : "bg-rose-50 border-rose-200 text-rose-950"
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
              <p className="text-xs bg-emerald-100/70 p-2.5 rounded-lg font-mono text-emerald-900 mt-1">
                {notification.details}
              </p>
            )}
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-900 mb-1.5">
              <Users className="w-3.5 h-3.5 text-purple-700" />
              <span>Master Data Mahasiswa & Akun Mobile</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Data Mahasiswa & WhatsApp Orang Tua
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Setiap penambahan mahasiswa akan otomatis men-generate akun mobile Flutter (
              <code className="text-purple-800 font-mono">&#123;nim&#125;@student.ug.ac.id</code>) dan
              meng-enroll KRS sesuai kelas.
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="px-4 py-2.5 rounded-xl bg-purple-900 hover:bg-purple-800 text-white text-sm font-bold flex items-center gap-2 shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Mahasiswa Baru</span>
          </button>
        </div>

        {/* Search & Class Filter */}
        <div className="my-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama mahasiswa, NIM, kelas, atau nomor WhatsApp..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-700 shadow-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-700 shadow-sm"
            >
              <option value="ALL">Semua Kelas</option>
              {uniqueClasses.map((cls) => (
                <option key={cls} value={cls}>
                  Kelas {cls}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs uppercase font-bold text-slate-500 tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-6">Nama Mahasiswa</th>
                  <th className="py-3.5 px-6">NIM</th>
                  <th className="py-3.5 px-4">Kelas</th>
                  <th className="py-3.5 px-4">Semester</th>
                  <th className="py-3.5 px-6">Program Studi</th>
                  <th className="py-3.5 px-6">WhatsApp Orang Tua (Notifikasi)</th>
                  <th className="py-3.5 px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400 text-sm">
                      Tidak ada data mahasiswa yang sesuai.
                    </td>
                  </tr>
                ) : (
                  filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-purple-50/20 transition">
                      <td className="py-4 px-6 font-bold text-slate-900">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-700 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                            {item.name.charAt(0)}
                          </div>
                          <span>{item.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-mono font-bold text-xs text-purple-900">
                        {item.nim}
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-block px-2.5 py-1 rounded-md text-xs font-bold bg-purple-100 text-purple-900 border border-purple-200">
                          {item.class_group}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-semibold text-slate-700">
                        Semester {item.semester}
                      </td>
                      <td className="py-4 px-6 text-slate-700 font-medium">
                        {item.department}
                      </td>
                      <td className="py-4 px-6 font-mono text-xs">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                          <span>+{item.parent_phone}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(item)}
                            className="p-1.5 text-slate-500 hover:text-purple-900 hover:bg-purple-100 rounded-lg transition"
                            title="Edit Mahasiswa"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id, item.name)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Hapus Mahasiswa"
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

        {/* Modal Tambah / Edit Mahasiswa */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-900 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {isEditMode ? "Edit Mahasiswa" : "Tambah Mahasiswa & Auto-Auth"}
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
                {/* NIM */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    NIM (Nomor Induk Mahasiswa)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 10124001"
                    value={formData.nim}
                    onChange={(e) =>
                      setFormData({ ...formData, nim: e.target.value })
                    }
                    required
                    disabled={isEditMode}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-700 disabled:bg-slate-100"
                  />
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nama Lengkap Mahasiswa
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Ahmad Fauzi"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-700"
                  />
                </div>

                {/* Class Group & Semester */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Kelas Mahasiswa
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: 2KA01"
                      value={formData.class_group}
                      onChange={(e) =>
                        setFormData({ ...formData, class_group: e.target.value })
                      }
                      required
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-700 uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Semester
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={14}
                      value={formData.semester}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          semester: Number(e.target.value),
                        })
                      }
                      required
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-700"
                    />
                  </div>
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

                {/* Parent WhatsApp Phone */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nomor WhatsApp Orang Tua (Wajib untuk Realtime Notification)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 081299990001 atau +6281299990001"
                    value={formData.parent_phone}
                    onChange={(e) =>
                      setFormData({ ...formData, parent_phone: e.target.value })
                    }
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-700"
                  />
                  {formData.parent_phone && (
                    <p className="mt-1 text-xs text-emerald-700 font-mono">
                      Normalisasi Otomatis:{" "}
                      <strong>
                        {normalizeWhatsAppNumber(formData.parent_phone) || "-"}
                      </strong>
                    </p>
                  )}
                </div>

                {/* Auto Auth Notice */}
                {!isEditMode && (
                  <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-xs text-purple-900 space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-purple-700" />
                      <span>Otomatisasi Akun Mahasiswa (Mobile Flutter):</span>
                    </div>
                    <ul className="list-disc list-inside text-purple-800 text-[11px] space-y-0.5">
                      <li>
                        Email login:{" "}
                        <span className="font-mono font-semibold">
                          {formData.nim || "{nim}"}@student.ug.ac.id
                        </span>
                      </li>
                      <li>
                        Password default:{" "}
                        <span className="font-mono font-semibold">
                          {formData.nim || "{nim}"}
                        </span>{" "}
                        (flag: must_change_password)
                      </li>
                      <li>
                        Otomatis di-enroll ke seluruh kelas jadwal{" "}
                        <strong>{formData.class_group || "2KA01"}</strong>
                      </li>
                    </ul>
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
                    {isEditMode ? "Simpan Perubahan" : "Simpan Mahasiswa"}
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
