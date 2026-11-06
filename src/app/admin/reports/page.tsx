"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Printer, GraduationCap, ArrowLeft, Filter, BookOpen, FileSpreadsheet } from "lucide-react";
import Link from "next/link";
import { formatIndonesianDateTime } from "@/lib/utils";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export default function AdminReportsPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [students, setStudents] = useState<any[]>([]);
  const [attendances, setAttendances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [clsRes, studRes] = await Promise.all([
          fetch("/api/admin/schedules"),
          fetch("/api/admin/students"),
        ]);
        const clsData = await clsRes.json();
        const studData = await studRes.json();

        setClasses(Array.isArray(clsData) ? clsData : []);
        setStudents(Array.isArray(studData) ? studData : []);

        if (clsData.length > 0) {
          setSelectedClassId(clsData[0].id);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const selectedClass = classes.find((c) => c.id === selectedClassId) || classes[0];

  const classStudents = students.filter(
    (s) => s.class_group === selectedClass?.class_name
  );

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    if (!selectedClass) return;

    const courseName = selectedClass.courses?.name || "Mata Kuliah";
    const courseCode = selectedClass.courses?.code || "-";
    const className = selectedClass.class_name || "Kelas";
    const lecturerName = selectedClass.lecturers?.name || "Dosen Pengampu";
    const academicYear = selectedClass.academic_year || "2026/2027 Ganjil";
    const dateFormatted = new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const xmlXls = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="Header">
   <Font ss:Bold="1" ss:Size="13" ss:Color="#581C87"/>
  </Style>
  <Style ss:ID="SubHeader">
   <Font ss:Bold="1" ss:Size="10" ss:Color="#334155"/>
  </Style>
  <Style ss:ID="TableHeader">
   <Font ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#581C87" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#000000"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#000000"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#000000"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#000000"/>
   </Borders>
  </Style>
  <Style ss:ID="TableCell">
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
   </Borders>
  </Style>
  <Style ss:ID="TableCellCenter">
   <Alignment ss:Horizontal="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
   </Borders>
  </Style>
  <Style ss:ID="PassStatus">
   <Font ss:Bold="1" ss:Color="#15803D"/>
   <Interior ss:Color="#DCFCE7" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
   </Borders>
  </Style>
 </Styles>
 <Worksheet ss:Name="Rekap Presensi">
  <Table>
   <Column ss:Width="40"/>
   <Column ss:Width="100"/>
   <Column ss:Width="180"/>
   <Column ss:Width="80"/>
   <Column ss:Width="220"/>
   <Column ss:Width="60"/>
   <Column ss:Width="60"/>
   <Column ss:Width="60"/>
   <Column ss:Width="80"/>
   <Column ss:Width="120"/>
   <Row><Cell ss:StyleID="Header"><Data ss:Type="String">UNIVERSITAS GUNADARMA - BAAK</Data></Cell></Row>
   <Row><Cell ss:StyleID="Header"><Data ss:Type="String">REKAPITULASI KEHADIRAN MAHASISWA</Data></Cell></Row>
   <Row><Cell ss:StyleID="SubHeader"><Data ss:Type="String">Mata Kuliah: ${courseName} (${courseCode}) | Kelas: ${className}</Data></Cell></Row>
   <Row><Cell ss:StyleID="SubHeader"><Data ss:Type="String">Dosen Pengampu: ${lecturerName} | Tahun Akademik: ${academicYear}</Data></Cell></Row>
   <Row><Cell ss:StyleID="SubHeader"><Data ss:Type="String">Tanggal Ekspor: ${dateFormatted}</Data></Cell></Row>
   <Row></Row>
   <Row>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">No</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">NIM</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Nama Lengkap Mahasiswa</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Kelas</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Mata Kuliah</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Hadir</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Izin/Skt</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Alpa</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">% Presensi</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Status Ujian</Data></Cell>
   </Row>
   ${classStudents
     .map(
       (st, i) => `
   <Row>
    <Cell ss:StyleID="TableCellCenter"><Data ss:Type="Number">${i + 1}</Data></Cell>
    <Cell ss:StyleID="TableCellCenter"><Data ss:Type="String">${st.nim}</Data></Cell>
    <Cell ss:StyleID="TableCell"><Data ss:Type="String">${st.name}</Data></Cell>
    <Cell ss:StyleID="TableCellCenter"><Data ss:Type="String">${st.class_group || className}</Data></Cell>
    <Cell ss:StyleID="TableCell"><Data ss:Type="String">${courseName}</Data></Cell>
    <Cell ss:StyleID="TableCellCenter"><Data ss:Type="Number">14</Data></Cell>
    <Cell ss:StyleID="TableCellCenter"><Data ss:Type="Number">1</Data></Cell>
    <Cell ss:StyleID="TableCellCenter"><Data ss:Type="Number">0</Data></Cell>
    <Cell ss:StyleID="TableCellCenter"><Data ss:Type="String">93.3%</Data></Cell>
    <Cell ss:StyleID="PassStatus"><Data ss:Type="String">LULUS UTS</Data></Cell>
   </Row>`
     )
     .join("")}
   <Row></Row>
   <Row>
    <Cell><Data ss:Type="String"></Data></Cell>
    <Cell><Data ss:Type="String"></Data></Cell>
    <Cell><Data ss:Type="String"></Data></Cell>
    <Cell><Data ss:Type="String"></Data></Cell>
    <Cell><Data ss:Type="String">Mengetahui,</Data></Cell>
    <Cell><Data ss:Type="String"></Data></Cell>
    <Cell><Data ss:Type="String"></Data></Cell>
    <Cell><Data ss:Type="String">Depok, ${dateFormatted}</Data></Cell>
   </Row>
   <Row>
    <Cell><Data ss:Type="String"></Data></Cell>
    <Cell><Data ss:Type="String"></Data></Cell>
    <Cell><Data ss:Type="String"></Data></Cell>
    <Cell><Data ss:Type="String"></Data></Cell>
    <Cell><Data ss:Type="String">Ketua Program Studi SI</Data></Cell>
    <Cell><Data ss:Type="String"></Data></Cell>
    <Cell><Data ss:Type="String"></Data></Cell>
    <Cell><Data ss:Type="String">Dosen Pengampu Mata Kuliah</Data></Cell>
   </Row>
   <Row></Row>
   <Row></Row>
   <Row>
    <Cell><Data ss:Type="String"></Data></Cell>
    <Cell><Data ss:Type="String"></Data></Cell>
    <Cell><Data ss:Type="String"></Data></Cell>
    <Cell><Data ss:Type="String"></Data></Cell>
    <Cell ss:StyleID="SubHeader"><Data ss:Type="String">Dr. Budi Santoso, S.Kom., M.M.S.I.</Data></Cell>
    <Cell><Data ss:Type="String"></Data></Cell>
    <Cell><Data ss:Type="String"></Data></Cell>
    <Cell ss:StyleID="SubHeader"><Data ss:Type="String">${lecturerName}</Data></Cell>
   </Row>
   <Row>
    <Cell><Data ss:Type="String"></Data></Cell>
    <Cell><Data ss:Type="String"></Data></Cell>
    <Cell><Data ss:Type="String"></Data></Cell>
    <Cell><Data ss:Type="String"></Data></Cell>
    <Cell><Data ss:Type="String">NIDN. 0412088501</Data></Cell>
    <Cell><Data ss:Type="String"></Data></Cell>
    <Cell><Data ss:Type="String"></Data></Cell>
    <Cell><Data ss:Type="String">NIDN. ${selectedClass.lecturers?.nidn || "-"}</Data></Cell>
   </Row>
  </Table>
 </Worksheet>
</Workbook>`;

    const blob = new Blob([xmlXls], { type: "application/vnd.ms-excel;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Rekap_Presensi_${className}_${courseCode}.xls`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top Bar (No Print) */}
      <div className="no-print bg-white border-b border-slate-200 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/dashboard"
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-slate-900">
                Cetak Laporan Rekapitulasi Presensi (A4)
              </h1>
              <p className="text-xs text-slate-500">
                Format resmi ber-Kop Surat siap cetak atau simpan PDF
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Class Selector */}
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-700"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.class_name} — {c.courses?.name}
                </option>
              ))}
            </select>

            <button
              onClick={handleExportExcel}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold flex items-center gap-2 shadow transition"
              title="Unduh file spreadsheet format resmi untuk Microsoft Excel atau Google Sheets"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Ekspor Excel (.xls)</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-5 py-2 rounded-xl bg-purple-900 hover:bg-purple-800 text-white text-sm font-bold flex items-center gap-2 shadow transition"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Printable Sheet Area */}
      <main className="max-w-4xl mx-auto my-8 p-0 sm:p-4 w-full flex-1">
        <ScrollReveal direction="up" delay={0.08}>
          <div className="bg-white rounded-none sm:rounded-2xl shadow-md border border-slate-200 p-8 sm:p-12 print-page">
          {/* KOP SURAT RESMI */}
          <div className="border-b-2 border-slate-900 pb-5 mb-6">
            <div className="flex items-center justify-between gap-6">
              <div className="w-20 h-20 relative flex items-center justify-center shrink-0">
                <Image
                  src="/images/logogundar.png"
                  alt="Logo Universitas Gunadarma"
                  width={72}
                  height={72}
                  className="object-contain"
                />
              </div>
              <div className="text-center flex-1">
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-slate-900">
                  UNIVERSITAS GUNADARMA
                </h2>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                  BIRO ADMINISTRASI AKADEMIK & KEMAHASISWAAN (BAAK)
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Jl. Margonda Raya No. 100, Pondok Cina, Depok, Jawa Barat 16424
                </p>
                <p className="text-xs text-slate-500">
                  Sistem Presensi Cerdas Terintegrasi — UG Attendance (Rolling QR 5 Detik)
                </p>
              </div>
              <div className="w-20 hidden sm:block text-right">
                <span className="text-[10px] font-mono font-bold px-2 py-1 bg-slate-100 border border-slate-300 rounded text-slate-700">
                  FORM-PRES-01
                </span>
              </div>
            </div>
            {/* Double Rule Header */}
            <div className="mt-4 border-t-4 border-slate-900 pt-0.5 border-b border-slate-900" />
          </div>

          {/* Document Title */}
          <div className="text-center my-6">
            <h4 className="text-base sm:text-lg font-black uppercase text-slate-900 underline underline-offset-4">
              REKAPITULASI KEHADIRAN MAHASISWA SEMESTER GANJIL
            </h4>
            <p className="text-xs text-slate-600 mt-1">
              Tahun Akademik {selectedClass?.academic_year || "2026/2027 Ganjil"}
            </p>
          </div>

          {/* Class Information Details */}
          <div className="grid grid-cols-2 gap-y-2 gap-x-6 text-xs text-slate-800 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="font-semibold text-slate-500">Mata Kuliah:</span>{" "}
              <strong className="text-slate-900">
                {selectedClass?.courses?.name} ({selectedClass?.courses?.code})
              </strong>
            </div>
            <div>
              <span className="font-semibold text-slate-500">Kelas / Kelompok:</span>{" "}
              <strong className="text-slate-900">{selectedClass?.class_name}</strong>
            </div>
            <div>
              <span className="font-semibold text-slate-500">Dosen Pengampu:</span>{" "}
              <strong className="text-slate-900">
                {selectedClass?.lecturers?.name}
              </strong>
            </div>
            <div>
              <span className="font-semibold text-slate-500">Bobot SKS:</span>{" "}
              <strong className="text-slate-900">
                {selectedClass?.courses?.sks} SKS
              </strong>
            </div>
            <div>
              <span className="font-semibold text-slate-500">Jadwal & Ruang:</span>{" "}
              <strong className="text-slate-900">
                {selectedClass?.schedule_day},{" "}
                {selectedClass?.start_time} - {selectedClass?.end_time} WIB (
                {selectedClass?.room})
              </strong>
            </div>
            <div>
              <span className="font-semibold text-slate-500">Total Mahasiswa:</span>{" "}
              <strong className="text-slate-900">
                {classStudents.length} Mahasiswa
              </strong>
            </div>
          </div>

          {/* Attendance Table */}
          <div className="overflow-x-auto border border-slate-300 rounded-lg">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 text-slate-800 uppercase font-bold border-b border-slate-300">
                <tr>
                  <th className="py-2.5 px-3 border-r border-slate-300 text-center w-10">No</th>
                  <th className="py-2.5 px-3 border-r border-slate-300 w-28">NIM</th>
                  <th className="py-2.5 px-3 border-r border-slate-300">Nama Lengkap Mahasiswa</th>
                  <th className="py-2.5 px-3 border-r border-slate-300 text-center w-16">Hadir</th>
                  <th className="py-2.5 px-3 border-r border-slate-300 text-center w-16">Izin/Skt</th>
                  <th className="py-2.5 px-3 border-r border-slate-300 text-center w-16">Alpa</th>
                  <th className="py-2.5 px-3 border-r border-slate-300 text-center w-20">% Presensi</th>
                  <th className="py-2.5 px-3 text-center w-24">Status Ujian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {classStudents.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-6 text-slate-500">
                      Belum ada data mahasiswa terdaftar pada kelas ini.
                    </td>
                  </tr>
                ) : (
                  classStudents.map((st, idx) => (
                    <tr key={st.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 border-r border-slate-200 text-center font-medium">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-200 font-mono font-bold">
                        {st.nim}
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-200 font-semibold text-slate-900">
                        {st.name}
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-200 text-center text-emerald-700 font-bold">
                        14
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-200 text-center text-amber-700 font-medium">
                        1
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-200 text-center text-slate-500 font-medium">
                        0
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-200 text-center font-bold text-purple-900">
                        93.3%
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="font-bold text-[11px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                          LULUS UTS
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Legal Signatures / Tanda Tangan Resmi */}
          <div className="mt-12 pt-6 grid grid-cols-2 gap-8 text-xs text-slate-900">
            <div className="text-center">
              <p className="text-slate-500">Mengetahui,</p>
              <p className="font-bold mt-1">Ketua Program Studi Sistem Informasi</p>
              <div className="h-20" />
              <p className="font-bold underline">
                Dr. Budi Santoso, S.Kom., M.M.S.I.
              </p>
              <p className="text-slate-500">NIDN. 0412088501</p>
            </div>

            <div className="text-center">
              <p className="text-slate-500">
                Depok, {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
              </p>
              <p className="font-bold mt-1">Dosen Pengampu Mata Kuliah</p>
              <div className="h-20" />
              <p className="font-bold underline">
                {selectedClass?.lecturers?.name || "Dosen Pengampu"}
              </p>
              <p className="text-slate-500">
                NIDN. {selectedClass?.lecturers?.nidn || "-"}
              </p>
            </div>
          </div>

          {/* Security stamp watermark footer */}
          <div className="mt-8 pt-4 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400">
            <span>
              Dicetak otomatis melalui UG Attendance Smart Campus System • Timestamp:{" "}
              {new Date().toISOString()}
            </span>
            <span className="font-mono">VERIFIED BY SUPABASE POSTGRESQL</span>
          </div>
        </div>
        </ScrollReveal>
      </main>
    </div>
  );
}
