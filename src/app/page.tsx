"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import Navbar from "@/components/Navbar";
import {
  ShieldCheck,
  UserCheck,
  ArrowRight,
  Zap,
  Monitor,
  Activity,
  Bell,
  GraduationCap,
  QrCode,
  Calendar,
} from "lucide-react";
import {
  BatikKawungPattern,
  BatikPhotoRibbon,
  BatikDivider,
  BatikRosette,
  BatikCornerFlourish,
} from "@/components/ui/BatikElements";

// Framer Motion animation variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-800 antialiased font-sans selection:bg-purple-100 selection:text-purple-900">
      <Navbar />

      <main className="flex-1 w-full overflow-hidden">
        {/* ========================================================= */}
        {/* HERO SECTION                                              */}
        {/* ========================================================= */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-14 md:pt-12 md:pb-20 overflow-hidden"
        >
          {/* Distinctive Indonesian Batik Kawung Background Watermark */}
          <BatikKawungPattern
            opacity={0.14}
            color="#581C87"
            className="absolute -top-12 -left-12 -right-12 bottom-0 pointer-events-none"
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
            {/* Left Content Column */}
            <motion.div variants={itemVariants} className="lg:col-span-7 space-y-6 z-10">
              {/* Category Subhead with Indonesian Batik Medallion */}
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-purple-50 border border-purple-200 shadow-xs">
                <span className="text-[11px] font-extrabold tracking-widest text-purple-950 uppercase">
                  SISTEM PRESENSI AKADEMIK • UNIVERSITAS GUNADARMA
                </span>
                <BatikRosette size={14} />
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-black text-slate-900 tracking-tight leading-[1.12]">
                Presensi Kuliah<br />
                <span className="text-slate-900">Lebih Mudah &amp; Terintegrasi</span>
              </h1>

              {/* Supporting Paragraph */}
              <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
                Sistem informasi presensi cerdas Universitas Gunadarma yang memadukan keandalan teknologi QR dinamis dengan identitas keunggulan budaya akademik kampus.
              </p>

              {/* Two Differentiated Portal Cards with Batik Accents */}
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
                {/* 1. Portal Admin */}
                <Link
                  href="/admin/dashboard"
                  className="group relative p-5 rounded-2xl bg-purple-50/80 border border-purple-200 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-900/10 transition-all flex items-center justify-between overflow-hidden"
                >
                  {/* Top Batik Ribbon Border */}
                  <div className="absolute top-0 left-0 right-0">
                    <BatikPhotoRibbon className="w-full h-1.5" />
                  </div>
                  <BatikCornerFlourish className="absolute top-0 right-0 w-12 h-12 text-amber-600/25 pointer-events-none rounded-tr-2xl group-hover:text-amber-600/40 transition-colors" />

                  <div className="flex items-center gap-3.5 pr-2 z-10 pt-1">
                    <div className="w-11 h-11 rounded-xl bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-900 shrink-0 shadow-sm">
                      <ShieldCheck className="w-6 h-6 text-purple-900" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm">
                        Portal Admin
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                        Kelola data akademik, jadwal, dan laporan presensi
                      </p>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-purple-950 text-white flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-sm z-10">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>

                {/* 2. Portal Dosen */}
                <Link
                  href="/lecturer/dashboard"
                  className="group relative p-5 rounded-2xl bg-white border border-slate-200 hover:border-purple-300 hover:shadow-lg hover:shadow-purple-900/10 transition-all flex items-center justify-between overflow-hidden"
                >
                  {/* Top Batik Ribbon Border */}
                  <div className="absolute top-0 left-0 right-0">
                    <BatikPhotoRibbon className="w-full h-1.5" />
                  </div>
                  <BatikCornerFlourish className="absolute top-0 right-0 w-12 h-12 text-amber-600/25 pointer-events-none rounded-tr-2xl group-hover:text-amber-600/40 transition-colors" />

                  <div className="flex items-center gap-3.5 pr-2 z-10 pt-1">
                    <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-purple-900 shrink-0 shadow-sm">
                      <UserCheck className="w-6 h-6 text-purple-900" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm">
                        Portal Dosen
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                        Mulai sesi presensi dan tampilkan QR code
                      </p>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-purple-50 border border-purple-200 text-purple-950 flex items-center justify-center shrink-0 group-hover:bg-purple-950 group-hover:text-white transition-all shadow-sm z-10">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>
              </div>
            </motion.div>

            {/* Right Visual Column: Campus Photo + Floating Phone Mockup + Batik Frame */}
            <motion.div
              variants={itemVariants}
              className="lg:col-span-5 relative flex items-center justify-center lg:justify-end mt-8 lg:mt-0"
            >
              {/* Grand Decorative Batik Background Card behind the phone */}
              <div className="absolute -inset-4 sm:-inset-6 lg:-right-8 lg:-inset-y-6 rounded-[36px] overflow-hidden opacity-35 pointer-events-none shadow-xl border-2 border-amber-500/40">
                <Image
                  src="/images/batik_pattern_purple_gold.jpg"
                  alt="Batik Pattern Background"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-white via-white/50 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-white/40" />
              </div>

              {/* Campus Background Image with soft gradient masks */}
              <div className="absolute -inset-2 sm:-inset-4 lg:-right-6 lg:-inset-y-4 rounded-3xl overflow-hidden opacity-90 pointer-events-none">
                <Image
                  src="/images/campus_gunadarma.jpg"
                  alt="Universitas Gunadarma Campus"
                  fill
                  className="object-cover object-right"
                  priority
                />
                {/* Soft gradient masks to fade into clean white background */}
                <div className="absolute inset-0 bg-gradient-to-r from-white via-white/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-white/40" />
                <div className="absolute inset-0 bg-white/20 backdrop-blur-[0.5px]" />
              </div>

              {/* Floating Mobile Phone Mockup */}
              <div className="relative z-10 w-[290px] sm:w-[310px] drop-shadow-2xl">
                {/* Phone Exterior Frame */}
                <div className="relative rounded-[46px] border-[8px] border-slate-900 bg-slate-900 shadow-2xl overflow-hidden">
                  {/* Dynamic Island / Notch */}
                  <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-24 h-4 bg-slate-900 rounded-full z-30 flex items-center justify-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-800/80" />
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-900/60" />
                  </div>

                  {/* Phone Screen Content */}
                  <div className="bg-slate-50 text-slate-900 pt-7 pb-6 px-4 font-sans select-none relative overflow-hidden">
                    {/* Phone screen batik texture */}
                    <BatikKawungPattern opacity={0.06} color="#581C87" className="absolute inset-0 pointer-events-none" />

                    {/* Phone App Bar */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 relative z-10">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 relative flex items-center justify-center shrink-0 p-0.5 bg-white rounded-md border border-purple-200 shadow-xs">
                          <Image
                            src="/images/logogundar.png"
                            alt="UG Logo"
                            width={22}
                            height={22}
                            className="object-contain"
                            unoptimized
                          />
                        </div>
                        <span className="text-[11px] font-black tracking-tight text-slate-900">
                          UG Attendance
                        </span>
                      </div>
                      <span className="text-[9px] font-semibold text-slate-400">
                        9:41
                      </span>
                    </div>

                    {/* Greeting */}
                    <div className="mt-3 relative z-10">
                      <p className="text-[10px] text-slate-500 font-medium">Selamat datang,</p>
                      <p className="text-sm font-extrabold text-slate-900">Mahasiswa</p>
                    </div>

                    {/* Semester Presence Ring Card */}
                    <div className="mt-2.5 p-3 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-between relative z-10">
                      <div>
                        <p className="text-[10px] text-slate-500 font-semibold">Kehadiran Semester Ini</p>
                        <p className="text-lg font-black text-slate-900 mt-0.5">92,4%</p>
                        <p className="text-[9px] text-emerald-600 font-bold flex items-center gap-0.5 mt-0.5">
                          <span>↑ 3%</span>
                          <span className="text-slate-400 font-normal">dari semester lalu</span>
                        </p>
                      </div>
                      {/* Circular Progress Indicator */}
                      <div className="relative w-11 h-11 flex items-center justify-center">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                          <path
                            className="text-slate-100"
                            strokeWidth="3.5"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                          <path
                            className="text-purple-900"
                            strokeDasharray="92.4, 100"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                        </svg>
                      </div>
                    </div>

                    {/* Jadwal Kuliah Hari Ini */}
                    <div className="mt-3 relative z-10">
                      <div className="flex items-center justify-between pb-1.5">
                        <span className="text-[10px] font-black text-slate-900 tracking-tight">
                          Jadwal Kuliah Hari Ini
                        </span>
                      </div>

                      {/* Course items */}
                      <div className="space-y-1.5">
                        {/* Course 1 */}
                        <div className="p-2 rounded-xl bg-white border border-slate-200/70 shadow-2xs flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-purple-50 text-purple-900 flex items-center justify-center shrink-0">
                              <Calendar className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-slate-900 leading-tight">Pemrograman Web</p>
                              <p className="text-[8px] text-slate-400">08:00 - 09:40 • Ruang Lab E301</p>
                            </div>
                          </div>
                          <span className="text-[8px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Hadir
                          </span>
                        </div>

                        {/* Course 2 */}
                        <div className="p-2 rounded-xl bg-white border border-slate-200/70 shadow-2xs flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
                              <Calendar className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-slate-900 leading-tight">Basis Data</p>
                              <p className="text-[8px] text-slate-400">10:00 - 11:40 • Ruang Lab E302</p>
                            </div>
                          </div>
                          <span className="text-[8px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Hadir
                          </span>
                        </div>

                        {/* Course 3 */}
                        <div className="p-2 rounded-xl bg-white border border-slate-200/70 shadow-2xs flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                              <Calendar className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-slate-900 leading-tight">Analisis &amp; Desain SI</p>
                              <p className="text-[8px] text-slate-400">13:00 - 14:40 • Ruang 2.3</p>
                            </div>
                          </div>
                          <span className="text-[8px] font-extrabold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                            Belum
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Scan QR Button inside Phone */}
                    <div className="mt-3 relative z-10">
                      <div className="w-full py-2.5 rounded-xl bg-purple-950 text-white flex items-center justify-center gap-1.5 shadow-md">
                        <QrCode className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold tracking-tight">Scan QR Presensi</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Slogan Badge with Batik Rosette */}
                <div className="hidden sm:block absolute -right-6 top-1/2 -translate-y-1/2 translate-x-3 rotate-6 bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-2xl shadow-xl border border-purple-200/90">
                  <div className="flex items-center justify-center gap-1 mb-0.5">
                    <BatikRosette size={11} />
                    <span className="text-[9px] font-bold tracking-wider uppercase text-purple-900">UG Smart Campus</span>
                  </div>
                  <p className="text-xs font-serif italic text-purple-950 font-bold leading-tight text-center">
                    Smart Campus<br />
                    <span className="text-[11px] text-slate-600 font-sans font-medium">for a Better Future</span>
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* ========================================================= */}
        {/* GRAND BATIK NUSANTARA SHOWCASE BANNER                    */}
        {/* ========================================================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="relative rounded-3xl overflow-hidden shadow-xl border border-purple-900/40">
            {/* Rich authentic Indonesian Batik pattern background */}
            <div className="absolute inset-0 z-0">
              <Image
                src="/images/batik_pattern_purple_gold.jpg"
                alt="Batik Nusantara Gunadarma"
                fill
                className="object-cover object-center"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-r from-purple-950/95 via-purple-950/88 to-purple-900/80 backdrop-blur-[0.5px]" />
            </div>

            {/* Content inside Banner */}
            <div className="relative z-10 px-6 py-8 sm:px-10 sm:py-10 flex flex-col md:flex-row items-center justify-between gap-6 text-white">
              <div className="space-y-3 text-center md:text-left max-w-2xl">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md p-1 border border-amber-400/50 flex items-center justify-center shrink-0 shadow-sm">
                    <Image
                      src="/images/logogundar.png"
                      alt="Logo Gunadarma"
                      width={34}
                      height={34}
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-black tracking-widest uppercase shadow-xs">
                    <BatikRosette size={14} goldColor="#FBBF24" primaryColor="#FFFFFF" />
                    UNIVERSITAS GUNADARMA • KULTUR &amp; DIGITAL
                  </div>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
                  Presensi Cerdas Berkarakter Budaya Luhur
                </h3>
                <p className="text-sm text-purple-100/90 leading-relaxed">
                  UG Attendance memadukan teknologi enkripsi QR dinamis 5 detik dengan filosofi Batik Kawung (kebijaksanaan &amp; keadilan) dan Batik Parang (semangat pantang menyerah) civitas akademika Universitas Gunadarma.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                <div className="px-4 py-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-center shadow-xs">
                  <p className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">Motif Kawung</p>
                  <p className="text-xs font-extrabold text-white">Integritas Akademik</p>
                </div>
                <div className="px-4 py-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-center shadow-xs">
                  <p className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">Motif Parang</p>
                  <p className="text-xs font-extrabold text-white">Ketekunan Riset</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* ORNAMENTAL BATIK DIVIDER                                  */}
        {/* ========================================================= */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <BatikDivider title="Keunggulan Presensi Digital" />
        </div>

        {/* ========================================================= */}
        {/* KEUNGGULAN SECTION                                        */}
        {/* ========================================================= */}
        <section id="keunggulan" className="relative border-t border-slate-100 bg-slate-50/70 py-16 md:py-20 overflow-hidden scroll-mt-20">
          {/* Visible Kawung pattern background */}
          <BatikKawungPattern opacity={0.10} color="#581C87" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Section Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
              <div>
                <div className="inline-flex items-center gap-2 mb-1">
                  <BatikRosette size={14} />
                  <span className="text-[12px] font-extrabold tracking-widest text-purple-900 uppercase">
                    KEUNGGULAN
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                  Mengapa Memilih UG Attendance?
                </h2>
                <p className="text-sm sm:text-base text-slate-600 max-w-2xl mt-2 leading-relaxed">
                  Solusi presensi digital yang dirancang untuk memudahkan mahasiswa, dosen, dan biro akademik kampus dalam satu ekosistem terpadu.
                </p>
              </div>

              <Link
                href="#panduan"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-purple-950 hover:text-purple-800 transition shrink-0 group self-start md:self-end"
              >
                <span>Selengkapnya</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* 5 Feature Cards Grid with Top Batik Ribbon Trims */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5">
              {/* Feature 1 */}
              <div className="relative p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-purple-300 transition-all flex flex-col justify-between overflow-hidden group">
                <div className="absolute top-0 left-0 right-0">
                  <BatikPhotoRibbon className="w-full h-1" />
                </div>
                <BatikCornerFlourish className="absolute top-0 right-0 w-8 h-8 text-amber-600/20 pointer-events-none rounded-tr-2xl group-hover:text-amber-600/35 transition-colors" />
                <div className="relative z-10 pt-1">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-900 flex items-center justify-center mb-4">
                    <Zap className="w-5 h-5 text-purple-900" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">
                    Proses Cepat &amp; Praktis
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    Presensi dapat dilakukan instan dengan scan QR code dinamis di proyektor kelas.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="relative p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-purple-300 transition-all flex flex-col justify-between overflow-hidden group">
                <div className="absolute top-0 left-0 right-0">
                  <BatikPhotoRibbon className="w-full h-1" />
                </div>
                <BatikCornerFlourish className="absolute top-0 right-0 w-8 h-8 text-amber-600/20 pointer-events-none rounded-tr-2xl group-hover:text-amber-600/35 transition-colors" />
                <div className="relative z-10 pt-1">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-900 flex items-center justify-center mb-4">
                    <ShieldCheck className="w-5 h-5 text-purple-900" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">
                    Aman &amp; Terpercaya
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    Data tersimpan aman dan terenkripsi menggunakan token rolling dinamis berkala.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="relative p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-purple-300 transition-all flex flex-col justify-between overflow-hidden group">
                <div className="absolute top-0 left-0 right-0">
                  <BatikPhotoRibbon className="w-full h-1" />
                </div>
                <BatikCornerFlourish className="absolute top-0 right-0 w-8 h-8 text-amber-600/20 pointer-events-none rounded-tr-2xl group-hover:text-amber-600/35 transition-colors" />
                <div className="relative z-10 pt-1">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-900 flex items-center justify-center mb-4">
                    <Monitor className="w-5 h-5 text-purple-900" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">
                    Terintegrasi
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    Satu sistem terpadu untuk mahasiswa, dosen, dan biro akademik BAAK.
                  </p>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="relative p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-purple-300 transition-all flex flex-col justify-between overflow-hidden group">
                <div className="absolute top-0 left-0 right-0">
                  <BatikPhotoRibbon className="w-full h-1" />
                </div>
                <BatikCornerFlourish className="absolute top-0 right-0 w-8 h-8 text-amber-600/20 pointer-events-none rounded-tr-2xl group-hover:text-amber-600/35 transition-colors" />
                <div className="relative z-10 pt-1">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-900 flex items-center justify-center mb-4">
                    <Activity className="w-5 h-5 text-purple-900" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">
                    Monitoring Real-time
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    Pantau kehadiran dan rekapitulasi data mahasiswa secara langsung dan akurat.
                  </p>
                </div>
              </div>

              {/* Feature 5 */}
              <div className="relative p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-purple-300 transition-all flex flex-col justify-between overflow-hidden group">
                <div className="absolute top-0 left-0 right-0">
                  <BatikPhotoRibbon className="w-full h-1" />
                </div>
                <BatikCornerFlourish className="absolute top-0 right-0 w-8 h-8 text-amber-600/20 pointer-events-none rounded-tr-2xl group-hover:text-amber-600/35 transition-colors" />
                <div className="relative z-10 pt-1">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-900 flex items-center justify-center mb-4">
                    <Bell className="w-5 h-5 text-purple-900" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">
                    Notifikasi Otomatis
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    Informasi kehadiran dikirim langsung via WhatsApp ke wali mahasiswa.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* ORNAMENTAL BATIK DIVIDER                                  */}
        {/* ========================================================= */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <BatikDivider title="Tata Tertib Perkuliahan" />
        </div>

        {/* ========================================================= */}
        {/* PANDUAN / ALUR SECTION                                    */}
        {/* ========================================================= */}
        <section id="panduan" className="py-16 md:py-20 bg-white relative scroll-mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <div className="inline-flex items-center gap-2 mb-1">
                <BatikRosette size={14} />
                <span className="text-[12px] font-extrabold tracking-widest text-purple-900 uppercase">
                  PANDUAN OPERASIONAL
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                Alur Presensi Akademik di Ruang Perkuliahan
              </h2>
              <p className="text-sm text-slate-600 mt-2">
                Tata tertib presensi terstandarisasi untuk mahasiswa dan dosen Universitas Gunadarma.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Step 1 */}
              <div className="relative p-6 rounded-2xl border border-slate-200 bg-slate-50/60 hover:border-purple-300 transition-colors overflow-hidden">
                <div className="absolute top-0 left-0 right-0">
                  <BatikPhotoRibbon className="w-full h-1" />
                </div>
                <BatikCornerFlourish className="absolute top-0 right-0 w-10 h-10 text-amber-600/20 pointer-events-none rounded-tr-2xl" />
                <div className="flex items-center gap-2.5 mb-3 pt-1">
                  <div className="w-7 h-7 rounded-full bg-purple-950 text-amber-300 text-xs font-black flex items-center justify-center shadow-xs border border-amber-400/50">
                    1
                  </div>
                  <span className="text-xs font-extrabold text-purple-950 uppercase tracking-wider">
                    Langkah 1
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900">Dosen Menayangkan QR</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Dosen pengampu membuka sesi presensi di kelas. Layar proyektor memutar kode QR dinamis setiap 5 detik dengan masa berlaku token 7 detik.
                </p>
              </div>

              {/* Step 2 */}
              <div className="relative p-6 rounded-2xl border border-slate-200 bg-slate-50/60 hover:border-purple-300 transition-colors overflow-hidden">
                <div className="absolute top-0 left-0 right-0">
                  <BatikPhotoRibbon className="w-full h-1" />
                </div>
                <BatikCornerFlourish className="absolute top-0 right-0 w-10 h-10 text-amber-600/20 pointer-events-none rounded-tr-2xl" />
                <div className="flex items-center gap-2.5 mb-3 pt-1">
                  <div className="w-7 h-7 rounded-full bg-purple-950 text-amber-300 text-xs font-black flex items-center justify-center shadow-xs border border-amber-400/50">
                    2
                  </div>
                  <span className="text-xs font-extrabold text-purple-950 uppercase tracking-wider">
                    Langkah 2
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900">Mahasiswa Memindai</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Mahasiswa membuka aplikasi mobile UG Attendance dan memindai kode QR proyektor dari tempat duduk masing-masing di ruang kelas.
                </p>
              </div>

              {/* Step 3 */}
              <div className="relative p-6 rounded-2xl border border-slate-200 bg-slate-50/60 hover:border-purple-300 transition-colors overflow-hidden">
                <div className="absolute top-0 left-0 right-0">
                  <BatikPhotoRibbon className="w-full h-1" />
                </div>
                <BatikCornerFlourish className="absolute top-0 right-0 w-10 h-10 text-amber-600/20 pointer-events-none rounded-tr-2xl" />
                <div className="flex items-center gap-2.5 mb-3 pt-1">
                  <div className="w-7 h-7 rounded-full bg-purple-950 text-amber-300 text-xs font-black flex items-center justify-center shadow-xs border border-amber-400/50">
                    3
                  </div>
                  <span className="text-xs font-extrabold text-purple-950 uppercase tracking-wider">
                    Langkah 3
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900">Verifikasi &amp; WhatsApp</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Kehadiran terekam instan di database BAAK, dan notifikasi konfirmasi presensi langsung dikirimkan ke nomor WhatsApp Orang Tua mahasiswa.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* KONTAK BAAK SECTION                                       */}
        {/* ========================================================= */}
        <section id="kontak" className="py-14 bg-slate-50/80 border-t border-slate-200/80 relative scroll-mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0">
                  <BatikPhotoRibbon className="w-full h-1" />
                </div>
                <BatikCornerFlourish className="absolute top-0 right-0 w-8 h-8 text-amber-600/20 pointer-events-none rounded-tr-2xl" />
                <div className="flex items-center gap-2 mb-1 pt-1">
                  <BatikRosette size={14} />
                  <h4 className="text-sm font-bold text-slate-900">Loket Layanan BAAK Kampus D (Margonda)</h4>
                </div>
                <p className="text-xs text-slate-600 mt-1">Gedung 4 Lantai 1 — Jl. Margonda Raya No. 100, Pondok Cina, Depok</p>
                <p className="text-xs font-semibold text-purple-950 mt-3">Jam Operasional: Senin – Jumat: 08:30 – 15:30 WIB | Sabtu: 08:30 – 12:00 WIB</p>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0">
                  <BatikPhotoRibbon className="w-full h-1" />
                </div>
                <BatikCornerFlourish className="absolute top-0 right-0 w-8 h-8 text-amber-600/20 pointer-events-none rounded-tr-2xl" />
                <div className="flex items-center gap-2 mb-1 pt-1">
                  <BatikRosette size={14} />
                  <h4 className="text-sm font-bold text-slate-900">Loket Layanan BAAK Kampus J (Kalimalang)</h4>
                </div>
                <p className="text-xs text-slate-600 mt-1">Gedung 1 Lantai 2 — Jl. KH. Noer Ali, Jakasampurna, Bekasi Barat</p>
                <p className="text-xs font-semibold text-purple-950 mt-3">Jam Operasional: Senin – Jumat: 08:30 – 15:30 WIB | Sabtu: 08:30 – 12:00 WIB</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ========================================================= */}
      {/* INSTITUTIONAL FOOTER WITH BATIK TRIM & ROYAL PURPLE THEME */}
      {/* ========================================================= */}
      <footer className="relative bg-[#1A042D] text-slate-300 no-print overflow-hidden">
        {/* Top Indonesian Batik Parang ribbon trim */}
        <BatikPhotoRibbon className="w-full h-3" />

        {/* Rich background watermark */}
        <div className="absolute inset-0 opacity-18 pointer-events-none">
          <Image
            src="/images/batik_pattern_purple_gold.jpg"
            alt="Batik Background"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[#1A042D]/75" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-purple-900/60">
            {/* Left Brand */}
            <div className="flex items-center gap-3.5">
              <div className="w-13 h-13 relative flex items-center justify-center shrink-0 p-1 bg-white/15 rounded-2xl border border-amber-400/50 shadow-lg backdrop-blur-sm">
                <Image
                  src="/images/logogundar.png"
                  alt="Universitas Gunadarma Logo"
                  width={46}
                  height={46}
                  className="object-contain"
                  unoptimized
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-black text-base text-white tracking-tight">
                    UG ATTENDANCE
                  </p>
                  <BatikRosette size={14} goldColor="#FBBF24" primaryColor="#FFFFFF" />
                  <span className="text-[10px] font-bold text-amber-300 uppercase tracking-widest px-1.5 py-0.5 rounded bg-white/10">
                    BAAK
                  </span>
                </div>
                <p className="text-[12px] text-purple-200/90 font-medium">
                  Sistem Presensi Akademik Terintegrasi Universitas Gunadarma
                </p>
              </div>
            </div>

            {/* Nav links */}
            <div className="flex flex-wrap items-center gap-6 font-semibold text-purple-200 text-xs">
              <Link href="/" className="hover:text-amber-300 transition">Beranda</Link>
              <Link href="#keunggulan" className="hover:text-amber-300 transition">Tentang</Link>
              <Link href="#panduan" className="hover:text-amber-300 transition">Panduan</Link>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-purple-300/60">
            <p>© 2026 Universitas Gunadarma. All rights reserved.</p>
            <p>Biro Administrasi Akademik &amp; Kemahasiswaan (BAAK)</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
