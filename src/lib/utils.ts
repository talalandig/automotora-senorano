import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatWhatsAppNumber(num: string): string {
  let cleaned = num.replace(/\D/g, "")
  if (cleaned.startsWith("0")) {
    cleaned = cleaned.substring(1)
  }
  if (!cleaned.startsWith("598")) {
    cleaned = "598" + cleaned
  }
  return cleaned
}
