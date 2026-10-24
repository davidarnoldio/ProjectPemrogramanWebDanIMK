"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import {
  Calendar,
  Plus,
  Search,
  Edit2,
  Trash2,
  Clock,
  MapPin,
  User,
  BookOpen,
  Filter,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
} from "lucide-react";

export default function AdminSchedulesPage() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [lecturers, setLecturers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [dayFilter, setDayFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    course_id: "",
    lecturer_id: "",
    class_name: "2KA01",
    room: "",
    schedule_day: "Senin",
    start_time: "08:00",
    end_time: "10:30",
    academic_year: "2026/2027 Ganjil",
  });

  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [schedRes, courseRes, lectRes] = await Promise.all([
        fetch("/api/admin/schedules"),
        fetch("/api/admin/courses"),
        fetch("/api/admin/lecturers"),
      ]);
      const [sData, cData, lData] = await Promise.all([
        schedRes.json(),
        courseRes.json(),
        lectRes.json(),
      ]);

      setSchedules(Array.isArray(sData) ? sData : []);
      setCourses(Array.isArray(cData) ? cData : []);
      setLecturers(Array.isArray(lData) ? lData : []);

      if (cData.length > 0 && !formData.course_id) {
        setFormData((prev) => ({
          ...prev,
          course_id: cData[0].id,
          lecturer_id: lData[0]?.id || "",
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const openAddModal = () => {
    setIsEditMode(false);
    setSelectedId(null);
    setFormData({
      course_id: courses[0]?.id || "",
      lecturer_id: lecturers[0]?.id || "",
      class_name: "2KA01",
      room: "Ruang D401 - Kampus D",
      schedule_day: "Senin",
      start_time: "08:00",
      end_time: "10:30",
      academic_year: "2026/2027 Ganjil",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: any) => {
    setIsEditMode(true);
    setSelectedId(item.id);
    setFormData({
      course_id: item.course_id,
      lecturer_id: item.lecturer_id,
      class_name: item.class_name,
      room: item.room,
      schedule_day: item.schedule_day,
      start_time: item.start_time,
      end_time: item.end_time,
      academic_year: item.academic_year || "2026/2027 Ganjil",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = isEditMode
        ? `/api/admin/schedules/${selectedId}`
        : "/api/admin/schedules";
      const method = isEditMode ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || "Gagal menyimpan jadwal");
      }

      setNotification({
        type: "success",
        message: isEditMode
          ? "Jadwal perkuliahan berhasil diperbarui!"
          : "Jadwal perkuliahan baru berhasil ditambahkan!",
      });

      setIsModalOpen(false);
      fetchAll();
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      setNotification({
        type: "error",
        message: err.message || "Terjadi kesalahan",
      });
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (
      !confirm(
        `Apakah Anda yakin ingin menghapus jadwal perkuliahan untuk kelas ${name}?`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/schedules/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setNotification({
          type: "success",
          message: "Jadwal perkuliahan berhasil dihapus.",
        });
        fetchAll();
        setTimeout(() => setNotification(null), 4000);
      }
    } catch (err) {
      alert("Gagal menghapus jadwal");
    }
  };

  const filtered = schedules.filter((item) => {
    const matchSearch =
      (item.courses?.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.class_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.lecturers?.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.room || "").toLowerCase().includes(search.toLowerCase());

    const matchDay = dayFilter === "ALL" || item.schedule_day === dayFilter;

    return matchSearch && matchDay;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {/* Toast Notification */}
        {notification && (
          <div
            className={`fixed top-20 right-6 z-50 p-4 rounded-xl shadow-lg border flex items-center gap-3 transition-all ${
              notification.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-rose-50 border-rose-200 text-rose-800"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600" />
            )}
            <span className="text-sm font-semibold">{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="ml-2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-900 mb-1.5">
              <Calendar className="w-3.5 h-3.5 text-purple-700" />
              <span>Manajemen Perkuliahan Kampus</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Jadwal Perkuliahan & Plotting Dosen
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Atur dan kelola pemetaan mata kuliah, dosen pengampu, waktu mengajar, dan ruangan kelas.
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="px-4 py-2.5 rounded-xl bg-purple-900 hover:bg-purple-800 text-white text-sm font-bold flex items-center gap-2 shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Jadwal Kuliah</span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="my-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari mata kuliah, kelas (2KA01), dosen, atau ruangan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-700 shadow-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={dayFilter}
              onChange={(e) => setDayFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-700 shadow-sm"
            >
              <option value="ALL">Semua Hari</option>
              <option value="Senin">Senin</option>
              <option value="Selasa">Selasa</option>
              <option value="Rabu">Rabu</option>
              <option value="Kamis">Kamis</option>
              <option value="Jumat">Jumat</option>
              <option value="Sabtu">Sabtu</option>
            </select>
          </div>
        </div>

        {/* Schedules Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs uppercase font-bold text-slate-500 tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-6">Mata Kuliah & SKS</th>
                  <th className="py-3.5 px-4">Kelas</th>
                  <th className="py-3.5 px-6">Dosen Pengampu</th>
                  <th className="py-3.5 px-6">Hari & Jam</th>
                  <th className="py-3.5 px-6">Ruangan</th>
                  <th className="py-3.5 px-4">Tahun Akademik</th>
                  <th className="py-3.5 px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400 text-sm">
                      Tidak ada jadwal perkuliahan yang cocok dengan pencarian.
                    </td>
                  </tr>
                ) : (
                  filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-purple-50/20 transition">
                      <td className="py-4 px-6 font-semibold text-slate-900">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-purple-700 shrink-0" />
                          <span>{item.courses?.name || "Mata Kuliah"}</span>
                        </div>
                        <div className="text-xs text-purple-700 font-mono font-medium pl-6">
                          {item.courses?.code} • {item.courses?.sks} SKS
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-block px-2.5 py-1 rounded-md text-xs font-bold bg-purple-100 text-purple-900 border border-purple-200">
                          {item.class_name}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-medium text-slate-800">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{item.lecturers?.name || "Dosen"}</span>
                        </div>
                        <div className="text-xs text-slate-400 font-mono pl-5">
                          NIDN: {item.lecturers?.nidn || "-"}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-semibold text-slate-800">{item.schedule_day}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>
                            {item.start_time} - {item.end_time} WIB
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-medium text-slate-700">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{item.room}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-xs font-medium text-slate-500">
                        {item.academic_year || "2026/2027 Ganjil"}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(item)}
                            className="p-1.5 text-slate-500 hover:text-purple-900 hover:bg-purple-100 rounded-lg transition"
                            title="Edit Jadwal"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              handleDelete(item.id, `${item.courses?.name} (${item.class_name})`)
                            }
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Hapus Jadwal"
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

        {/* Modal Tambah / Edit Jadwal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-900 flex items-center justify-center">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {isEditMode ? "Edit Jadwal Perkuliahan" : "Tambah Jadwal Perkuliahan"}
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
                {/* Course Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Mata Kuliah
                  </label>
                  <select
                    value={formData.course_id}
                    onChange={(e) =>
                      setFormData({ ...formData, course_id: e.target.value })
                    }
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-700"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code} — {c.name} ({c.sks} SKS)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Lecturer Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Dosen Pengampu
                  </label>
                  <select
                    value={formData.lecturer_id}
                    onChange={(e) =>
                      setFormData({ ...formData, lecturer_id: e.target.value })
                    }
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-700"
                  >
                    {lecturers.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name} (NIDN: {l.nidn})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Class Name & Academic Year */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Nama Kelas
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: 2KA01"
                      value={formData.class_name}
                      onChange={(e) =>
                        setFormData({ ...formData, class_name: e.target.value })
                      }
                      required
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Tahun Akademik
                    </label>
                    <input
                      type="text"
                      value={formData.academic_year}
                      onChange={(e) =>
                        setFormData({ ...formData, academic_year: e.target.value })
                      }
                      required
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-700"
                    />
                  </div>
                </div>

                {/* Day, Start Time, End Time */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Hari
                    </label>
                    <select
                      value={formData.schedule_day}
                      onChange={(e) =>
                        setFormData({ ...formData, schedule_day: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-700"
                    >
                      <option value="Senin">Senin</option>
                      <option value="Selasa">Selasa</option>
                      <option value="Rabu">Rabu</option>
                      <option value="Kamis">Kamis</option>
                      <option value="Jumat">Jumat</option>
                      <option value="Sabtu">Sabtu</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Jam Mulai
                    </label>
                    <input
                      type="text"
                      placeholder="07:30"
                      value={formData.start_time}
                      onChange={(e) =>
                        setFormData({ ...formData, start_time: e.target.value })
                      }
                      required
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Jam Selesai
                    </label>
                    <input
                      type="text"
                      placeholder="10:00"
                      value={formData.end_time}
                      onChange={(e) =>
                        setFormData({ ...formData, end_time: e.target.value })
                      }
                      required
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-700"
                    />
                  </div>
                </div>

                {/* Room */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Ruang Kelas / Laboratorium
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Lab Sistem Informasi E301 atau Ruang D401"
                    value={formData.room}
                    onChange={(e) =>
                      setFormData({ ...formData, room: e.target.value })
                    }
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-700"
                  />
                </div>

                {/* Action Buttons */}
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
                    {isEditMode ? "Simpan Perubahan" : "Simpan Jadwal"}
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
