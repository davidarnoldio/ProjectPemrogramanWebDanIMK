"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLenis } from "lenis/react";
import { motion, type Variants } from "framer-motion";
import {
  Home,
  Star,
  LayoutGrid,
  HelpCircle,
  ShieldCheck,
  GraduationCap,
  Smartphone,
  ArrowRight,
  Play,
  Zap,
  TrendingUp,
  Bell,
  Scan,
  Monitor,
  Clock,
  CheckCircle2,
  X,
  FileText,
} from "lucide-react";
import FloatingNavbar from "@/components/FloatingNavbar";

// Framer motion variants
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

// SVG: Intricate Top-Left Batik Mega Mendung Flourish Drape
function BatikTopLeftDrape() {
  return (
    <div className="absolute top-0 left-0 w-64 sm:w-80 md:w-96 h-64 sm:h-80 md:h-96 pointer-events-none select-none z-0 overflow-hidden">
      <svg
        viewBox="0 0 360 360"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="batikGradMain" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B0764" />
            <stop offset="60%" stopColor="#581C87" />
            <stop offset="100%" stopColor="#7E22CE" />
          </linearGradient>
          <linearGradient id="batikGradAccent" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9333EA" />
            <stop offset="100%" stopColor="#C084FC" />
          </linearGradient>
        </defs>

        {/* Main Ribbon Body */}
        <path
          d="M0 0 L240 0 C220 40 210 70 180 95 C140 130 90 140 60 190 C35 230 40 280 0 320 Z"
          fill="url(#batikGradMain)"
        />

        {/* Second Wave Layer */}
        <path
          d="M0 0 L180 0 C160 50 140 85 110 115 C75 150 45 175 25 220 C10 250 5 285 0 300 Z"
          fill="url(#batikGradAccent)"
          opacity="0.35"
        />

        {/* Intricate Kawung & Floral Filigree lines */}
        <g stroke="#FFFFFF" strokeWidth="1.2" opacity="0.65" fill="none">
          {/* Flower 1 */}
          <circle cx="80" cy="50" r="18" />
          <circle cx="80" cy="50" r="10" />
          <path d="M80 32 C75 42 75 58 80 68" />
          <path d="M80 32 C85 42 85 58 80 68" />
          <path d="M62 50 C72 45 88 45 98 50" />
          <path d="M62 50 C72 55 88 55 98 50" />

          {/* Flower 2 */}
          <circle cx="140" cy="35" r="14" />
          <circle cx="140" cy="35" r="7" />
          <path d="M140 21 C136 29 136 41 140 49" />
          <path d="M140 21 C144 29 144 41 140 49" />
          <path d="M126 35 C134 31 146 31 154 35" />
          <path d="M126 35 C134 39 146 39 154 35" />

          {/* Flower 3 */}
          <circle cx="50" cy="110" r="16" />
          <circle cx="50" cy="110" r="8" />
          <path d="M50 94 C46 102 46 118 50 126" />
          <path d="M50 94 C54 102 54 118 50 126" />

          {/* Swirls and Scallops */}
          <path d="M20 160 C35 155 50 165 45 180 C40 195 25 200 15 220" />
          <path d="M35 170 C45 170 50 180 45 190" />
          <path d="M70 85 C95 90 115 110 105 135 C98 150 80 155 70 170" />

          {/* Scallop edge */}
          <path d="M190 20 C185 35 170 45 155 55 C140 65 125 80 115 95 C105 110 90 125 75 145 C60 165 50 190 40 215 C30 240 20 270 0 295" strokeWidth="2" strokeDasharray="3 3" />
        </g>
      </svg>
    </div>
  );
}

// SVG: Intricate Right-Side Framing Batik Ribbon
function BatikRightRibbon() {
  return (
    <div className="absolute right-0 top-12 w-64 sm:w-80 md:w-96 h-96 sm:h-[450px] pointer-events-none select-none z-0 overflow-hidden">
      <svg
        viewBox="0 0 360 450"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="rightRibbonGrad" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3B0764" />
            <stop offset="50%" stopColor="#581C87" />
            <stop offset="100%" stopColor="#7E22CE" />
          </linearGradient>
        </defs>

        {/* Outer Ribbon Curve */}
        <path
          d="M360 40 C310 70 270 120 260 170 C245 230 280 290 270 350 C260 410 210 440 180 450 L360 450 Z"
          fill="url(#rightRibbonGrad)"
          opacity="0.95"
        />

        {/* Secondary Ribbon Edge */}
        <path
          d="M360 90 C325 115 295 155 285 200 C275 250 305 300 295 350 C285 400 250 435 220 450 L360 450 Z"
          fill="#9333EA"
          opacity="0.4"
        />

        {/* Filigree lines */}
        <g stroke="#FFFFFF" strokeWidth="1.2" opacity="0.6" fill="none">
          <circle cx="310" cy="180" r="16" />
          <circle cx="310" cy="180" r="8" />
          <circle cx="300" cy="280" r="14" />
          <circle cx="300" cy="280" r="7" />
          <path d="M280 140 C285 180 305 210 325 240" />
          <path d="M270 220 C275 260 295 290 315 320" />
          <path d="M260 300 C265 340 285 370 305 400" />
        </g>
      </svg>
    </div>
  );
}

// SVG: Batik Lace Motif for Top-Right Corner of Feature Cards
function BatikCardCorner() {
  return (
    <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none select-none overflow-hidden">
      <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
        <path
          d="M80 0 L80 60 C70 50 60 40 40 40 C20 40 10 30 0 20 L0 0 Z"
          fill="#581C87"
          opacity="0.12"
        />
        <g stroke="#581C87" strokeWidth="1" opacity="0.4" fill="none">
          <circle cx="65" cy="15" r="10" />
          <circle cx="65" cy="15" r="5" />
          <path d="M65 5 C62 10 62 20 65 25" />
          <path d="M55 15 C60 12 70 12 75 15" />
          <circle cx="45" cy="10" r="6" />
          <circle cx="70" cy="35" r="6" />
          <path d="M80 50 C65 45 55 35 50 20" strokeDasharray="2 2" />
        </g>
      </svg>
    </div>
  );
}

// SVG: Crisp Dynamic QR Code Matrix
function DynamicQRCodeSVG() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full fill-slate-900 select-none">
      {/* Position Marker: Top-Left */}
      <rect x="5" y="5" width="26" height="26" rx="4" fill="#581C87" />
      <rect x="9" y="9" width="18" height="18" rx="2" fill="#FFFFFF" />
      <rect x="13" y="13" width="10" height="10" rx="1" fill="#581C87" />

      {/* Position Marker: Top-Right */}
      <rect x="69" y="5" width="26" height="26" rx="4" fill="#581C87" />
      <rect x="73" y="9" width="18" height="18" rx="2" fill="#FFFFFF" />
      <rect x="77" y="13" width="10" height="10" rx="1" fill="#581C87" />

      {/* Position Marker: Bottom-Left */}
      <rect x="5" y="69" width="26" height="26" rx="4" fill="#581C87" />
      <rect x="9" y="73" width="18" height="18" rx="2" fill="#FFFFFF" />
      <rect x="13" y="77" width="10" height="10" rx="1" fill="#581C87" />

      {/* Timing and alignment bars */}
      <rect x="35" y="7" width="4" height="4" fill="#0F172A" />
      <rect x="43" y="7" width="4" height="4" fill="#0F172A" />
      <rect x="51" y="7" width="4" height="4" fill="#0F172A" />
      <rect x="59" y="7" width="4" height="4" fill="#0F172A" />

      <rect x="7" y="35" width="4" height="4" fill="#0F172A" />
      <rect x="7" y="43" width="4" height="4" fill="#0F172A" />
      <rect x="7" y="51" width="4" height="4" fill="#0F172A" />
      <rect x="7" y="59" width="4" height="4" fill="#0F172A" />

      {/* Matrix data cells */}
      <rect x="35" y="19" width="4" height="4" fill="#0F172A" />
      <rect x="47" y="19" width="4" height="4" fill="#0F172A" />
      <rect x="55" y="19" width="4" height="4" fill="#0F172A" />
      <rect x="39" y="27" width="4" height="4" fill="#0F172A" />
      <rect x="47" y="27" width="4" height="4" fill="#0F172A" />
      <rect x="59" y="27" width="4" height="4" fill="#0F172A" />

      {/* Center cluster */}
      <rect x="35" y="35" width="8" height="8" rx="1" fill="#581C87" />
      <rect x="47" y="35" width="4" height="4" fill="#0F172A" />
      <rect x="55" y="35" width="8" height="4" fill="#0F172A" />
      <rect x="67" y="35" width="4" height="8" fill="#0F172A" />
      <rect x="75" y="35" width="4" height="4" fill="#0F172A" />
      <rect x="83" y="35" width="8" height="4" fill="#0F172A" />

      <rect x="19" y="47" width="8" height="4" fill="#0F172A" />
      <rect x="31" y="47" width="4" height="8" fill="#0F172A" />
      <rect x="43" y="47" width="6" height="6" rx="1" fill="#7E22CE" />
      <rect x="55" y="47" width="4" height="4" fill="#0F172A" />
      <rect x="67" y="47" width="8" height="4" fill="#0F172A" />
      <rect x="83" y="47" width="4" height="8" fill="#0F172A" />

      <rect x="19" y="59" width="4" height="4" fill="#0F172A" />
      <rect x="27" y="59" width="8" height="4" fill="#0F172A" />
      <rect x="39" y="59" width="4" height="4" fill="#0F172A" />
      <rect x="51" y="59" width="8" height="4" fill="#0F172A" />
      <rect x="63" y="59" width="4" height="8" fill="#0F172A" />
      <rect x="75" y="59" width="8" height="4" fill="#0F172A" />

      <rect x="35" y="67" width="8" height="4" fill="#0F172A" />
      <rect x="47" y="67" width="4" height="8" fill="#0F172A" />
      <rect x="59" y="67" width="4" height="4" fill="#0F172A" />
      <rect x="71" y="67" width="8" height="4" fill="#0F172A" />
      <rect x="83" y="67" width="4" height="4" fill="#0F172A" />

      <rect x="35" y="79" width="4" height="4" fill="#0F172A" />
      <rect x="43" y="79" width="8" height="4" fill="#0F172A" />
      <rect x="55" y="79" width="4" height="8" fill="#0F172A" />
      <rect x="67" y="79" width="4" height="4" fill="#0F172A" />
      <rect x="75" y="79" width="8" height="8" rx="1" fill="#581C87" />

      <rect x="39" y="87" width="4" height="4" fill="#0F172A" />
      <rect x="47" y="87" width="8" height="4" fill="#0F172A" />
      <rect x="63" y="87" width="8" height="4" fill="#0F172A" />
    </svg>
  );
}

export default function HomePage() {
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const lenis = useLenis();

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9FD] text-slate-800 antialiased font-sans selection:bg-purple-100 selection:text-purple-900 relative overflow-x-hidden">
      {/* Decorative Top-Left Indonesian Batik Flourish */}
      <BatikTopLeftDrape />

      {/* Decorative Right-Side Framing Batik Ribbon */}
      <BatikRightRibbon />

      {/* ========================================================= */}
      {/* 1. FLOATING ISLAND NAVBAR                                 */}
      {/* ========================================================= */}
      <FloatingNavbar />

      {/* ========================================================= */}
      {/* 2. HERO SECTION                                           */}
      {/* ========================================================= */}
      <main id="beranda" className="flex-1 w-full relative">
        <motion.section
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-6 lg:pt-10 lg:pb-10"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
            {/* Left Column: Headline & Action Buttons */}
            <motion.div variants={itemVariants} className="lg:col-span-6 space-y-5 z-10">
              {/* Category Pill */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100/90 text-purple-950 text-xs font-bold border border-purple-200">
                <span className="w-2 h-2 rounded-full bg-purple-700" />
                <span>Sistem Presensi Digital</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-black text-slate-900 tracking-tight leading-[1.12]">
                Presensi Kuliah,<br />
                <span className="text-purple-900">Lebih Mudah &amp;</span><br />
                <span>Terintegrasi</span>
              </h1>

              {/* Subtitle Paragraph */}
              <p className="text-sm sm:text-base text-slate-600 max-w-lg leading-relaxed">
                Sistem presensi digital Universitas Gunadarma dengan QR Code dinamis, monitoring real-time, dan notifikasi otomatis.
              </p>

              {/* Two CTA Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsStudentModalOpen(true)}
                  className="px-5 py-3 rounded-2xl bg-purple-950 hover:bg-purple-900 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-[0.99] cursor-pointer"
                >
                  <LayoutGrid className="w-4 h-4 text-purple-200" />
                  <span>Masuk Portal Mahasiswa</span>
                  <ArrowRight className="w-4 h-4 text-purple-200" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const el = document.querySelector("#keunggulan");
                    if (el) {
                      lenis?.scrollTo(el as HTMLElement, { offset: -40, duration: 1.1 }) ||
                        el.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                  className="px-5 py-3 rounded-2xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs transition cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 text-purple-900 fill-purple-900" />
                  <span>Lihat Cara Kerja</span>
                </button>
              </div>
            </motion.div>

            {/* Right Column: Campus Backdrop + Realistic 3D Phone + Dynamic QR Card */}
            <motion.div
              variants={itemVariants}
              className="lg:col-span-6 relative flex items-center justify-center lg:justify-end mt-4 lg:mt-0 min-h-[440px]"
            >
              {/* Campus Building Backdrop */}
              <div className="absolute right-0 top-0 bottom-0 w-full sm:w-[460px] rounded-3xl overflow-hidden opacity-35 pointer-events-none select-none z-0">
                <Image
                  src="/images/campus_gunadarma.jpg"
                  alt="Universitas Gunadarma Campus"
                  fill
                  priority
                  className="object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#FAF9FD] via-[#FAF9FD]/50 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#FAF9FD] via-transparent to-transparent" />
              </div>

              {/* Realistic 3D-angled iPhone Mockup */}
              <div
                className="relative z-10 w-[265px] sm:w-[280px] drop-shadow-2xl transition-transform"
                style={{
                  transform: "perspective(1100px) rotateY(-8deg) rotateX(4deg) rotate(-2deg)",
                }}
              >
                {/* iPhone Frame */}
                <div className="relative rounded-[42px] border-[6px] border-slate-800 bg-slate-900 shadow-2xl overflow-hidden">
                  {/* Dynamic Island Pill */}
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-3.5 bg-black rounded-full z-30 flex items-center justify-center" />

                  {/* Phone Screen UI */}
                  <div className="bg-slate-50 text-slate-900 pt-7 pb-5 px-3.5 font-sans select-none relative overflow-hidden">
                    {/* Screen Header */}
                    <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/60 relative z-10">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 relative flex items-center justify-center shrink-0 p-0.5 bg-white rounded-md border border-purple-200">
                          <Image
                            src="/images/logogundar.png"
                            alt="Logo Gunadarma"
                            width={18}
                            height={18}
                            className="object-contain"
                            unoptimized
                          />
                        </div>
                        <span className="text-[10px] font-black tracking-tight text-slate-900">
                          UG ATTENDANCE
                        </span>
                      </div>
                      <span className="text-[9px] font-bold text-slate-400">11.01</span>
                    </div>

                    {/* Greeting Banner */}
                    <div className="mt-2.5 p-3 rounded-2xl bg-gradient-to-r from-purple-900 via-purple-800 to-purple-950 text-white flex items-center justify-between shadow-xs relative overflow-hidden">
                      <div className="relative z-10">
                        <p className="text-[11px] font-extrabold text-white leading-tight">
                          Halo, Mahasiswa!
                        </p>
                        <p className="text-[9px] text-purple-200 mt-0.5">Semangat kuliah hari ini</p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center shrink-0 z-10">
                        <GraduationCap className="w-4 h-4 text-purple-100" />
                      </div>
                    </div>

                    {/* Attendance Rate Circle Widget */}
                    <div className="mt-2 p-2.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-3">
                      <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                          <path
                            className="text-slate-100"
                            strokeWidth="3.5"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                          <path
                            className="text-emerald-500"
                            strokeDasharray="92.4, 100"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-base font-black text-slate-900 leading-tight">92,4%</p>
                        <p className="text-[9px] text-slate-500 font-semibold">Total Kehadiran</p>
                      </div>
                    </div>

                    {/* Today Schedule Item */}
                    <div className="mt-2 p-2.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                      <div className="flex items-center justify-between pb-1 text-[8px] text-slate-400 font-medium">
                        <span>Jadwal Kuliah Hari Ini</span>
                        <span>Sen, 19 Jun 2026</span>
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <div>
                          <p className="text-[10px] font-bold text-slate-900 leading-tight">
                            Pemrograman Web
                          </p>
                          <p className="text-[8px] text-slate-500">08.00 - 10.00 WIB</p>
                        </div>
                        <span className="text-[8px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          Hadir
                        </span>
                      </div>
                    </div>

                    {/* Bottom App Navigation inside phone */}
                    <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-around text-slate-400 text-[8px]">
                      <div className="text-purple-900 font-bold flex flex-col items-center">
                        <Home className="w-3.5 h-3.5" />
                        <span className="text-[7px]">Beranda</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <FileText className="w-3.5 h-3.5" />
                        <span className="text-[7px]">Riwayat</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <Smartphone className="w-3.5 h-3.5" />
                        <span className="text-[7px]">Profil</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Dynamic QR Card */}
              <div
                className="absolute right-0 sm:-right-4 top-1/2 -translate-y-1/2 z-20 w-48 sm:w-52 p-4 rounded-2xl bg-white/95 backdrop-blur-md shadow-2xl border border-purple-100 transition-transform"
                style={{
                  transform: "rotate(3deg) translateY(-8px)",
                }}
              >
                {/* Radiating Doodle Rays on Top Right */}
                <div className="absolute -top-3.5 -right-3 text-purple-700 pointer-events-none select-none">
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                    <line x1="14" y1="2" x2="14" y2="7" />
                    <line x1="22" y1="6" x2="18" y2="10" />
                    <line x1="26" y1="14" x2="21" y2="14" />
                  </svg>
                </div>

                {/* QR Header */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                  <span className="text-xs font-black text-slate-900 tracking-tight">QR Dinamis</span>
                  <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-purple-50 text-purple-900 text-[10px] font-mono font-bold border border-purple-200">
                    <Clock className="w-3 h-3 text-purple-700" />
                    <span>5s</span>
                  </div>
                </div>

                {/* SVG QR Matrix */}
                <div className="w-full aspect-square p-2 bg-slate-50 rounded-xl border border-slate-200/70 flex items-center justify-center">
                  <DynamicQRCodeSVG />
                </div>

                {/* Caption */}
                <p className="text-[10px] text-center text-slate-500 font-semibold mt-2">
                  Scan untuk Presensi
                </p>
              </div>
            </motion.div>
          </div>

          {/* ========================================================= */}
          {/* 3. HORIZONTAL QUICK FEATURES STRIP                        */}
          {/* ========================================================= */}
          <motion.div
            id="alur-presensi"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mt-10 sm:mt-12 bg-white rounded-2xl shadow-sm border border-slate-200/80 p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10"
          >
            {/* Feature 1 */}
            <motion.div
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-3.5 p-2 rounded-xl hover:bg-slate-50 transition"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-900 shrink-0">
                <Zap className="w-5 h-5 text-purple-900" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900">QR Dinamis 5 Detik</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Keamanan lebih terjaga</p>
              </div>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-3.5 p-2 rounded-xl hover:bg-slate-50 transition"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-900 shrink-0">
                <TrendingUp className="w-5 h-5 text-purple-900" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900">Monitoring Real-time</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Pantau kehadiran secara langsung</p>
              </div>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-3.5 p-2 rounded-xl hover:bg-slate-50 transition"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-900 shrink-0">
                <Bell className="w-5 h-5 text-purple-900" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900">Notifikasi Otomatis</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Informasi kehadiran terkini</p>
              </div>
            </motion.div>

            {/* Feature 4 */}
            <motion.div
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-3.5 p-2 rounded-xl hover:bg-slate-50 transition"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-900 shrink-0">
                <ShieldCheck className="w-5 h-5 text-purple-900" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900">Data Terintegrasi</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Akurat &amp; terpercaya</p>
              </div>
            </motion.div>
          </motion.div>
        </motion.section>

        {/* ========================================================= */}
        {/* 4. SECTION: FITUR UNGGULAN                                */}
        {/* ========================================================= */}
        <section id="keunggulan" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-14 relative z-10">
          {/* Section Divider & Headline */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-purple-950 mb-1.5">
              <span className="text-purple-400">―◆―</span>
              <span>Fitur Unggulan</span>
              <span className="text-purple-400">―◆―</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Solusi Presensi Modern untuk Dunia Akademik
            </h2>
          </motion.div>

          {/* 3 Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Presensi dengan QR Dinamis */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.55, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
              className="group relative p-6 rounded-2xl bg-white border border-slate-200 hover:border-purple-300 hover:shadow-xl transition-all flex flex-col justify-between overflow-hidden"
            >
              <BatikCardCorner />

              <div>
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-900 border border-purple-200 flex items-center justify-center mb-4 shadow-xs">
                  <Scan className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-base text-slate-900">
                  Presensi dengan QR Dinamis
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Scan QR Code yang selalu berubah setiap 5 detik untuk keamanan maksimal.
                </p>
              </div>

              <div className="pt-4 flex justify-end">
                <div className="w-8 h-8 rounded-full bg-purple-950 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </motion.div>

            {/* Card 2: Monitoring Real-time */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.55, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
              className="group relative p-6 rounded-2xl bg-white border border-slate-200 hover:border-purple-300 hover:shadow-xl transition-all flex flex-col justify-between overflow-hidden"
            >
              <BatikCardCorner />

              <div>
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-900 border border-purple-200 flex items-center justify-center mb-4 shadow-xs">
                  <Monitor className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-base text-slate-900">
                  Monitoring Real-time
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Pantau kehadiran kelas secara langsung dan akurat.
                </p>
              </div>

              <div className="pt-4 flex justify-end">
                <div className="w-8 h-8 rounded-full bg-purple-950 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </motion.div>

            {/* Card 3: Notifikasi Otomatis */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.55, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
              className="group relative p-6 rounded-2xl bg-white border border-slate-200 hover:border-purple-300 hover:shadow-xl transition-all flex flex-col justify-between overflow-hidden"
            >
              <BatikCardCorner />

              <div>
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-900 border border-purple-200 flex items-center justify-center mb-4 shadow-xs">
                  <Bell className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-base text-slate-900">
                  Notifikasi Otomatis
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Terima notifikasi kehadiran melalui WhatsApp.
                </p>
              </div>

              <div className="pt-4 flex justify-end">
                <div className="w-8 h-8 rounded-full bg-purple-950 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 5. BOTTOM FLOWING PURPLE WAVE & CITY SKYLINE SILHOUETTE   */}
        {/* ========================================================= */}
        <div id="bantuan" className="w-full relative mt-auto overflow-hidden pointer-events-none select-none">
          <div className="w-full h-44 sm:h-56 lg:h-64 relative">
            <svg
              viewBox="0 0 1440 280"
              className="w-full h-full"
              preserveAspectRatio="none"
              fill="none"
            >
              <defs>
                <linearGradient id="mainBottomWaveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4A0E4E" />
                  <stop offset="40%" stopColor="#581C87" />
                  <stop offset="80%" stopColor="#6B21A8" />
                  <stop offset="100%" stopColor="#3B0764" />
                </linearGradient>
                <linearGradient id="backBottomWaveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7E22CE" />
                  <stop offset="100%" stopColor="#4A0E4E" />
                </linearGradient>
              </defs>

              {/* Back Soft Wave */}
              <path
                d="M0,60 C320,140 480,20 800,100 C1120,180 1280,40 1440,90 L1440,280 L0,280 Z"
                fill="url(#backBottomWaveGrad)"
                opacity="0.35"
              />

              {/* Front Main Wave */}
              <path
                d="M0,120 C240,40 480,180 840,110 C1200,40 1340,160 1440,140 L1440,280 L0,280 Z"
                fill="url(#mainBottomWaveGrad)"
              />

              {/* Left Mega Mendung Cloud Batik Motif on Wave */}
              <g stroke="#FFFFFF" strokeWidth="1.2" opacity="0.3" fill="none">
                <path d="M40 220 C60 200 90 200 110 220 C130 200 160 200 180 220 C200 240 180 260 160 270" />
                <path d="M60 235 C75 220 95 220 110 235 C125 220 145 220 160 235" />
                <path d="M80 250 C90 240 105 240 115 250 C125 240 140 240 150 250" />
              </g>

              {/* Right Modern City Skyline Silhouette */}
              <g fill="#E9D5FF" opacity="0.4">
                <rect x="1180" y="140" width="14" height="140" />
                <rect x="1198" y="110" width="16" height="170" />
                <polygon points="1206,90 1198,110 1214,110" />
                <rect x="1218" y="130" width="12" height="150" />
                <rect x="1234" y="95" width="20" height="185" />
                <polygon points="1244,75 1234,95 1254,95" />
                <rect x="1258" y="125" width="14" height="155" />
                <rect x="1276" y="145" width="18" height="135" />
                <rect x="1298" y="115" width="16" height="165" />
                <polygon points="1306,95 1298,115 1314,115" />
                <rect x="1318" y="135" width="14" height="145" />
                <rect x="1336" y="150" width="18" height="130" />
                <rect x="1358" y="120" width="22" height="160" />
                <polygon points="1369,100 1358,120 1380,120" />
                <rect x="1384" y="140" width="16" height="140" />
                <rect x="1404" y="130" width="20" height="150" />
              </g>
            </svg>
          </div>
        </div>
      </main>

      {/* ========================================================= */}
      {/* 6. MODAL: MASUK PORTAL MAHASISWA                          */}
      {/* ========================================================= */}
      {isStudentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden">
            <div className="h-2 w-full bg-gradient-to-r from-purple-800 via-purple-600 to-amber-500" />
            <div className="p-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-purple-900" />
                  <h3 className="font-black text-base text-slate-900">
                    Aplikasi Mobile Mahasiswa
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsStudentModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3.5 text-xs text-slate-600">
                <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200 text-purple-950">
                  <p className="font-bold text-sm text-purple-900 mb-1">
                    Presensi Dilakukan Melalui Smartphone Android
                  </p>
                  <p className="text-xs leading-relaxed text-purple-800">
                    Mahasiswa melakukan pemindaian QR Code di layar kelas melalui aplikasi resmi <strong>UG Attendance Mobile</strong>.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Login NIM:</strong> Gunakan NIM Anda (contoh: 10124001) dan password NIM untuk masuk pertama kali.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Device Binding:</strong> Smartphone Anda akan terikat otomatis untuk mencegah titip absen.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Geofencing Kampus:</strong> Presensi divalidasi dalam radius area kampus Universitas Gunadarma.</span>
                  </div>
                </div>

                <div className="pt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsStudentModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl bg-purple-950 hover:bg-purple-900 text-white font-bold text-xs shadow-sm transition"
                  >
                    Mengerti
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
