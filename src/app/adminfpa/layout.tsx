"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter, usePathname } from "next/navigation"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session && pathname !== '/adminfpa/login') {
        router.push('/adminfpa/login')
      } else if (session && pathname === '/adminfpa/login') {
        router.push('/adminfpa')
      } else {
        setLoading(false)
      }
    }
    
    checkUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session && pathname !== '/adminfpa/login') {
        router.push('/adminfpa/login')
      } else if (session && pathname === '/adminfpa/login') {
        router.push('/adminfpa')
      }
    })

    return () => subscription.unsubscribe()
  }, [pathname, router])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-zinc-50">Cargando...</div>
  }

  return <>{children}</>
}
