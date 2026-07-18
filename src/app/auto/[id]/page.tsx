"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Vehicle, SiteSettings } from "@/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Check, Calendar, Fuel, Gauge, Settings, User, MapPin, Phone, X } from "lucide-react"

import WhatsAppIcon from "@/components/WhatsAppIcon"
import Link from "next/link"
import AdminNavButton from "@/components/AdminNavButton"
import MobileAdminHeader from "@/components/MobileAdminHeader"

export default function AutoPage() {
  const params = useParams()
  const id = params?.id as string
  const router = useRouter()
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0)
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)

  const handlePrevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (vehicle?.fotos?.length) {
      setCurrentImageIndex((prev) => (prev === 0 ? vehicle.fotos.length - 1 : prev - 1))
    }
  }

  const handleNextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (vehicle?.fotos?.length) {
      setCurrentImageIndex((prev) => (prev === vehicle.fotos.length - 1 ? 0 : prev + 1))
    }
  }

  useEffect(() => {
    async function fetchVehicle() {
      try {
        const [vehicleRes, settingsRes] = await Promise.all([
          supabase.from('vehicles').select('*').eq('id', id).single(),
          supabase.from('site_settings').select('*').eq('id', 1).single()
        ])
        
        if (vehicleRes.error) throw vehicleRes.error
        setVehicle(vehicleRes.data)
        if (settingsRes.data) setSiteSettings(settingsRes.data as SiteSettings)
        setCurrentImageIndex(0)
      } catch (err) {
        console.error("Error fetching vehicle:", err)
      } finally {
        setLoading(false)
      }
    }
    
    if (id) fetchVehicle()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D60006]"></div>
      </div>
    )
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-2xl font-bold text-zinc-900 mb-2">Vehículo no encontrado</h1>
        <p className="text-zinc-500 mb-6">El vehículo que buscas ya no está disponible o el enlace es incorrecto.</p>
        <Button onClick={() => router.push("/")} className="bg-[#D60006] hover:bg-[#b00005]">
          Volver al catálogo
        </Button>
      </div>
    )
  }

  const formatter = new Intl.NumberFormat('es-UY', {
    maximumFractionDigits: 0,
  })

  const currentUrl = typeof window !== "undefined" ? window.location.href : ""
  const wppText = encodeURIComponent(`Me interesa este vehiculo: ${currentUrl}`)

  return (
    <div className="h-screen bg-zinc-50 flex flex-col overflow-hidden">
      {/* Global Header */}
      <header className="bg-white shrink-0 z-50 shadow-sm border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-2 sm:py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center shrink-0">
            <img src="/logo11auto.jpg" alt="FPA-AUTOMOTORA Logo" className="h-10 sm:h-16 w-auto object-contain transition-transform hover:scale-105" />
          </Link>
          <div className="flex items-center gap-2 sm:gap-6">
            <div className="flex flex-col items-end sm:flex-row sm:items-center gap-1 sm:gap-6">
              <div className="flex items-center gap-1 font-bold text-[11px] sm:text-base text-zinc-800">
                <MapPin className="text-[#D60006] w-3 h-3 sm:w-5 sm:h-5 shrink-0" />
                <span className="whitespace-nowrap">{siteSettings?.address || "Agraciada 1668 Salto, Uy."}</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <Phone className="text-[#D60006] w-3 h-3 sm:w-6 sm:h-6 shrink-0" />
                <div className="flex flex-row sm:flex-col font-bold text-[11px] sm:text-base text-zinc-800 leading-tight gap-2 sm:gap-0.5 items-center sm:items-start">
                  <a href={`https://wa.me/${(siteSettings?.phone1 || "098 388 560").replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="hover:text-[#D60006] transition-colors whitespace-nowrap">
                    {siteSettings?.phone1 || "098 388 560"}
                  </a>
                  <span className="sm:hidden text-zinc-300 font-normal">|</span>
                  <a href={`https://wa.me/${(siteSettings?.phone2 || "091 057 513").replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="hover:text-[#D60006] transition-colors whitespace-nowrap">
                    {siteSettings?.phone2 || "091 057 513"}
                  </a>
                </div>
              </div>
            </div>
            <div className="hidden sm:block">
              <AdminNavButton />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Admin Header */}
      <MobileAdminHeader />

      <div className="flex-1 overflow-y-auto pb-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8 mt-6">
          {/* Back Button */}
          <Link 
            href="/"
            className="flex items-center gap-2 w-fit text-zinc-500 hover:text-zinc-900 font-medium mb-6 transition-colors"
          >
            <ArrowLeft size={18} />
            Volver al listado
          </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-8 gap-y-4 lg:gap-y-6">
          
          {/* Columna Izquierda: Galería */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div 
              className="w-full aspect-[4/3] rounded-2xl overflow-hidden bg-zinc-200 shadow-md relative flex items-center justify-center cursor-pointer group lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-2"
              onClick={() => setIsLightboxOpen(true)}
            >
              {/* Fondo borroso */}
              <img
                src={vehicle.fotos[currentImageIndex]}
                alt=""
                className="absolute inset-0 w-full h-full object-cover opacity-60 blur-2xl scale-110"
              />
              {/* Imagen principal sin recorte */}
              <img
                src={vehicle.fotos[currentImageIndex]}
                alt={`${vehicle.marca} ${vehicle.modelo}`}
                className="relative z-10 w-full h-full object-contain drop-shadow-xl"
              />
              {vehicle.estado === 'vendido' && (
                <Badge variant="destructive" className="absolute top-4 left-4 font-bold text-sm px-3 py-1 shadow-lg z-20">
                  VENDIDO
                </Badge>
              )}

              {/* Contador de fotos */}
              {vehicle.fotos.length > 1 && (
                <div className="absolute bottom-4 left-4 z-30 bg-black/60 text-white px-3 py-1 rounded-lg backdrop-blur-md font-semibold text-xs sm:text-sm tracking-wide shadow-lg">
                  {currentImageIndex + 1} / {vehicle.fotos.length}
                </div>
              )}
              
              {/* Arrows */}
              {vehicle.fotos.length > 1 && (
                <>
                  <button 
                    onClick={handlePrevImage}
                    className="absolute left-4 z-30 p-2 md:p-3 bg-white/80 hover:bg-white text-zinc-800 rounded-full shadow-lg transition-opacity backdrop-blur-md"
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <button 
                    onClick={handleNextImage}
                    className="absolute right-4 z-30 p-2 md:p-3 bg-white/80 hover:bg-white text-zinc-800 rounded-full shadow-lg transition-opacity backdrop-blur-md rotate-180"
                  >
                    <ArrowLeft size={20} />
                  </button>
                </>
              )}
            </div>
            
            {/* Thumbnails */}
            {vehicle.fotos.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 snap-x hide-scrollbar lg:col-start-1 lg:col-end-2 lg:row-start-2 lg:row-end-3">
                {vehicle.fotos.map((foto, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative w-24 h-24 shrink-0 rounded-xl overflow-hidden snap-start transition-all duration-300 border-[3px] ${
                      currentImageIndex === index 
                        ? 'border-[#D60006] scale-[0.98]' 
                        : 'border-transparent opacity-60 hover:opacity-100 hover:scale-[1.02]'
                    }`}
                  >
                    <img src={foto} alt={`Foto ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Columna Derecha: Info */}
          <div className="lg:col-span-5 relative">
            <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-6 md:p-8 h-full flex flex-col lg:absolute lg:inset-0 lg:overflow-y-auto">
              <h2 className="text-3xl md:text-4xl font-black text-zinc-900 leading-none tracking-tight mb-2">
                {vehicle.marca} <span className="text-zinc-500 font-medium">{vehicle.modelo}</span>
              </h2>
              
              <div className="text-4xl md:text-5xl font-bold text-[#D60006] mt-4 mb-8 tracking-tighter">
                U$S {formatter.format(vehicle.precio)}
              </div>

              <div className="grid grid-cols-2 gap-y-8 gap-x-6 py-8 border-y border-zinc-100 mb-8">
                <div>
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Año</p>
                  <p className="font-semibold text-lg text-zinc-900 flex items-center gap-2"><Calendar size={20} className="text-[#D60006]"/> {vehicle.anio}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Kilómetros</p>
                  <p className="font-semibold text-lg text-zinc-900 flex items-center gap-2"><Gauge size={20} className="text-[#D60006]"/> {vehicle.kilometraje.toLocaleString()} km</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Combustible</p>
                  <p className="font-semibold text-lg text-zinc-900 flex items-center gap-2"><Fuel size={20} className="text-[#D60006]"/> {vehicle.combustible}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Transmisión</p>
                  <p className="font-semibold text-lg text-zinc-900 flex items-center gap-2"><Settings size={20} className="text-[#D60006]"/> {vehicle.transmision}</p>
                </div>
                {vehicle.dueno && (
                  <div className="col-span-2">
                    <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Dueño</p>
                    <p className="font-semibold text-lg text-zinc-900 flex items-center gap-2"><User size={20} className="text-[#D60006]"/> {vehicle.dueno}</p>
                  </div>
                )}
              </div>

              {/* Removed description from here to put it below */}

              <div className="pt-4 mt-auto bg-white">
                <a href={`https://wa.me/${(siteSettings?.whatsapp_number || "59898388560").replace(/\D/g, "")}?text=${wppText}`} target="_blank" rel="noopener noreferrer" className="block">
                  <Button className="w-full h-16 text-lg font-bold bg-green-500 hover:bg-green-600 text-white shadow-xl shadow-green-500/20 transition-all hover:-translate-y-1 rounded-xl">
                    <WhatsAppIcon size={24} className="mr-3" />
                    Consultar por WhatsApp
                  </Button>
                </a>
              </div>
            </div>
          </div>

          {/* Description & Equipamiento section */}
          <div className="lg:col-span-12 mt-4 lg:mt-6 bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-zinc-100">
            {vehicle.otros && (
              <div className="mb-10 pb-10 border-b border-zinc-100">
                <h3 className="text-lg font-bold text-zinc-900 mb-4 flex items-center gap-2">
                  <Check size={22} className="text-[#D60006]" /> Equipamiento / Otros
                </h3>
                <p className="text-zinc-600 leading-relaxed whitespace-pre-wrap pl-8 text-base">
                  {vehicle.otros}
                </p>
              </div>
            )}

            <div>
              <h3 className="text-lg font-bold text-zinc-900 mb-4">Descripción general</h3>
              <p className="text-zinc-600 leading-relaxed whitespace-pre-wrap text-base">
                {vehicle.descripcion || 'Sin descripción adicional.'}
              </p>
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex flex-col items-center justify-center p-4">
          <button 
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 right-4 md:top-8 md:right-8 z-50 p-2 md:p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-md"
          >
            <X size={24} />
          </button>
          
          <img
            src={vehicle.fotos[currentImageIndex]}
            alt="Fullscreen"
            className="max-w-full max-h-[85vh] object-contain drop-shadow-2xl"
          />
          
          {vehicle.fotos.length > 1 && (
            <>
              <button 
                onClick={handlePrevImage}
                className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-50 p-3 md:p-4 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-md"
              >
                <ArrowLeft size={24} />
              </button>
              <button 
                onClick={handleNextImage}
                className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-50 p-3 md:p-4 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-md rotate-180"
              >
                <ArrowLeft size={24} />
              </button>
              
              <div className="absolute bottom-6 left-0 right-0 flex justify-center text-white/60 font-medium tracking-widest text-sm">
                {currentImageIndex + 1} / {vehicle.fotos.length}
              </div>
            </>
          )}
        </div>
      )}

      {/* Estilos para ocultar scrollbar en los thumbnails */}
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  )
}
