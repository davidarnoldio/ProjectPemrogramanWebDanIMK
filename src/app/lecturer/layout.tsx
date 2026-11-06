"use client";

import { usePathname } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function LecturerRootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Exclude login form page from dashboard sidebar layout
  if (pathname === "/lecturer/login") {
    return <>{children}</>;
  }

  return <DashboardLayout role="LECTURER">{children}</DashboardLayout>;
}

