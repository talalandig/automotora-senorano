"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { Settings } from "lucide-react"

export default function AdminNavButton() {
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAdmin(!!session)
    })
  }, [])

  if (!isAdmin) return null

  return (
    <Link 
      href="/adminfpa" 
      className="bg-black hover:bg-zinc-800 text-white px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-lg font-bold text-[11px] sm:text-sm flex items-center gap-1.5 transition-colors shadow-sm ml-2 sm:ml-4 shrink-0"
    >
      <Settings size={14} className="sm:w-4 sm:h-4" />
      <span className="hidden sm:inline">Panel Admin</span>
      <span className="sm:hidden">Admin</span>
    </Link>
  )
}
