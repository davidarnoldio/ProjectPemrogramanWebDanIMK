import type { Metadata } from "next";
import "./globals.css";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";

export const metadata: Metadata = {
  title: "UG Attendance — Sistem Presensi QR Dinamis & Notifikasi WhatsApp",
  description:
    "Sistem Informasi Presensi Kampus Cerdas Berbasis QR Code Dinamis 5 Detik dan Notifikasi WhatsApp Real-time Orang Tua - Universitas Gunadarma",
  icons: {
    icon: [
      { url: "/images/logogundar.png", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    apple: "/images/logogundar.png",
    shortcut: "/images/logogundar.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-slate-50 text-slate-800 antialiased font-sans">
        <SmoothScrollProvider>
          {children}
        </SmoothScrollProvider>
      </body>
    </html>
  );
}

