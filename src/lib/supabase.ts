import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// For development, we'll use the test hotel ID
// In production, this should be determined by the domain/subdomain
export const NEXT_PUBLIC_TEST_HOTEL_ID = process.env.NEXT_PUBLIC_TEST_HOTEL_ID!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface Guest {
  id: string
  user_id: string
  hotel_id: string
  room_number: string | null
  last_name: string | null
  language: string | null
  last_active_at: string | null
  url_token: string | null
  checkout_date: string | null
}

export interface GuestMessage {
  id: string
  user_id: string
  hotel_id: string
  sender: 'guest' | 'ai'
  message: string
  created_at: string
  metadata: Record<string, unknown>
  guest_id: string
}


