"use client";

import { usePathname } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Exclude login form page from dashboard sidebar layout
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return <DashboardLayout role="ADMIN">{children}</DashboardLayout>;
}

