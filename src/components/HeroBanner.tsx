"use client"

import { useState, useEffect } from "react"
import { SiteSettings } from "@/types"

export default function HeroBanner({ settings }: { settings: SiteSettings | null }) {
  const images = settings?.banner_images?.length ? settings.banner_images : ["/banner_ultimo.jpg"]
  const mobileImages = settings?.mobile_banner_images?.length ? settings.mobile_banner_images : ["/bannercelu.jpg"]
  const autoplay = settings ? settings.banner_autoplay : true
  
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const maxLen = Math.max(images.length, mobileImages.length)
    if (!autoplay || maxLen <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % 120) // Use 120 to be divisible by 1,2,3,4,etc.
    }, 5000)

    return () => clearInterval(interval)
  }, [autoplay, images.length, mobileImages.length])

  return (
    <div className="relative w-full overflow-hidden border-b border-zinc-200 bg-zinc-100 flex items-center justify-center">
      {/* Desktop Banner (hidden on mobile) */}
      {images.map((img, idx) => (
        <img
          key={`desktop-${idx}`}
          src={img}
          alt={`Banner Desktop ${idx + 1}`}
          className={`hidden sm:block w-full h-auto max-h-[420px] object-cover object-top transition-opacity duration-1000 ease-in-out ${
            idx === (currentIndex % images.length) ? "opacity-100 relative z-10" : "opacity-0 absolute inset-0 z-0"
          }`}
        />
      ))}

      {/* Mobile Banner (hidden on desktop) */}
      {mobileImages.map((img, idx) => (
        <img
          key={`mobile-${idx}`}
          src={img}
          alt={`Banner Móvil ${idx + 1}`}
          className={`sm:hidden w-full h-auto object-cover object-top transition-opacity duration-1000 ease-in-out ${
            idx === (currentIndex % mobileImages.length) ? "opacity-100 relative z-10" : "opacity-0 absolute inset-0 z-0"
          }`}
        />
      ))}

      {/* Desktop Navigation Dots */}
      {images.length > 1 && (
        <div className="absolute bottom-6 left-0 right-0 z-20 hidden sm:flex justify-center gap-2">
          {images.map((_, idx) => (
            <button
              key={`dot-desk-${idx}`}
              onClick={() => setCurrentIndex(idx)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                idx === (currentIndex % images.length) ? "bg-white scale-125" : "bg-white/40 hover:bg-white/60"
              }`}
              aria-label={`Ir a la imagen ${idx + 1}`}
            />
          ))}
        </div>
      )}

      {/* Mobile Navigation Dots */}
      {mobileImages.length > 1 && (
        <div className="absolute bottom-6 left-0 right-0 z-20 flex sm:hidden justify-center gap-2">
          {mobileImages.map((_, idx) => (
            <button
              key={`dot-mob-${idx}`}
              onClick={() => setCurrentIndex(idx)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                idx === (currentIndex % mobileImages.length) ? "bg-white scale-125" : "bg-white/40 hover:bg-white/60"
              }`}
              aria-label={`Ir a la imagen móvil ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
