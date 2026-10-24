import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind classes cleanly
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Normalizes any Indonesian phone number format to standard international WhatsApp format:
 * Examples:
 * - "081234567890" -> "6281234567890"
 * - "+6281234567890" -> "6281234567890"
 * - "+62 812-3456-7890" -> "6281234567890"
 * - "81234567890" -> "6281234567890"
 */
export function normalizeWhatsAppNumber(phone: string): string {
  if (!phone) return "";
  
  // Remove all non-numeric characters
  let clean = phone.replace(/\D/g, "");

  // If starts with "08", replace "0" with "62" -> "628..."
  if (clean.startsWith("08")) {
    clean = "62" + clean.slice(1);
  }
  // If starts with "8" (e.g. 81234567890), prepend "62"
  else if (clean.startsWith("8")) {
    clean = "62" + clean;
  }
  // If starts with "6208", fix to "628..."
  else if (clean.startsWith("6208")) {
    clean = "628" + clean.slice(4);
  }

  return clean;
}

/**
 * Format a Date or ISO string into Indonesian standard display:
 * Example: "Senin, 20 Oktober 2026 - 08:35 WIB"
 */
export function formatIndonesianDateTime(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return "-";
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return "-";

  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const dayName = days[date.getDay()];
  const day = date.getDate().toString().padStart(2, "0");
  const monthName = months[date.getMonth()];
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  return `${dayName}, ${day} ${monthName} ${year} - ${hours}:${minutes} WIB`;
}

/**
 * Format time only: "08:35 WIB"
 */
export function formatIndonesianTime(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return "-";
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return "-";

  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes} WIB`;
}
