import { supabase } from "@/lib/supabase"
import { Vehicle, SiteSettings } from "@/types"
import VehicleCard from "@/components/VehicleCard"
import WhatsAppButton from "@/components/WhatsAppButton"
import CatalogFilter from "@/components/CatalogFilter"
import HeroBanner from "@/components/HeroBanner"
import AdminNavButton from "@/components/AdminNavButton"
import MobileAdminHeader from "@/components/MobileAdminHeader"
import { CarFront, MapPin, Phone } from "lucide-react"
import Link from "next/link"

export const revalidate = 60 // Revalidate every minute

export default async function Home({ searchParams }: { searchParams: Promise<{ tipo?: string; anio?: string; km?: string; precio?: string }> }) {
  const params = await searchParams;
  
  let autos: Vehicle[] | null = []
  let uniqueYears: number[] = []
  let siteSettings: SiteSettings | null = null
  let error = null

  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    // 1. Fetch autos
    let query = supabase
      .from('vehicles')
      .select('*')
      .eq('estado', 'disponible')
      .order('created_at', { ascending: false })

    if (params.tipo) {
      query = query.eq('tipo', params.tipo)
    }
    if (params.anio) {
      query = query.eq('anio', parseInt(params.anio))
    }
    if (params.km) {
      const [minStr, maxStr] = params.km.split('-')
      if (minStr) query = query.gte('kilometraje', parseInt(minStr))
      if (maxStr) query = query.lte('kilometraje', parseInt(maxStr))
    }
    if (params.precio) {
      const [minStr, maxStr] = params.precio.split('-')
      if (minStr) query = query.gte('precio', parseInt(minStr))
      if (maxStr) query = query.lte('precio', parseInt(maxStr))
    }

    const { data: fetchedAutos, error: fetchError } = await query
    autos = fetchedAutos
    error = fetchError

    // Get unique years for the filter (from all available cars)
    const { data: allAvailable } = await supabase.from('vehicles').select('anio').eq('estado', 'disponible')
    uniqueYears = Array.from(new Set(allAvailable?.map(a => a.anio) || [])).sort((a, b) => b - a)

    // Fetch site settings for banner
    const { data: settingsData } = await supabase.from('site_settings').select('*').eq('id', 1).single()
    if (settingsData) {
      siteSettings = settingsData as SiteSettings
    }
  }

  return (
    <div className="h-screen bg-zinc-50 font-sans flex flex-col overflow-hidden">
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

      <div className="flex-1 overflow-y-auto">
        {/* Hero */}
        <HeroBanner settings={siteSettings} />
        
        {/* Mobile Admin Header (Only visible if logged in and on mobile) */}
        <MobileAdminHeader />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12 sm:py-12">
        {/* Filters */}
        <CatalogFilter 
          currentTipo={params.tipo || ''} 
          currentAnio={params.anio || ''} 
          currentKm={params.km || ''}
          currentPrecio={params.precio || ''}
          uniqueYears={uniqueYears} 
        />

        {/* Catalog */}
        {error ? (
          <div className="text-center py-12 text-red-500">Error al cargar los vehículos.</div>
        ) : !autos || autos.length === 0 ? (
          <div className="text-center py-24">
            <CarFront size={48} className="mx-auto text-zinc-300 mb-4" />
            <h3 className="text-xl font-medium text-zinc-900 mb-1">No hay vehículos</h3>
            <p className="text-zinc-500">Prueba cambiando los filtros de búsqueda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
            {autos.map((auto: Vehicle) => (
              <VehicleCard key={auto.id} vehicle={auto} />
            ))}
            </div>
          )}
        </main>
      </div>
      <WhatsAppButton phoneNumber={siteSettings?.whatsapp_number} />
    </div>
  )
}
