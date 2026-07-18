"use client"

import WhatsAppIcon from "./WhatsAppIcon"

export default function WhatsAppButton({ phoneNumber }: { phoneNumber?: string }) {
  const finalNumber = (phoneNumber || "59898388560").replace(/\D/g, "")
  return (
    <a
      href={`https://wa.me/${finalNumber}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 hover:scale-110 transition-all duration-300"
      aria-label="Contactar por WhatsApp"
    >
      <WhatsAppIcon size={28} />
    </a>
  )
}
