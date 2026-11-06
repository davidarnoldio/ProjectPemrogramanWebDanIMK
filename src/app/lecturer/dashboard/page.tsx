"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  BookOpen,
  MapPin,
  Clock,
  Play,
  QrCode,
  Users,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Radio,
  FileText,
  AlertCircle,
  X,
  Plus,
  Upload,
  Download,
  Trash2,
  FileSpreadsheet,
  Check,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export default function LecturerDashboardPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [schedules, setSchedules] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [lecturers, setLecturers] = useState<any[]>([]);
  const [selectedLecturerId, setSelectedLecturerId] = useState<string>(
    "11111111-1111-1111-1111-111111111102" // Rina Wijaya, S.T., M.Kom.
  );
  const [loading, setLoading] = useState(true);

  // Notification Banner
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Modal: Buka Sesi Presensi
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [sessionForm, setSessionForm] = useState({
    class_id: "",
    meeting_number: 1,
    topic: "Implementasi Database Relasional & Query Optimization",
    custom_room: "",
    is_rescheduled: false,
  });

  // Modal: Tambah Jadwal Manual
  const [isAddScheduleModalOpen, setIsAddScheduleModalOpen] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    course_id: "",
    class_name: "2KA01",
    room: "Lab Sistem Informasi E301",
    schedule_day: "Selasa",
    start_time: "10:30",
    end_time: "13:00",
    academic_year: "2026/2027 Ganjil",
  });

  // Modal: Upload Jadwal (CSV / File)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [schedRes, sessRes, lectRes, courseRes] = await Promise.all([
        fetch("/api/admin/schedules"),
        fetch("/api/lecturer/sessions"),
        fetch("/api/admin/lecturers"),
        fetch("/api/admin/courses"),
      ]);

      const [schedData, sessData, lectData, courseData] = await Promise.all([
        schedRes.json(),
        sessRes.json(),
        lectRes.json(),
        courseRes.json(),
      ]);

      setSchedules(Array.isArray(schedData) ? schedData : []);
      setSessions(Array.isArray(sessData) ? sessData : []);
      setLecturers(Array.isArray(lectData) ? lectData : []);
      const validCourses = Array.isArray(courseData) ? courseData : [];
      setCourses(validCourses);

      if (validCourses.length > 0 && !scheduleForm.course_id) {
        setScheduleForm((prev) => ({ ...prev, course_id: validCourses[0].id }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter schedules for the selected lecturer
  const mySchedules = schedules.filter(
    (s) => s.lecturer_id === selectedLecturerId
  );
  const activeSession = sessions.find((s) => s.status === "OPEN");
  const currentLecturer = lecturers.find((l) => l.id === selectedLecturerId);

  // Update default selected class in session form when schedules change
  useEffect(() => {
    if (mySchedules.length > 0) {
      setSessionForm((prev) => ({
        ...prev,
        class_id: mySchedules[0].id,
      }));
    }
  }, [selectedLecturerId, schedules]);

  const openSessionModal = (classId?: string) => {
    if (mySchedules.length === 0) {
      showNotification(
        "error",
        "Anda belum memiliki jadwal mengajar. Silakan tambahkan atau upload jadwal terlebih dahulu."
      );
      setIsAddScheduleModalOpen(true);
      return;
    }

    if (classId) {
      setSessionForm((prev) => ({ ...prev, class_id: classId }));
    } else if (mySchedules.length > 0) {
      setSessionForm((prev) => ({ ...prev, class_id: mySchedules[0].id }));
    }
    setIsSessionModalOpen(true);
  };

  const handleStartSession = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/lecturer/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sessionForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal membuka sesi");

      setIsSessionModalOpen(false);
      router.push(`/lecturer/sessions/${data.data.id}`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...scheduleForm,
        lecturer_id: selectedLecturerId,
      };

      const res = await fetch("/api/admin/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menambahkan jadwal");

      showNotification("success", "Jadwal mengajar berhasil ditambahkan!");
      setIsAddScheduleModalOpen(false);
      await fetchData();
    } catch (err: any) {
      showNotification("error", err.message);
    }
  };

  const handleDeleteSchedule = async (classId: string, className: string, courseName: string) => {
    const confirmDelete = window.confirm(
      `Apakah Anda yakin ingin menghapus jadwal mengajar kelas ${className} (${courseName})?`
    );
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/admin/schedules/${classId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menghapus jadwal");

      showNotification("success", "Jadwal mengajar berhasil dihapus.");
      await fetchData();
    } catch (err: any) {
      showNotification("error", err.message);
    }
  };

  // CSV Template Downloader
  const downloadCsvTemplate = () => {
    const headers = "Kode_MK,Nama_MK,Kelas,Ruang,Hari,Jam_Mulai,Jam_Selesai,SKS";
    const sampleRows = [
      "AK045202,Pemrograman Web Berbasis Framework,2KA01,Lab Sistem Informasi E301,Selasa,10:30,13:00,3",
      "AK045203,Sistem Basis Data Lanjut,2KA01,Lab Sistem Informasi E302,Rabu,08:00,10:30,3",
      "AK045201,Analisis & Perancangan Sistem Informasi,2KA01,Ruang D401 - Kampus D,Senin,07:30,10:00,3",
    ];
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...sampleRows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "template_jadwal_mengajar_gunadarma.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV File Handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadFile(file);
    setUploadError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) throw new Error("File kosong");

        const lines = text
          .split(/\r?\n/)
          .map((l) => l.trim())
          .filter((l) => l.length > 0);

        if (lines.length < 2) {
          throw new Error("File CSV harus memiliki baris header dan minimal 1 baris jadwal.");
        }

        const delimiter = lines[0].includes(";") ? ";" : ",";
        const header = lines[0].split(delimiter).map((h) => h.trim().toLowerCase());

        const rows: any[] = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(delimiter).map((c) => c.trim().replace(/^["']|["']$/g, ""));
          if (cols.length < 5) continue;

          // Map columns flexibly
          const rowObj: any = {
            course_code: cols[0] || "",
            course_name: cols[1] || "",
            class_name: cols[2] || "2KA01",
            room: cols[3] || "Ruang Kuliah",
            schedule_day: cols[4] || "Senin",
            start_time: cols[5] || "08:00",
            end_time: cols[6] || "10:30",
            sks: Number(cols[7]) || 3,
            academic_year: "2026/2027 Ganjil",
          };

          if (rowObj.course_name && rowObj.class_name) {
            rows.push(rowObj);
          }
        }

        if (rows.length === 0) {
          throw new Error("Tidak ada data jadwal valid yang dapat diproses dari CSV.");
        }

        setParsedRows(rows);
      } catch (err: any) {
        setUploadError(err.message || "Gagal membaca file CSV.");
        setParsedRows([]);
      }
    };
    reader.readAsText(file);
  };

  const handleProcessBatchUpload = async () => {
    if (parsedRows.length === 0) {
      setUploadError("Pilih dan upload file CSV jadwal yang valid terlebih dahulu.");
      return;
    }

    try {
      setIsUploading(true);
      setUploadError(null);

      const itemsWithLecturer = parsedRows.map((r) => ({
        ...r,
        lecturer_id: selectedLecturerId,
      }));

      const res = await fetch("/api/admin/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: itemsWithLecturer }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengunggah jadwal.");

      showNotification("success", `${parsedRows.length} jadwal mengajar berhasil diunggah!`);
      setIsUploadModalOpen(false);
      setUploadFile(null);
      setParsedRows([]);
      await fetchData();
    } catch (err: any) {
      setUploadError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {/* Notification Alert */}
        {notification && (
          <div
            className={`mb-6 p-4 rounded-2xl flex items-center justify-between gap-3 text-sm font-bold shadow-sm transition-all ${
              notification.type === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-rose-50 text-rose-800 border border-rose-200"
            }`}
          >
            <div className="flex items-center gap-2.5">
              {notification.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              )}
              <span>{notification.message}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Header with Lecturer Profile Switcher & Actions */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-200">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-14 h-14 relative flex items-center justify-center shrink-0 p-1.5 bg-white rounded-2xl border border-purple-200 shadow-sm">
              <Image
                src="/images/logogundar.png"
                alt="Logo Gunadarma"
                width={48}
                height={48}
                className="object-contain"
                unoptimized
              />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-900 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-purple-700" />
                <span>Portal Dosen Pengampu • Universitas Gunadarma</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Jadwal Mengajar &amp; Kontrol Presensi
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Selamat datang,{" "}
                <strong className="text-purple-900 font-bold">
                  {currentLecturer?.name || "Dosen Pengampu"}
                </strong>{" "}
                (NIDN: {currentLecturer?.nidn || "-"} • Departemen: {currentLecturer?.department || "-"})
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Lecturer Switcher Dropdown */}
            <select
              value={selectedLecturerId}
              onChange={(e) => setSelectedLecturerId(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-700 cursor-pointer"
            >
              {lecturers.map((l) => (
                <option key={l.id} value={l.id}>
                  Dosen: {l.name}
                </option>
              ))}
            </select>

            {/* Upload File Jadwal Button */}
            <button
              onClick={() => {
                setUploadError(null);
                setParsedRows([]);
                setUploadFile(null);
                setIsUploadModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold flex items-center gap-2 border border-slate-200 shadow-xs transition"
            >
              <Upload className="w-4 h-4 text-purple-900" />
              <span>Upload Jadwal (CSV)</span>
            </button>

            {/* Tambah Jadwal Manual Button */}
            <button
              onClick={() => setIsAddScheduleModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-900 text-xs font-bold flex items-center gap-2 border border-purple-200 shadow-xs transition"
            >
              <Plus className="w-4 h-4 text-purple-900" />
              <span>Tambah Jadwal Manual</span>
            </button>

            {/* Buka Sesi Presensi Button */}
            <button
              onClick={() => openSessionModal()}
              className="px-4 py-2.5 rounded-xl bg-purple-950 hover:bg-purple-900 text-white text-xs font-bold flex items-center gap-2 shadow-md transition"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Buka Sesi Presensi</span>
            </button>
          </div>
        </div>

        {/* Active Open Session Banner */}
        {activeSession && (
          <div className="my-6 p-6 rounded-3xl bg-gradient-to-r from-purple-950 via-indigo-950 to-purple-900 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-purple-800/40">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-lg">
                <Radio className="w-7 h-7 animate-pulse text-slate-950" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-400/20 text-amber-300 border border-amber-300/30 uppercase tracking-wider mb-1">
                  SESI SEDANG DIBUKA DI KELAS
                </div>
                <h3 className="text-xl font-bold">
                  {activeSession.classes?.courses?.name} ({activeSession.classes?.class_name})
                </h3>
                <p className="text-purple-200 text-xs mt-1">
                  Pertemuan ke-{activeSession.meeting_number} • Topik: {activeSession.topic} • Ruangan:{" "}
                  {activeSession.custom_room || activeSession.classes?.room}
                </p>
              </div>
            </div>

            <Link
              href={`/lecturer/sessions/${activeSession.id}`}
              className="px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center gap-2 shadow-lg transition transform hover:-translate-y-0.5"
            >
              <QrCode className="w-5 h-5" />
              <span>Buka Layar Proyektor QR</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Teaching Schedule Cards Grid */}
        <ScrollReveal direction="up" delay={0.08}>
          <div className="my-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900">
                    Jadwal Mengajar Anda
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-200/80 text-slate-700">
                    {mySchedules.length} Kelas
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Daftar mata kuliah dan kelas yang diampu pada Semester Ganjil 2026/2027
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={downloadCsvTemplate}
                  className="text-xs text-purple-900 hover:text-purple-700 font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-purple-50 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Template CSV</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mySchedules.length === 0 ? (
              <div className="col-span-full bg-white rounded-3xl p-10 sm:p-14 text-center border-2 border-dashed border-purple-200/80 shadow-xs">
                <div className="w-16 h-16 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center mx-auto mb-4 text-purple-900 shadow-inner">
                  <Calendar className="w-8 h-8 text-purple-800" />
                </div>
                <h3 className="font-extrabold text-lg text-slate-900">
                  Belum Ada Jadwal Mengajar
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1.5 leading-relaxed">
                  Data dummy jadwal perkuliahan telah dikosongkan. Silakan unggah (upload) file jadwal mengajar Anda (CSV/Excel) atau tambahkan secara manual di bawah ini.
                </p>

                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      setUploadError(null);
                      setParsedRows([]);
                      setUploadFile(null);
                      setIsUploadModalOpen(true);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-purple-900 hover:bg-purple-800 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload File Jadwal (CSV)</span>
                  </button>

                  <button
                    onClick={() => setIsAddScheduleModalOpen(true)}
                    className="px-5 py-2.5 rounded-xl bg-white hover:bg-purple-50 text-purple-900 text-xs font-bold flex items-center gap-2 border border-purple-200 shadow-xs transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Jadwal Manual</span>
                  </button>
                </div>

                <div className="mt-5 text-[11px] text-slate-400 flex items-center justify-center gap-1">
                  <span>Format file didukung: CSV (Kode_MK, Nama_MK, Kelas, Ruang, Hari, Jam)</span>
                </div>
              </div>
            ) : (
              mySchedules.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-1 rounded-md text-xs font-black bg-purple-100 text-purple-900 border border-purple-200">
                        {item.class_name}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-400">
                          {item.courses?.code || "MK-UG"}
                        </span>
                        <button
                          onClick={() =>
                            handleDeleteSchedule(item.id, item.class_name, item.courses?.name || "")
                          }
                          title="Hapus Jadwal"
                          className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-600 transition p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h3 className="font-extrabold text-base text-slate-900 line-clamp-2">
                      {item.courses?.name || "Mata Kuliah"}
                    </h3>
                    <p className="text-xs text-purple-900 font-bold mt-1">
                      {item.courses?.sks || 3} SKS • {item.courses?.department || "Sistem Informasi"}
                    </p>

                    <div className="mt-5 space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="font-semibold text-slate-800">
                          {item.schedule_day}, {item.start_time} - {item.end_time} WIB
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="truncate">{item.room}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2">
                    <button
                      onClick={() => openSessionModal(item.id)}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-purple-950 hover:bg-purple-900 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Buka Sesi Presensi di Kelas</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        </ScrollReveal>

        {/* ============================================================== */}
        {/* MODAL 1: Tambah Jadwal Mengajar Manual                         */}
        {/* ============================================================== */}
        {isAddScheduleModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-900 flex items-center justify-center">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      Tambah Jadwal Mengajar Manual
                    </h3>
                    <p className="text-xs text-slate-500">
                      Untuk Dosen: {currentLecturer?.name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAddScheduleModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddSchedule} className="mt-5 space-y-4">
                {/* Mata Kuliah Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Mata Kuliah
                  </label>
                  <select
                    value={scheduleForm.course_id}
                    onChange={(e) =>
                      setScheduleForm({ ...scheduleForm, course_id: e.target.value })
                    }
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-700 bg-white"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code} — {c.name} ({c.sks} SKS)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Kelas & Ruangan */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Kelas Mahasiswa
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: 2KA01"
                      value={scheduleForm.class_name}
                      onChange={(e) =>
                        setScheduleForm({ ...scheduleForm, class_name: e.target.value })
                      }
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Ruangan Perkuliahan
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Lab E301 / D401"
                      value={scheduleForm.room}
                      onChange={(e) =>
                        setScheduleForm({ ...scheduleForm, room: e.target.value })
                      }
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-700"
                    />
                  </div>
                </div>

                {/* Hari & Waktu */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Hari
                    </label>
                    <select
                      value={scheduleForm.schedule_day}
                      onChange={(e) =>
                        setScheduleForm({ ...scheduleForm, schedule_day: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-700 bg-white"
                    >
                      {["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"].map((day) => (
                        <option key={day} value={day}>
                          {day}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Jam Mulai
                    </label>
                    <input
                      type="text"
                      placeholder="08:00"
                      value={scheduleForm.start_time}
                      onChange={(e) =>
                        setScheduleForm({ ...scheduleForm, start_time: e.target.value })
                      }
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Jam Selesai
                    </label>
                    <input
                      type="text"
                      placeholder="10:30"
                      value={scheduleForm.end_time}
                      onChange={(e) =>
                        setScheduleForm({ ...scheduleForm, end_time: e.target.value })
                      }
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-700"
                    />
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsAddScheduleModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl text-sm font-black bg-purple-900 hover:bg-purple-800 text-white shadow-md flex items-center gap-2 transition"
                  >
                    <Check className="w-4 h-4" />
                    <span>Simpan Jadwal Mengajar</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* MODAL 2: Upload File Jadwal Mengajar (CSV)                     */}
        {/* ============================================================== */}
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-900 flex items-center justify-center">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      Upload File Jadwal Mengajar (CSV)
                    </h3>
                    <p className="text-xs text-slate-500">
                      Unggah daftar jadwal kuliah sekaligus untuk dosen: {currentLecturer?.name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsUploadModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-5 space-y-4 overflow-y-auto flex-1 pr-1">
                {/* Upload drag & drop zone */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-purple-200 hover:border-purple-500 rounded-2xl p-6 text-center cursor-pointer transition bg-purple-50/40 hover:bg-purple-50/70"
                >
                  <Upload className="w-8 h-8 text-purple-700 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-800">
                    Klik di sini untuk memilih file CSV jadwal
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Mendukung file .csv dengan pemisah koma (,) atau titik-koma (;)
                  </p>
                  {uploadFile && (
                    <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-900 text-xs font-bold">
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>{uploadFile.name}</span>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.txt"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">
                    Belum punya format CSV yang sesuai?
                  </span>
                  <button
                    type="button"
                    onClick={downloadCsvTemplate}
                    className="text-purple-900 hover:text-purple-700 font-bold flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Template CSV Jadwal</span>
                  </button>
                </div>

                {uploadError && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{uploadError}</span>
                  </div>
                )}

                {/* Parsed Preview Table */}
                {parsedRows.length > 0 && (
                  <div className="mt-4 border border-slate-200 rounded-2xl overflow-hidden">
                    <div className="px-4 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">
                        Preview Jadwal Terdeteksi ({parsedRows.length} Baris)
                      </span>
                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
                        Siap Diunggah
                      </span>
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                          <tr>
                            <th className="px-3 py-2">Mata Kuliah</th>
                            <th className="px-3 py-2">Kelas</th>
                            <th className="px-3 py-2">Ruang</th>
                            <th className="px-3 py-2">Hari &amp; Jam</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {parsedRows.map((row, idx) => (
                            <tr key={idx} className="hover:bg-slate-50">
                              <td className="px-3 py-2 font-medium text-slate-900">
                                {row.course_name}
                              </td>
                              <td className="px-3 py-2 text-purple-900 font-bold">
                                {row.class_name}
                              </td>
                              <td className="px-3 py-2 text-slate-600">
                                {row.room}
                              </td>
                              <td className="px-3 py-2 text-slate-600">
                                {row.schedule_day}, {row.start_time}-{row.end_time}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleProcessBatchUpload}
                  disabled={parsedRows.length === 0 || isUploading}
                  className="px-5 py-2.5 rounded-xl text-sm font-black bg-purple-900 hover:bg-purple-800 disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-md flex items-center gap-2 transition"
                >
                  <Upload className="w-4 h-4" />
                  <span>
                    {isUploading
                      ? "Memproses..."
                      : `Proses & Simpan (${parsedRows.length}) Jadwal`}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* MODAL 3: Buka Sesi Presensi QR di Kelas                        */}
        {/* ============================================================== */}
        {isSessionModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-900 flex items-center justify-center">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      Buka Sesi Presensi QR di Kelas
                    </h3>
                    <p className="text-xs text-slate-500">
                      Generate Dynamic Rolling QR Code untuk mahasiswa
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsSessionModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {mySchedules.length === 0 ? (
                <div className="py-8 text-center">
                  <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-800">
                    Belum Ada Jadwal Mengajar Aktif
                  </p>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                    Anda belum memiliki jadwal mengajar terdaftar. Silakan tambahkan jadwal mengajar terlebih dahulu.
                  </p>
                  <button
                    onClick={() => {
                      setIsSessionModalOpen(false);
                      setIsAddScheduleModalOpen(true);
                    }}
                    className="mt-4 px-4 py-2 rounded-xl bg-purple-900 text-white text-xs font-bold"
                  >
                    Tambah Jadwal Mengajar
                  </button>
                </div>
              ) : (
                <form onSubmit={handleStartSession} className="mt-5 space-y-4">
                  {/* Class selection */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Kelas Mata Kuliah
                    </label>
                    <select
                      value={sessionForm.class_id}
                      onChange={(e) =>
                        setSessionForm({ ...sessionForm, class_id: e.target.value })
                      }
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-700 bg-white"
                    >
                      {mySchedules.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.class_name} — {c.courses?.name} ({c.room})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Meeting Number (1-16) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Pertemuan Ke- (1 s/d 16)
                    </label>
                    <select
                      value={sessionForm.meeting_number}
                      onChange={(e) =>
                        setSessionForm({
                          ...sessionForm,
                          meeting_number: Number(e.target.value),
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-700 bg-white"
                    >
                      {Array.from({ length: 16 }, (_, i) => i + 1).map((n) => (
                        <option key={n} value={n}>
                          Pertemuan Ke-{n}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Topic */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Topik / Materi Perkuliahan
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: State Management & Database Integration"
                      value={sessionForm.topic}
                      onChange={(e) =>
                        setSessionForm({ ...sessionForm, topic: e.target.value })
                      }
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-700"
                    />
                  </div>

                  {/* Custom room / Reschedule */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Ruang Khusus / Perubahan Ruang (Opsional)
                    </label>
                    <input
                      type="text"
                      placeholder="Kosongkan jika sesuai jadwal master"
                      value={sessionForm.custom_room}
                      onChange={(e) =>
                        setSessionForm({ ...sessionForm, custom_room: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-700"
                    />
                  </div>

                  {/* Reschedule check */}
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="resched"
                      checked={sessionForm.is_rescheduled}
                      onChange={(e) =>
                        setSessionForm({
                          ...sessionForm,
                          is_rescheduled: e.target.checked,
                        })
                      }
                      className="rounded border-slate-300 text-purple-700 focus:ring-purple-700 cursor-pointer"
                    />
                    <label
                      htmlFor="resched"
                      className="text-xs font-semibold text-slate-700 cursor-pointer"
                    >
                      Tandai sebagai Kelas Pengganti (Rescheduled Session)
                    </label>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setIsSessionModalOpen(false)}
                      className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl text-sm font-black bg-purple-950 hover:bg-purple-900 text-white shadow-md flex items-center gap-2 transition"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>Mulai &amp; Tampilkan QR Proyektor</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
