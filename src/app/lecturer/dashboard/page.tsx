"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Navbar from "@/components/Navbar";
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
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function LecturerDashboardPage() {
  const router = useRouter();
  const [schedules, setSchedules] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedLecturerId, setSelectedLecturerId] = useState<string>(
    "11111111-1111-1111-1111-111111111102" // Rina Wijaya, S.T., M.Kom.
  );
  const [lecturers, setLecturers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal open session
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalForm, setModalForm] = useState({
    class_id: "",
    meeting_number: 6,
    topic: "Implementasi Database Relasional & Query Optimization",
    custom_room: "",
    is_rescheduled: false,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [schedRes, sessRes, lectRes] = await Promise.all([
        fetch("/api/admin/schedules"),
        fetch("/api/lecturer/sessions"),
        fetch("/api/admin/lecturers"),
      ]);

      const [schedData, sessData, lectData] = await Promise.all([
        schedRes.json(),
        sessRes.json(),
        lectRes.json(),
      ]);

      setSchedules(Array.isArray(schedData) ? schedData : []);
      setSessions(Array.isArray(sessData) ? sessData : []);
      setLecturers(Array.isArray(lectData) ? lectData : []);

      if (schedData.length > 0 && !modalForm.class_id) {
        setModalForm((prev) => ({ ...prev, class_id: schedData[0].id }));
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

  const openSessionModal = (classId?: string) => {
    if (classId) {
      setModalForm((prev) => ({ ...prev, class_id: classId }));
    }
    setIsModalOpen(true);
  };

  const handleStartSession = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/lecturer/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(modalForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal membuka sesi");

      setIsModalOpen(false);
      // Navigate directly to the dynamic QR projector page
      router.push(`/lecturer/sessions/${data.data.id}`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Filter schedules for the selected lecturer
  const mySchedules = schedules.filter(
    (s) => s.lecturer_id === selectedLecturerId
  );
  const activeSession = sessions.find((s) => s.status === "OPEN");

  const currentLecturer = lecturers.find((l) => l.id === selectedLecturerId);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {/* Header with Lecturer Profile Switcher */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 relative flex items-center justify-center shrink-0 p-1 bg-white rounded-xl border border-purple-200 shadow-sm">
              <Image
                src="/images/logogundar.png"
                alt="Logo Gunadarma"
                width={40}
                height={40}
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
                (NIDN: {currentLecturer?.nidn || "-"})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Lecturer Switcher Dropdown */}
            <select
              value={selectedLecturerId}
              onChange={(e) => setSelectedLecturerId(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-700"
            >
              {lecturers.map((l) => (
                <option key={l.id} value={l.id}>
                  Dosen: {l.name}
                </option>
              ))}
            </select>

            <button
              onClick={() => openSessionModal()}
              className="px-4 py-2.5 rounded-xl bg-purple-900 hover:bg-purple-800 text-white text-sm font-bold flex items-center gap-2 shadow-md transition"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Buka Sesi Presensi Baru</span>
            </button>
          </div>
        </div>

        {/* Active Open Session Banner */}
        {activeSession && (
          <div className="my-6 p-6 rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-800 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-lg">
                <Radio className="w-7 h-7 animate-pulse" />
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
        <div className="my-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Plotting Jadwal Mengajar Anda
              </h2>
              <p className="text-xs text-slate-500">
                Jadwal yang telah di-plotting oleh Biro Administrasi Akademik
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mySchedules.length === 0 ? (
              <div className="col-span-full bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-200">
                <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30 text-purple-700" />
                <p className="font-semibold text-sm">
                  Tidak ada jadwal perkuliahan yang di-plotting untuk dosen ini.
                </p>
                <p className="text-xs mt-1">
                  Pilih dosen lain pada dropdown di atas atau hubungi Admin untuk plotting jadwal.
                </p>
              </div>
            ) : (
              mySchedules.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-1 rounded-md text-xs font-black bg-purple-100 text-purple-900 border border-purple-200">
                        {item.class_name}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-400">
                        {item.courses?.code}
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-slate-900 line-clamp-2">
                      {item.courses?.name}
                    </h3>
                    <p className="text-xs text-purple-800 font-semibold mt-1">
                      {item.courses?.sks} SKS • {item.courses?.department}
                    </p>

                    <div className="mt-5 space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span className="font-semibold text-slate-800">
                          {item.schedule_day}, {item.start_time} - {item.end_time} WIB
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <span>{item.room}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100">
                    <button
                      onClick={() => openSessionModal(item.id)}
                      className="w-full py-2.5 px-4 rounded-xl bg-purple-900 hover:bg-purple-800 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition"
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

        {/* Modal Buka Sesi Perkuliahan Baru */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-900 flex items-center justify-center">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Buka Sesi Presensi QR di Kelas
                  </h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleStartSession} className="mt-4 space-y-4">
                {/* Class selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Kelas Mata Kuliah
                  </label>
                  <select
                    value={modalForm.class_id}
                    onChange={(e) =>
                      setModalForm({ ...modalForm, class_id: e.target.value })
                    }
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-700"
                  >
                    {schedules.map((c) => (
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
                    value={modalForm.meeting_number}
                    onChange={(e) =>
                      setModalForm({
                        ...modalForm,
                        meeting_number: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-700"
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
                    value={modalForm.topic}
                    onChange={(e) =>
                      setModalForm({ ...modalForm, topic: e.target.value })
                    }
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-700"
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
                    value={modalForm.custom_room}
                    onChange={(e) =>
                      setModalForm({ ...modalForm, custom_room: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-700"
                  />
                </div>

                {/* Reschedule check */}
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="resched"
                    checked={modalForm.is_rescheduled}
                    onChange={(e) =>
                      setModalForm({
                        ...modalForm,
                        is_rescheduled: e.target.checked,
                      })
                    }
                    className="rounded border-slate-300 text-purple-700 focus:ring-purple-700"
                  />
                  <label
                    htmlFor="resched"
                    className="text-xs font-semibold text-slate-700"
                  >
                    Tandai sebagai Kelas Pengganti (Rescheduled Session)
                  </label>
                </div>

                {/* Actions */}
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
                    className="px-5 py-2.5 rounded-xl text-sm font-black bg-purple-900 hover:bg-purple-800 text-white shadow-md flex items-center gap-2 transition"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Mulai & Tampilkan QR Proyektor</span>
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
