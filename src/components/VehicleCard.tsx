"use client"

import { Vehicle } from "@/types"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Gauge, Settings, Fuel } from "lucide-react"

export default function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const formatter = new Intl.NumberFormat('es-UY', {
    maximumFractionDigits: 0,
  })

  return (
    <Link href={`/auto/${vehicle.id}`}>
      <Card className="overflow-hidden cursor-pointer group hover:shadow-xl transition-all duration-300 border-none bg-zinc-50 h-full flex flex-col">
        <div className="relative aspect-[4/3] overflow-hidden bg-zinc-200 shrink-0">
          {vehicle.fotos[0] ? (
            <>
              {/* Fondo borroso para rellenar los bordes sin recortar la foto */}
              <img
                src={vehicle.fotos[0]}
                alt=""
                className="absolute inset-0 w-full h-full object-cover opacity-60 blur-lg scale-110"
              />
              {/* Imagen principal sin recortes */}
              <img
                src={vehicle.fotos[0]}
                alt={`${vehicle.marca} ${vehicle.modelo}`}
                className="relative z-10 w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 drop-shadow-md"
              />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-400">
              Sin foto
            </div>
          )}
        </div>
        <CardContent className="px-3 py-2 sm:px-4 sm:py-3 flex flex-col flex-1">
          <h3 className="font-bold text-base text-zinc-900 leading-tight truncate">
            {vehicle.marca} {vehicle.modelo} {vehicle.anio}
          </h3>
          
          <div className="font-bold text-[#D60006] text-xl">U$S {formatter.format(vehicle.precio)}</div>
          
          <div className="mt-auto flex flex-wrap gap-x-3 gap-y-2 text-[11px] sm:text-xs font-medium text-zinc-500">
            <span className="flex items-center gap-1"><Gauge size={14} className="text-zinc-400" /> {vehicle.kilometraje.toLocaleString()} km</span>
            <span className="flex items-center gap-1"><Settings size={14} className="text-zinc-400" /> {vehicle.transmision}</span>
            <span className="flex items-center gap-1"><Fuel size={14} className="text-zinc-400" /> {vehicle.combustible}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
