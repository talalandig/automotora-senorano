"use client"

import { Filter } from "lucide-react"
import { useRouter } from "next/navigation"

interface CatalogFilterProps {
  currentTipo: string
  currentAnio: string
  currentKm: string
  currentPrecio: string
  uniqueYears: number[]
}

export default function CatalogFilter({ currentTipo, currentAnio, currentKm, currentPrecio, uniqueYears }: CatalogFilterProps) {
  const router = useRouter()

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams()
    
    // Maintain existing query params while updating the new one
    if (key === 'tipo' && value) params.set('tipo', value)
    else if (key !== 'tipo' && currentTipo) params.set('tipo', currentTipo)
    
    if (key === 'anio' && value) params.set('anio', value)
    else if (key !== 'anio' && currentAnio) params.set('anio', currentAnio)

    if (key === 'km' && value) params.set('km', value)
    else if (key !== 'km' && currentKm) params.set('km', currentKm)

    if (key === 'precio' && value) params.set('precio', value)
    else if (key !== 'precio' && currentPrecio) params.set('precio', currentPrecio)

    router.push(`/?${params.toString()}`, { scroll: false })
  }

  const handleClear = () => {
    router.push('/', { scroll: false })
  }

  return (
    <div className="bg-white p-3 sm:p-4 rounded-xl border border-zinc-200 shadow-sm mb-8 flex flex-col sm:flex-row gap-3 sm:gap-4 items-center justify-between">
      <div className="flex items-center justify-between w-full sm:w-auto gap-2">
        <div className="flex items-center gap-2 text-zinc-500 font-medium shrink-0">
          <Filter size={18} /> <span className="hidden sm:inline">Filtros</span>
        </div>
        <button 
          onClick={handleClear}
          className={`sm:hidden px-3 py-1 bg-black text-white text-xs font-medium rounded-md transition-opacity ${
            (currentTipo || currentAnio || currentKm || currentPrecio) ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          Limpiar
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full sm:flex-1">
        <select 
          value={currentTipo} 
          onChange={(e) => handleFilterChange('tipo', e.target.value)}
          className="w-full px-2 sm:px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-[11px] sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#D60006] text-zinc-700 font-medium"
        >
          <option value="">Tipo</option>
          <option value="Auto">Auto</option>
          <option value="Camioneta">Camioneta</option>
          <option value="Moto">Moto</option>
        </select>
        
        <select 
          value={currentAnio} 
          onChange={(e) => handleFilterChange('anio', e.target.value)}
          className="w-full px-2 sm:px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-[11px] sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#D60006] text-zinc-700 font-medium"
        >
          <option value="">Año</option>
          {uniqueYears.map(y => (
            <option key={y} value={String(y)}>{y}</option>
          ))}
        </select>

        <select 
          value={currentKm} 
          onChange={(e) => handleFilterChange('km', e.target.value)}
          className="w-full px-2 sm:px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-[11px] sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#D60006] text-zinc-700 font-medium"
        >
          <option value="">Kilómetros</option>
          <option value="0-55000">0 - 55.000 KMS</option>
          <option value="55000-85000">55.000 - 85.000 KMS</option>
          <option value="85000-100000">85.000 - 100.000 KMS</option>
          <option value="100000-">Más de 100.000 KMS</option>
        </select>

        <select 
          value={currentPrecio} 
          onChange={(e) => handleFilterChange('precio', e.target.value)}
          className="w-full px-2 sm:px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-[11px] sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#D60006] text-zinc-700 font-medium"
        >
          <option value="">Precio</option>
          <option value="0-15000">U$S 0 - 15k</option>
          <option value="15000-25000">U$S 15k - 25k</option>
          <option value="25000-55000">U$S 25k - 55k</option>
          <option value="55000-">Más de U$S 55k</option>
        </select>
      </div>

      <button 
        onClick={handleClear}
        className={`hidden sm:block px-6 py-2 w-36 bg-black hover:bg-zinc-800 text-white font-medium rounded-lg transition-opacity text-sm text-center shrink-0 ${
          (currentTipo || currentAnio || currentKm || currentPrecio) ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        Limpiar filtros
      </button>
    </div>
  )
}
