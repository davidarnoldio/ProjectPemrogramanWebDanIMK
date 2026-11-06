"use client";

import FloatingNavbar from "@/components/FloatingNavbar";

interface LoginFloatingNavbarProps {
  currentRole?: "LECTURER" | "ADMIN";
}

export default function LoginFloatingNavbar({ currentRole = "LECTURER" }: LoginFloatingNavbarProps) {
  return <FloatingNavbar />;
}
