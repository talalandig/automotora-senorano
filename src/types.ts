export type Vehicle = {
  id: string
  marca: string
  modelo: string
  anio: number
  precio: number
  kilometraje: number
  combustible: string
  transmision: string
  tipo: string
  descripcion: string
  estado: string
  otros?: string
  dueno?: string
  fotos: string[]
  created_at: string
}

export type SiteSettings = {
  id: number
  banner_images: string[]
  mobile_banner_images?: string[]
  banner_autoplay: boolean
  whatsapp_number?: string
  address?: string
  phone1?: string
  phone2?: string
}
