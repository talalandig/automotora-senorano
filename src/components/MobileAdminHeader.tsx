"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { Settings } from "lucide-react"

export default function MobileAdminHeader() {
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAdmin(!!session)
    })
  }, [])

  if (!isAdmin) return null

  return (
    <div className="sm:hidden bg-zinc-900 text-white px-4 py-2 flex items-center justify-between shadow-md relative z-20">
      <div className="flex items-center gap-2 font-bold text-xs">
        <Settings size={14} className="text-[#D60006]" />
        MODO ADMINISTRADOR
      </div>
      <Link 
        href="/admin" 
        className="bg-[#D60006] hover:bg-[#a30005] text-white px-3 py-1.5 rounded-md font-bold text-[11px] transition-colors shadow-sm"
      >
        Ir al Panel
      </Link>
    </div>
  )
}
