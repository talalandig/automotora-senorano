"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { SiteSettings } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Phone, MapPin, MessageCircle } from "lucide-react"

export default function InfoSettings() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  const [successMsg, setSuccessMsg] = useState("")

  const [formData, setFormData] = useState({
    whatsapp_number: "",
    address: "",
    phone1: "",
    phone2: ""
  })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase.from('site_settings').select('*').single()
      if (error && error.code !== 'PGRST116') throw error
      
      if (data) {
        const settings = data as SiteSettings
        setFormData({
          whatsapp_number: settings.whatsapp_number || "59899123456",
          address: settings.address || "Av. Giannattasio km 22.500",
          phone1: settings.phone1 || "099 123 456",
          phone2: settings.phone2 || "098 123 456"
        })
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setErrorMsg("")
    setSuccessMsg("")
  }

  const handleSave = async () => {
    setSaving(true)
    setErrorMsg("")
    setSuccessMsg("")

    try {
      const { data: existingSettings } = await supabase.from('site_settings').select('id').single()

      if (existingSettings) {
        const { error } = await supabase
          .from('site_settings')
          .update({
            whatsapp_number: formData.whatsapp_number,
            address: formData.address,
            phone1: formData.phone1,
            phone2: formData.phone2
          })
          .eq('id', existingSettings.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('site_settings')
          .insert([{
            banner_images: [],
            banner_autoplay: true,
            whatsapp_number: formData.whatsapp_number,
            address: formData.address,
            phone1: formData.phone1,
            phone2: formData.phone2
          }])
        if (error) throw error
      }

      setSuccessMsg("Información actualizada exitosamente.")
    } catch (error: any) {
      console.error(error)
      setErrorMsg("Error al guardar: " + (error.message || "revisa la conexión"))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-4 text-zinc-500">Cargando configuración...</div>

  return (
    <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-6">
      <h2 className="text-xl font-bold text-zinc-900 mb-2">Información de Contacto</h2>
      <p className="text-sm text-zinc-500 mb-6">
        Administra los números de teléfono y la dirección que aparecen en el encabezado y en el botón de WhatsApp.
      </p>

      <div className="space-y-4 mb-6 max-w-2xl">
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-zinc-800 mb-1">
            <MessageCircle size={16} className="text-green-600" />
            Número de WhatsApp (con código de país)
          </label>
          <Input 
            name="whatsapp_number" 
            value={formData.whatsapp_number} 
            onChange={handleChange} 
            placeholder="Ej: 59899123456" 
          />
          <p className="text-xs text-zinc-500 mt-1">Solo números, sin signos de más (+) ni espacios.</p>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-zinc-800 mb-1">
            <MapPin size={16} className="text-zinc-600" />
            Dirección
          </label>
          <Input 
            name="address" 
            value={formData.address} 
            onChange={handleChange} 
            placeholder="Ej: Av. Giannattasio km 22.500" 
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-zinc-800 mb-1">
              <Phone size={16} className="text-zinc-600" />
              Teléfono 1 (Encabezado)
            </label>
            <Input 
              name="phone1" 
              value={formData.phone1} 
              onChange={handleChange} 
              placeholder="Ej: 099 123 456" 
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-zinc-800 mb-1">
              <Phone size={16} className="text-zinc-600" />
              Teléfono 2 (Encabezado)
            </label>
            <Input 
              name="phone2" 
              value={formData.phone2} 
              onChange={handleChange} 
              placeholder="Ej: 098 123 456" 
            />
          </div>
        </div>
      </div>

      {errorMsg && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{errorMsg}</div>}
      {successMsg && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm">{successMsg}</div>}

      <Button 
        onClick={handleSave} 
        disabled={saving}
        className="w-full sm:w-auto bg-[#D60006] hover:bg-[#a30005] font-bold px-8"
      >
        {saving ? "Guardando..." : "Guardar Información"}
      </Button>
    </div>
  )
}
