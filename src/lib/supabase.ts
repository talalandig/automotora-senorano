import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy_anon_key'

console.log("URL:", supabaseUrl)
console.log("Key:", supabaseAnonKey)

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
