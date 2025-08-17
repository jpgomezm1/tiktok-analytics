export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      brain_queries_log: {
        Row: {
          created_at: string | null
          id: string
          latency_ms: number | null
          query: string
          top_k: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          latency_ms?: number | null
          query: string
          top_k: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          latency_ms?: number | null
          query?: string
          top_k?: number
          user_id?: string
        }
        Relationships: []
      }
      followers_history: {
        Row: {
          created_at: string | null
          entry_date: string
          followers_count: number
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          entry_date: string
          followers_count: number
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          entry_date?: string
          followers_count?: number
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      growth_insights: {
        Row: {
          affected_video_ids: string[] | null
          confidence_score: number | null
          created_at: string | null
          date_generated: string | null
          description: string | null
          id: string
          insight_type: string
          is_active: boolean | null
          metric_impact: number | null
          title: string
          user_id: string
        }
        Insert: {
          affected_video_ids?: string[] | null
          confidence_score?: number | null
          created_at?: string | null
          date_generated?: string | null
          description?: string | null
          id?: string
          insight_type: string
          is_active?: boolean | null
          metric_impact?: number | null
          title: string
          user_id: string
        }
        Update: {
          affected_video_ids?: string[] | null
          confidence_score?: number | null
          created_at?: string | null
          date_generated?: string | null
          description?: string | null
          id?: string
          insight_type?: string
          is_active?: boolean | null
          metric_impact?: number | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          display_name: string | null
          id: string
          total_followers: number | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          id: string
          total_followers?: number | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          total_followers?: number | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      saved_views: {
        Row: {
          created_at: string | null
          filters: Json
          id: string
          name: string
          normalize_by_1k: boolean | null
          sort_by: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          filters: Json
          id?: string
          name: string
          normalize_by_1k?: boolean | null
          sort_by: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          filters?: Json
          id?: string
          name?: string
          normalize_by_1k?: boolean | null
          sort_by?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      tiktok_account_context_embeddings: {
        Row: {
          created_at: string
          embedding: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          embedding?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          embedding?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tiktok_account_contexts: {
        Row: {
          audience_personas: Json | null
          brand_pillars: string[] | null
          content_themes: string[] | null
          created_at: string
          do_not_do: string[] | null
          id: string
          mission: string | null
          negative_keywords: string[] | null
          north_star_metric: string | null
          positioning: string | null
          secondary_metrics: string[] | null
          strategic_bets: string[] | null
          tone_guide: string | null
          updated_at: string
          user_id: string
          weights: Json | null
        }
        Insert: {
          audience_personas?: Json | null
          brand_pillars?: string[] | null
          content_themes?: string[] | null
          created_at?: string
          do_not_do?: string[] | null
          id?: string
          mission?: string | null
          negative_keywords?: string[] | null
          north_star_metric?: string | null
          positioning?: string | null
          secondary_metrics?: string[] | null
          strategic_bets?: string[] | null
          tone_guide?: string | null
          updated_at?: string
          user_id: string
          weights?: Json | null
        }
        Update: {
          audience_personas?: Json | null
          brand_pillars?: string[] | null
          content_themes?: string[] | null
          created_at?: string
          do_not_do?: string[] | null
          id?: string
          mission?: string | null
          negative_keywords?: string[] | null
          north_star_metric?: string | null
          positioning?: string | null
          secondary_metrics?: string[] | null
          strategic_bets?: string[] | null
          tone_guide?: string | null
          updated_at?: string
          user_id?: string
          weights?: Json | null
        }
        Relationships: []
      }
      tiktok_brain_clusters: {
        Row: {
          avg_performance: number | null
          cluster_name: string | null
          content_type: string | null
          created_at: string
          id: string
          representative_vector_id: string | null
          updated_at: string
          user_id: string
          vector_count: number | null
        }
        Insert: {
          avg_performance?: number | null
          cluster_name?: string | null
          content_type?: string | null
          created_at?: string
          id?: string
          representative_vector_id?: string | null
          updated_at?: string
          user_id: string
          vector_count?: number | null
        }
        Update: {
          avg_performance?: number | null
          cluster_name?: string | null
          content_type?: string | null
          created_at?: string
          id?: string
          representative_vector_id?: string | null
          updated_at?: string
          user_id?: string
          vector_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tiktok_brain_clusters_representative_vector_id_fkey"
            columns: ["representative_vector_id"]
            isOneToOne: false
            referencedRelation: "tiktok_brain_vectors"
            referencedColumns: ["id"]
          },
        ]
      }
      tiktok_brain_vectors: {
        Row: {
          cluster_id: string | null
          comments: number | null
          content: string
          content_type: string
          created_at: string
          cta_type: string | null
          duration_seconds: number | null
          editing_style: string | null
          embedding_en: string | null
          embedding_es: string | null
          f_per_1k: number | null
          for_you_pct: number | null
          id: string
          is_duplicate: boolean | null
          language: string | null
          likes: number | null
          needs_review: boolean | null
          published_date: string | null
          retention_pct: number | null
          saves_per_1k: number | null
          section_tag: string | null
          shares: number | null
          similarity_score: number | null
          tone_style: string | null
          updated_at: string
          user_id: string
          video_id: string
          video_theme: string | null
          views: number | null
        }
        Insert: {
          cluster_id?: string | null
          comments?: number | null
          content: string
          content_type: string
          created_at?: string
          cta_type?: string | null
          duration_seconds?: number | null
          editing_style?: string | null
          embedding_en?: string | null
          embedding_es?: string | null
          f_per_1k?: number | null
          for_you_pct?: number | null
          id?: string
          is_duplicate?: boolean | null
          language?: string | null
          likes?: number | null
          needs_review?: boolean | null
          published_date?: string | null
          retention_pct?: number | null
          saves_per_1k?: number | null
          section_tag?: string | null
          shares?: number | null
          similarity_score?: number | null
          tone_style?: string | null
          updated_at?: string
          user_id: string
          video_id: string
          video_theme?: string | null
          views?: number | null
        }
        Update: {
          cluster_id?: string | null
          comments?: number | null
          content?: string
          content_type?: string
          created_at?: string
          cta_type?: string | null
          duration_seconds?: number | null
          editing_style?: string | null
          embedding_en?: string | null
          embedding_es?: string | null
          f_per_1k?: number | null
          for_you_pct?: number | null
          id?: string
          is_duplicate?: boolean | null
          language?: string | null
          likes?: number | null
          needs_review?: boolean | null
          published_date?: string | null
          retention_pct?: number | null
          saves_per_1k?: number | null
          section_tag?: string | null
          shares?: number | null
          similarity_score?: number | null
          tone_style?: string | null
          updated_at?: string
          user_id?: string
          video_id?: string
          video_theme?: string | null
          views?: number | null
        }
        Relationships: []
      }
      videos: {
        Row: {
          avg_time_watched: number | null
          comments: number | null
          created_at: string | null
          cta_type: string | null
          duration_seconds: number | null
          editing_style: string | null
          engagement_rate: number | null
          external_link: string | null
          full_video_watch_rate: number | null
          guion: string | null
          hook: string | null
          id: string
          image_url: string | null
          likes: number | null
          new_followers: number | null
          performance_score: number | null
          published_date: string
          reach: number | null
          saves: number | null
          shares: number | null
          title: string
          total_time_watched: number | null
          traffic_follow: number | null
          traffic_for_you: number | null
          traffic_hashtag: number | null
          traffic_profile: number | null
          traffic_search: number | null
          traffic_sound: number | null
          updated_at: string | null
          user_id: string
          video_theme: string | null
          video_type: string | null
          video_url: string | null
          views: number | null
        }
        Insert: {
          avg_time_watched?: number | null
          comments?: number | null
          created_at?: string | null
          cta_type?: string | null
          duration_seconds?: number | null
          editing_style?: string | null
          engagement_rate?: number | null
          external_link?: string | null
          full_video_watch_rate?: number | null
          guion?: string | null
          hook?: string | null
          id?: string
          image_url?: string | null
          likes?: number | null
          new_followers?: number | null
          performance_score?: number | null
          published_date: string
          reach?: number | null
          saves?: number | null
          shares?: number | null
          title: string
          total_time_watched?: number | null
          traffic_follow?: number | null
          traffic_for_you?: number | null
          traffic_hashtag?: number | null
          traffic_profile?: number | null
          traffic_search?: number | null
          traffic_sound?: number | null
          updated_at?: string | null
          user_id: string
          video_theme?: string | null
          video_type?: string | null
          video_url?: string | null
          views?: number | null
        }
        Update: {
          avg_time_watched?: number | null
          comments?: number | null
          created_at?: string | null
          cta_type?: string | null
          duration_seconds?: number | null
          editing_style?: string | null
          engagement_rate?: number | null
          external_link?: string | null
          full_video_watch_rate?: number | null
          guion?: string | null
          hook?: string | null
          id?: string
          image_url?: string | null
          likes?: number | null
          new_followers?: number | null
          performance_score?: number | null
          published_date?: string
          reach?: number | null
          saves?: number | null
          shares?: number | null
          title?: string
          total_time_watched?: number | null
          traffic_follow?: number | null
          traffic_for_you?: number | null
          traffic_hashtag?: number | null
          traffic_profile?: number | null
          traffic_search?: number | null
          traffic_sound?: number | null
          updated_at?: string | null
          user_id?: string
          video_theme?: string | null
          video_type?: string | null
          video_url?: string | null
          views?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      exec_sql: {
        Args: { params?: Json; sql: string }
        Returns: {
          content: string
          content_type: string
          duration_seconds: number
          f_per_1k: number
          for_you_pct: number
          id: string
          published_date: string
          retention_pct: number
          saves_per_1k: number
          score: number
          video_id: string
          video_type: string
          views: number
        }[]
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: unknown
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
