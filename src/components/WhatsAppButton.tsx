"use client"

import WhatsAppIcon from "./WhatsAppIcon"

import { formatWhatsAppNumber } from "@/lib/utils"

export default function WhatsAppButton({ phoneNumber }: { phoneNumber?: string }) {
  const finalNumber = formatWhatsAppNumber(phoneNumber || "59898388560")
  return (
    <a
      href={`https://wa.me/${finalNumber}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 lg:bottom-12 lg:right-8 z-50 flex items-center justify-center w-14 h-14 lg:w-16 lg:h-16 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 hover:scale-110 transition-all duration-300 group"
      aria-label="Contactar por WhatsApp"
    >
      <WhatsAppIcon size={28} className="lg:scale-125 transition-transform" />
    </a>
  )
}
