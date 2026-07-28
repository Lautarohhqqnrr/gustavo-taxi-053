export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: 'admin' | 'editor' | 'viewer' | 'user'
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: 'admin' | 'user'
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: 'admin' | 'user'
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      services: {
        Row: {
          id: string
          title: string
          slug: string
          description: string
          icon: string
          order_index: number
          is_active: boolean
          seo_title: string | null
          seo_description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          description: string
          icon?: string
          order_index?: number
          is_active?: boolean
          seo_title?: string | null
          seo_description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          description?: string
          icon?: string
          order_index?: number
          is_active?: boolean
          seo_title?: string | null
          seo_description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      routes: {
        Row: {
          id: string
          origin: string
          destination: string
          slug: string
          description: string | null
          distance_km: number | null
          duration_min: number | null
          base_price: number | null
          image_url: string | null
          is_active: boolean
          order_index: number
          seo_title: string | null
          seo_description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          origin: string
          destination: string
          slug: string
          description?: string | null
          distance_km?: number | null
          duration_min?: number | null
          base_price?: number | null
          image_url?: string | null
          is_active?: boolean
          order_index?: number
          seo_title?: string | null
          seo_description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          origin?: string
          destination?: string
          slug?: string
          description?: string | null
          distance_km?: number | null
          duration_min?: number | null
          base_price?: number | null
          image_url?: string | null
          is_active?: boolean
          order_index?: number
          seo_title?: string | null
          seo_description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      gallery: {
        Row: {
          id: string
          url: string
          path: string
          alt: string
          category: string
          order_index: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          url: string
          path: string
          alt?: string
          category: string
          order_index?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          url?: string
          path?: string
          alt?: string
          category?: string
          order_index?: number
          is_active?: boolean
          created_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          name: string
          comment: string
          rating: number
          is_approved: boolean
          is_hidden: boolean
          admin_reply: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          comment: string
          rating: number
          is_approved?: boolean
          is_hidden?: boolean
          admin_reply?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          comment?: string
          rating?: number
          is_approved?: boolean
          is_hidden?: boolean
          admin_reply?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          title: string
          slug: string
          excerpt: string
          content_html: string
          content_json: Json | null
          cover_image: string | null
          category: string
          is_published: boolean
          seo_title: string | null
          seo_description: string | null
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          excerpt: string
          content_html: string
          content_json?: Json | null
          cover_image?: string | null
          category: string
          is_published?: boolean
          seo_title?: string | null
          seo_description?: string | null
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          excerpt?: string
          content_html?: string
          content_json?: Json | null
          cover_image?: string | null
          category?: string
          is_published?: boolean
          seo_title?: string | null
          seo_description?: string | null
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          name: string
          phone: string
          origin: string
          destination: string
          preferred_date: string | null
          preferred_time: string | null
          message: string | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          phone: string
          origin: string
          destination: string
          preferred_date?: string | null
          preferred_time?: string | null
          message?: string | null
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          phone?: string
          origin?: string
          destination?: string
          preferred_date?: string | null
          preferred_time?: string | null
          message?: string | null
          is_read?: boolean
          created_at?: string
        }
      }
      site_settings: {
        Row: {
          key: string
          value: Json
          updated_at: string
        }
        Insert: {
          key: string
          value: Json
          updated_at?: string
        }
        Update: {
          key?: string
          value?: Json
          updated_at?: string
        }
      }
      analytics_events: {
        Row: {
          id: string
          event_type: string
          page: string | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          event_type: string
          page?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          event_type?: string
          page?: string | null
          metadata?: Json | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}