"use client"

import { useState, useRef, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Vehicle } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import ImageUploader, { ImageItem } from "./ImageUploader"
import { Search, ChevronDown, Check, Plus } from "lucide-react"

const POPULAR_BRANDS = ["Volkswagen", "Suzuki", "Toyota", "Fiat", "Peugeot", "Chevrolet", "Nissan", "Renault", "Ford", "Hyundai", "Citroën", "Honda", "BMW", "Mercedes-Benz"]
const CURRENT_YEAR = new Date().getFullYear() + 1
const YEARS = Array.from({ length: CURRENT_YEAR - 1990 + 1 }, (_, i) => CURRENT_YEAR - i)

export default function AdminForm({ vehicle, onSuccess, onCancel }: { vehicle?: Vehicle | null, onSuccess: () => void, onCancel: () => void }) {
  const [loading, setLoading] = useState(false)
  const [imageItems, setImageItems] = useState<ImageItem[]>([])
  
  const [marcaOpen, setMarcaOpen] = useState(false)
  const [marcaSearch, setMarcaSearch] = useState("")
  const marcaRef = useRef<HTMLDivElement>(null)

  const [anioOpen, setAnioOpen] = useState(false)
  const [anioSearch, setAnioSearch] = useState("")
  const anioRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (marcaRef.current && !marcaRef.current.contains(event.target as Node)) {
        setMarcaOpen(false)
      }
      if (anioRef.current && !anioRef.current.contains(event.target as Node)) {
        setAnioOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])
  
  const [formData, setFormData] = useState({
    marca: vehicle?.marca || "",
    modelo: vehicle?.modelo || "",
    anio: vehicle?.anio || new Date().getFullYear(),
    precio: vehicle?.precio || "",
    kilometraje: vehicle?.kilometraje || "",
    combustible: vehicle?.combustible || "Nafta",
    transmision: vehicle?.transmision || "Manual",
    tipo: vehicle?.tipo || "Auto",
    descripcion: vehicle?.descripcion || "",
    estado: vehicle?.estado || "disponible",
    otros: vehicle?.otros || "",
    dueno: vehicle?.dueno || "omitir",
    fotosExistentes: vehicle?.fotos || []
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSelect = (name: string, value: string | null) => {
    if (value) setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // 1. Upload new photos and preserve order
      const finalUrls: string[] = []
      
      for (const item of imageItems) {
        if (item.type === "url" && item.url) {
          finalUrls.push(item.url)
        } else if (item.type === "file" && item.file) {
          const fileExt = item.file.name.split('.').pop()
          const fileName = `${Math.random()}.${fileExt}`
          const filePath = `${fileName}`
          
          const { error: uploadError } = await supabase.storage
            .from('autos-fotos')
            .upload(filePath, item.file)
            
          if (uploadError) throw uploadError
          
          const { data: { publicUrl } } = supabase.storage
            .from('autos-fotos')
            .getPublicUrl(filePath)
            
          finalUrls.push(publicUrl)
        }
      }

      // 2. Save vehicle
      const dataToSave = {
        marca: formData.marca,
        modelo: formData.modelo,
        anio: parseInt(String(formData.anio)),
        precio: parseFloat(String(formData.precio)),
        kilometraje: parseInt(String(formData.kilometraje)),
        combustible: formData.combustible,
        transmision: formData.transmision,
        tipo: formData.tipo,
        descripcion: formData.descripcion,
        estado: formData.estado,
        otros: formData.otros,
        dueno: formData.dueno === "omitir" ? "" : formData.dueno,
        fotos: finalUrls
      }

      if (vehicle) {
        const { error } = await supabase.from('vehicles').update(dataToSave).eq('id', vehicle.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('vehicles').insert([dataToSave])
        if (error) throw error
      }

      onSuccess()
    } catch (error: any) {
      alert("Error al guardar: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
      <div className="grid grid-cols-2 gap-4">
        <div ref={marcaRef} className="relative">
          <label className="text-sm font-medium mb-1 block">Marca</label>
          <div 
            onClick={() => { setMarcaOpen(!marcaOpen); setMarcaSearch("") }}
            className="flex items-center justify-between w-full h-10 px-3 py-2 text-sm border border-zinc-200 rounded-md cursor-pointer bg-white hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-[#D60006]"
          >
            <span className={formData.marca ? "text-zinc-900" : "text-zinc-500 truncate"}>
              {formData.marca || "Seleccionar marca..."}
            </span>
            <ChevronDown size={16} className="text-zinc-400 shrink-0" />
          </div>

          {marcaOpen && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-zinc-200 rounded-md shadow-lg overflow-hidden">
              <div className="flex items-center px-3 border-b border-zinc-100">
                <Search size={14} className="text-zinc-400 mr-2 shrink-0" />
                <input 
                  type="text" 
                  autoFocus
                  placeholder="Buscar o crear nueva..." 
                  value={marcaSearch}
                  onChange={(e) => setMarcaSearch(e.target.value)}
                  className="flex-1 h-10 text-sm focus:outline-none bg-transparent"
                />
              </div>
              <ul className="max-h-[220px] overflow-y-auto p-1 scrollbar-thin">
                {POPULAR_BRANDS.filter(m => m.toLowerCase().includes(marcaSearch.toLowerCase())).map((marca) => (
                  <li 
                    key={marca}
                    onClick={() => { setFormData({ ...formData, marca }); setMarcaOpen(false) }}
                    className="flex items-center justify-between px-2 py-2 text-sm cursor-pointer hover:bg-zinc-100 rounded-sm transition-colors"
                  >
                    {marca}
                    {formData.marca === marca && <Check size={14} className="text-[#D60006]" />}
                  </li>
                ))}
                {marcaSearch.trim() !== "" && !POPULAR_BRANDS.some(m => m.toLowerCase() === marcaSearch.toLowerCase()) && (
                  <li 
                    onClick={() => { setFormData({ ...formData, marca: marcaSearch }); setMarcaOpen(false) }}
                    className="flex items-center gap-2 px-2 py-2 text-sm cursor-pointer hover:bg-red-50 rounded-sm text-[#D60006] font-medium transition-colors"
                  >
                    <Plus size={14} /> Crear "{marcaSearch}"
                  </li>
                )}
                {POPULAR_BRANDS.filter(m => m.toLowerCase().includes(marcaSearch.toLowerCase())).length === 0 && marcaSearch.trim() === "" && (
                  <li className="px-2 py-3 text-sm text-zinc-500 text-center">No se encontraron marcas</li>
                )}
              </ul>
            </div>
          )}
        </div>
        <div>
          <label className="text-sm font-medium">Modelo</label>
          <Input required name="modelo" value={formData.modelo} onChange={handleChange} />
        </div>
        <div ref={anioRef} className="relative">
          <label className="text-sm font-medium mb-1 block">Año</label>
          <div 
            onClick={() => { setAnioOpen(!anioOpen); setAnioSearch("") }}
            className="flex items-center justify-between w-full h-10 px-3 py-2 text-sm border border-zinc-200 rounded-md cursor-pointer bg-white hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-[#D60006]"
          >
            <span className={formData.anio ? "text-zinc-900" : "text-zinc-500 truncate"}>
              {formData.anio || "Seleccionar año..."}
            </span>
            <ChevronDown size={16} className="text-zinc-400 shrink-0" />
          </div>

          {anioOpen && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-zinc-200 rounded-md shadow-lg overflow-hidden">
              <div className="flex items-center px-3 border-b border-zinc-100">
                <Search size={14} className="text-zinc-400 mr-2 shrink-0" />
                <input 
                  type="text" 
                  autoFocus
                  placeholder="Buscar año..." 
                  value={anioSearch}
                  onChange={(e) => setAnioSearch(e.target.value)}
                  className="flex-1 h-10 text-sm focus:outline-none bg-transparent"
                />
              </div>
              <ul className="max-h-[220px] overflow-y-auto p-1 scrollbar-thin">
                {YEARS.filter(y => y.toString().includes(anioSearch)).map((year) => (
                  <li 
                    key={year}
                    onClick={() => { setFormData({ ...formData, anio: year }); setAnioOpen(false) }}
                    className="flex items-center justify-between px-2 py-2 text-sm cursor-pointer hover:bg-zinc-100 rounded-sm transition-colors"
                  >
                    {year}
                    {formData.anio === year && <Check size={14} className="text-[#D60006]" />}
                  </li>
                ))}
                {YEARS.filter(y => y.toString().includes(anioSearch)).length === 0 && (
                  <li className="px-2 py-3 text-sm text-zinc-500 text-center">No se encontraron años</li>
                )}
              </ul>
            </div>
          )}
        </div>
        <div>
          <label className="text-sm font-medium">Precio (U$S)</label>
          <Input required type="number" name="precio" value={formData.precio} onChange={handleChange} />
        </div>
        <div>
          <label className="text-sm font-medium">Kilómetros</label>
          <Input required type="number" name="kilometraje" value={formData.kilometraje} onChange={handleChange} />
        </div>
        <div>
          <label className="text-sm font-medium">Dueños</label>
          <Select value={formData.dueno} onValueChange={(v) => handleSelect("dueno", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Único dueño">Único dueño</SelectItem>
              <SelectItem value="Segundo dueño">Segundo dueño</SelectItem>
              <SelectItem value="omitir">Omitir</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium">Tipo</label>
          <Select value={formData.tipo} onValueChange={(v) => handleSelect("tipo", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Auto">Auto</SelectItem>
              <SelectItem value="Camioneta">Camioneta</SelectItem>
              <SelectItem value="Moto">Moto</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium">Combustible</label>
          <Select value={formData.combustible} onValueChange={(v) => handleSelect("combustible", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Nafta">Nafta</SelectItem>
              <SelectItem value="Diesel">Diesel</SelectItem>
              <SelectItem value="Eléctrico">Eléctrico</SelectItem>
              <SelectItem value="Híbrido">Híbrido</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium">Transmisión</label>
          <Select value={formData.transmision} onValueChange={(v) => handleSelect("transmision", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Manual">Manual</SelectItem>
              <SelectItem value="Automática">Automática</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium">Estado</label>
          <Select value={formData.estado} onValueChange={(v) => handleSelect("estado", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="disponible">Disponible</SelectItem>
              <SelectItem value="vendido">Vendido</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-2">
          <label className="text-sm font-medium">Otros detalles / Equipamiento</label>
          <Textarea name="otros" value={formData.otros} onChange={handleChange} className="h-20" placeholder="Ej: Aire acondicionado, Dirección hidráulica..." />
        </div>
        <div className="md:col-span-2">
          <label className="text-sm font-medium">Descripción Principal</label>
          <Textarea required name="descripcion" value={formData.descripcion} onChange={handleChange} className="h-32" />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium block mb-2">Fotos del Vehículo</label>
        <ImageUploader 
          initialImages={formData.fotosExistentes} 
          onChange={(items) => setImageItems(items)} 
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Guardando..." : "Guardar Vehículo"}
        </Button>
      </div>
    </form>
  )
}
