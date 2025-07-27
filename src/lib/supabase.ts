import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gzhpeliamthvmjdiriib.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6aHBlbGlhbXRodm1qZGlyaWliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2Mzc3MDYsImV4cCI6MjA2OTIxMzcwNn0.C3Bruu5glWRW7mfekmAvzzoWkuy8RfwHYiwC83_NlXw'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface YoutubeVideo {
  id: number
  title: string
  youtube_url: string
  thumbnail_url?: string
  description?: string
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Podcast {
  id: number
  title: string
  description?: string
  audio_file_url: string
  duration: number
  file_size?: number
  episode_number?: number
  publish_date: string
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface ContactForm {
  id: number
  name: string
  email: string
  phone?: string
  message: string
  form_type: string
  is_read: boolean
  created_at: string
}

export interface SiteSetting {
  id: number
  setting_key: string
  setting_value: string
  description?: string
  updated_at: string
}

export interface AdminUser {
  id: number
  email: string
  full_name: string
  is_active: boolean
  last_login?: string
  created_at: string
  updated_at: string
}