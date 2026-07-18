"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { SiteSettings } from "@/types"
import { Button } from "@/components/ui/button"
import ImageUploader, { ImageItem } from "./ImageUploader"

export default function BannerSettings() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [imageItems, setImageItems] = useState<ImageItem[]>([])
  const [mobileImageItems, setMobileImageItems] = useState<ImageItem[]>([])
  const [autoplay, setAutoplay] = useState(true)
  const [errorMsg, setErrorMsg] = useState("")
  const [successMsg, setSuccessMsg] = useState("")

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.from('site_settings').select('*').eq('id', 1).single()
      
      if (error) {
        // Fallback if table doesn't exist yet
        console.error("Error cargando configuración (puede que la tabla site_settings no exista aún):", error)
        setImageItems([{ id: 'default', type: 'url', url: '/banner_ultimo.jpg' }])
        setMobileImageItems([{ id: 'default', type: 'url', url: '/bannercelu.jpg' }])
        setAutoplay(true)
      } else if (data) {
        const settings = data as SiteSettings
        setImageItems(settings.banner_images.map((url, i) => ({ id: `url-${i}`, type: 'url', url })))
        setMobileImageItems((settings.mobile_banner_images || ['/bannercelu.jpg']).map((url, i) => ({ id: `mobile-url-${i}`, type: 'url', url })))
        setAutoplay(settings.banner_autoplay)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (imageItems.length === 0) {
      setErrorMsg("Debes tener al menos 1 imagen para el banner.")
      return
    }
    if (imageItems.length > 3) {
      setErrorMsg("El banner permite un máximo de 3 imágenes.")
      return
    }
    
    setSaving(true)
    setErrorMsg("")
    setSuccessMsg("")

    try {
      const finalUrls: string[] = []
      for (const item of imageItems) {
        if (item.type === "url" && item.url) {
          finalUrls.push(item.url)
        } else if (item.type === "file" && item.file) {
          const fileExt = item.file.name.split('.').pop()
          const fileName = `banner-${Math.random()}.${fileExt}`
          const { error: uploadError } = await supabase.storage.from('autos-fotos').upload(fileName, item.file)
          if (uploadError) throw uploadError
          const { data: { publicUrl } } = supabase.storage.from('autos-fotos').getPublicUrl(fileName)
          finalUrls.push(publicUrl)
        }
      }

      const finalMobileUrls: string[] = []
      for (const item of mobileImageItems) {
        if (item.type === "url" && item.url) {
          finalMobileUrls.push(item.url)
        } else if (item.type === "file" && item.file) {
          const fileExt = item.file.name.split('.').pop()
          const fileName = `banner-mobile-${Math.random()}.${fileExt}`
          const { error: uploadError } = await supabase.storage.from('autos-fotos').upload(fileName, item.file)
          if (uploadError) throw uploadError
          const { data: { publicUrl } } = supabase.storage.from('autos-fotos').getPublicUrl(fileName)
          finalMobileUrls.push(publicUrl)
        }
      }

      // Intentamos actualizar, si no existe intentamos insertar (upsert behavior)
      const { error } = await supabase
        .from('site_settings')
        .upsert({ id: 1, banner_images: finalUrls, mobile_banner_images: finalMobileUrls, banner_autoplay: autoplay })

      if (error) throw error

      setSuccessMsg("¡Configuración del banner guardada correctamente!")
      // Reload items to reset files into urls
      setImageItems(finalUrls.map((url, i) => ({ id: `url-${i}`, type: 'url', url })))
      setMobileImageItems(finalMobileUrls.map((url, i) => ({ id: `mobile-url-${i}`, type: 'url', url })))
    } catch (error: any) {
      console.error(error)
      setErrorMsg("Error al guardar: " + (error.message || "revisa la conexión o base de datos"))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-4 text-zinc-500">Cargando configuración...</div>

  return (
    <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-6">
      <h2 className="text-xl font-bold text-zinc-900 mb-2">Imágenes del Banner Principal</h2>
      <p className="text-sm text-zinc-500 mb-6">
        Aquí puedes administrar las fotos que aparecen en el inicio (portada). 
        <strong> Máximo 3 fotos permitidas.</strong> La primera de la lista será la principal.
        <br/><br/>
        💡 <strong>Atención:</strong> Genera el banner con exactamente estas dimensiones: <strong>1920x420 píxeles (ancho x alto)</strong>, en formato horizontal como hero banner para web.
      </p>

      <div className="mb-6">
        <ImageUploader 
          initialImages={imageItems.filter(i => i.type === 'url').map(i => i.url!)}
          onChange={(items) => {
            setImageItems(items)
            setErrorMsg("")
            setSuccessMsg("")
          }}
        />
        {imageItems.length > 3 && (
          <p className="text-red-500 text-sm mt-2 font-medium">Has superado el límite de 3 imágenes.</p>
        )}
      </div>

      <div className="mb-6 border-t border-zinc-100 pt-6">
        <h2 className="text-xl font-bold text-zinc-900 mb-2">Imágenes para Celulares</h2>
        <p className="text-sm text-zinc-500 mb-6">
          Estas fotos se mostrarán exclusivamente cuando se visite la web desde un teléfono móvil. Si no hay ninguna, se usará el banner por defecto.
          <br/><br/>
          💡 <strong>Atención:</strong> Genera el banner con exactamente estas dimensiones: <strong>1080x500 píxeles (ancho x alto)</strong>.
        </p>
        <ImageUploader 
          initialImages={mobileImageItems.filter(i => i.type === 'url').map(i => i.url!)}
          onChange={(items) => {
            setMobileImageItems(items)
            setErrorMsg("")
            setSuccessMsg("")
          }}
        />
      </div>

      <div className="mb-6 border-t border-zinc-100 pt-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <input 
            type="checkbox" 
            checked={autoplay} 
            onChange={(e) => {
              setAutoplay(e.target.checked)
              setSuccessMsg("")
            }}
            className="w-5 h-5 rounded border-zinc-300 text-[#D60006] focus:ring-[#D60006]"
          />
          <div>
            <p className="font-semibold text-zinc-900">Auto-deslizamiento (Autoplay)</p>
            <p className="text-sm text-zinc-500">Si hay más de una foto, cambiarán solas automáticamente.</p>
          </div>
        </label>
      </div>

      {errorMsg && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{errorMsg}</div>}
      {successMsg && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm">{successMsg}</div>}

      <Button 
        onClick={handleSave} 
        disabled={saving || imageItems.length > 3 || imageItems.length === 0}
        className="w-full sm:w-auto bg-[#D60006] hover:bg-[#a30005] font-bold px-8"
      >
        {saving ? "Guardando..." : "Guardar Configuración"}
      </Button>
    </div>
  )
}
