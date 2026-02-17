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
      bans: {
        Row: {
          ban_type: string
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean
          issued_by: string | null
          reason: string
          user_id: string
        }
        Insert: {
          ban_type: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          issued_by?: string | null
          reason: string
          user_id: string
        }
        Update: {
          ban_type?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          issued_by?: string | null
          reason?: string
          user_id?: string
        }
        Relationships: []
      }
      blind_date_queue: {
        Row: {
          created_at: string
          gender: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          gender: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          gender?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      blind_dates: {
        Row: {
          active_until: string
          created_at: string | null
          id: string
          user_a_id: string | null
          user_b_id: string | null
        }
        Insert: {
          active_until: string
          created_at?: string | null
          id?: string
          user_a_id?: string | null
          user_b_id?: string | null
        }
        Update: {
          active_until?: string
          created_at?: string | null
          id?: string
          user_a_id?: string | null
          user_b_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blind_dates_user_a_id_fkey"
            columns: ["user_a_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blind_dates_user_b_id_fkey"
            columns: ["user_b_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      campus_polls: {
        Row: {
          category: string
          created_at: string
          creator_id: string | null
          ends_at: string
          id: string
          is_featured: boolean
          options: Json
          question: string
          university_id: string | null
        }
        Insert: {
          category?: string
          created_at?: string
          creator_id?: string | null
          ends_at: string
          id?: string
          is_featured?: boolean
          options?: Json
          question: string
          university_id?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          creator_id?: string | null
          ends_at?: string
          id?: string
          is_featured?: boolean
          options?: Json
          question?: string
          university_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campus_polls_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          post_id: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          post_id?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          post_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      event_rsvps: {
        Row: {
          created_at: string
          event_id: string
          id: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_rsvps_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          category: string
          created_at: string
          creator_id: string | null
          description: string | null
          event_date: string
          id: string
          image_url: string | null
          is_active: boolean
          location: string | null
          max_attendees: number | null
          title: string
          university_id: string | null
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          creator_id?: string | null
          description?: string | null
          event_date: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          location?: string | null
          max_attendees?: number | null
          title: string
          university_id?: string | null
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          creator_id?: string | null
          description?: string | null
          event_date?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          location?: string | null
          max_attendees?: number | null
          title?: string
          university_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      flagged_content: {
        Row: {
          auto_flagged: boolean
          content_id: string
          content_type: string
          created_at: string
          flag_reason: string
          id: string
          reviewed: boolean
          reviewed_at: string | null
          reviewed_by: string | null
        }
        Insert: {
          auto_flagged?: boolean
          content_id: string
          content_type: string
          created_at?: string
          flag_reason: string
          id?: string
          reviewed?: boolean
          reviewed_at?: string | null
          reviewed_by?: string | null
        }
        Update: {
          auto_flagged?: boolean
          content_id?: string
          content_type?: string
          created_at?: string
          flag_reason?: string
          id?: string
          reviewed?: boolean
          reviewed_at?: string | null
          reviewed_by?: string | null
        }
        Relationships: []
      }
      matches: {
        Row: {
          created_at: string | null
          id: string
          user_a_id: string | null
          user_b_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          user_a_id?: string | null
          user_b_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          user_a_id?: string | null
          user_b_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matches_user_a_id_fkey"
            columns: ["user_a_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_user_b_id_fkey"
            columns: ["user_b_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string | null
          deleted_at: string | null
          id: string
          match_id: string | null
          media_ref: string | null
          sender_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          match_id?: string | null
          media_ref?: string | null
          sender_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          match_id?: string | null
          media_ref?: string | null
          sender_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean
          reference_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean
          reference_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          reference_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      photo_verifications: {
        Row: {
          created_at: string
          id: string
          rejection_reason: string | null
          selfie_url: string
          status: string
          user_id: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          rejection_reason?: string | null
          selfie_url: string
          status?: string
          user_id: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          rejection_reason?: string | null
          selfie_url?: string
          status?: string
          user_id?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: []
      }
      poll_votes: {
        Row: {
          created_at: string
          id: string
          option_index: number
          poll_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          option_index: number
          poll_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          option_index?: number
          poll_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "poll_votes_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "campus_polls"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          author_id: string | null
          content: string
          created_at: string | null
          hashtags: string[] | null
          id: string
          images: string[] | null
          kind: string
          poll_options: Json | null
          section: string
          visibility: string
        }
        Insert: {
          author_id?: string | null
          content: string
          created_at?: string | null
          hashtags?: string[] | null
          id?: string
          images?: string[] | null
          kind?: string
          poll_options?: Json | null
          section: string
          visibility?: string
        }
        Update: {
          author_id?: string | null
          content?: string
          created_at?: string | null
          hashtags?: string[] | null
          id?: string
          images?: string[] | null
          kind?: string
          poll_options?: Json | null
          section?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_questions: {
        Row: {
          id: string
          options: Json
          order_index: number
          question: string
          quiz_id: string
        }
        Insert: {
          id?: string
          options?: Json
          order_index?: number
          question: string
          quiz_id: string
        }
        Update: {
          id?: string
          options?: Json
          order_index?: number
          question?: string
          quiz_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_responses: {
        Row: {
          answers: Json
          completed_at: string
          id: string
          personality_type: string | null
          quiz_id: string
          user_id: string
        }
        Insert: {
          answers?: Json
          completed_at?: string
          id?: string
          personality_type?: string | null
          quiz_id: string
          user_id: string
        }
        Update: {
          answers?: Json
          completed_at?: string
          id?: string
          personality_type?: string | null
          quiz_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_responses_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          title: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          title: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          title?: string
        }
        Relationships: []
      }
      reactions: {
        Row: {
          created_at: string | null
          id: string
          post_id: string | null
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id?: string | null
          type?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string | null
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          action_taken: string | null
          content_id: string
          content_type: string
          created_at: string
          description: string | null
          id: string
          reason: string
          reporter_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
        }
        Insert: {
          action_taken?: string | null
          content_id: string
          content_type: string
          created_at?: string
          description?: string | null
          id?: string
          reason: string
          reporter_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Update: {
          action_taken?: string | null
          content_id?: string
          content_type?: string
          created_at?: string
          description?: string | null
          id?: string
          reason?: string
          reporter_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Relationships: []
      }
      secret_likes: {
        Row: {
          created_at: string | null
          id: string
          source_user_id: string | null
          target_post_id: string | null
          target_user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          source_user_id?: string | null
          target_post_id?: string | null
          target_user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          source_user_id?: string | null
          target_post_id?: string | null
          target_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "secret_likes_source_user_id_fkey"
            columns: ["source_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "secret_likes_target_post_id_fkey"
            columns: ["target_post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "secret_likes_target_user_id_fkey"
            columns: ["target_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      spark_of_day: {
        Row: {
          compatibility_score: number | null
          created_at: string
          id: string
          matched_user_id: string
          revealed: boolean
          revealed_at: string | null
          spark_date: string
          user_id: string
        }
        Insert: {
          compatibility_score?: number | null
          created_at?: string
          id?: string
          matched_user_id: string
          revealed?: boolean
          revealed_at?: string | null
          spark_date?: string
          user_id: string
        }
        Update: {
          compatibility_score?: number | null
          created_at?: string
          id?: string
          matched_user_id?: string
          revealed?: boolean
          revealed_at?: string | null
          spark_date?: string
          user_id?: string
        }
        Relationships: []
      }
      trust_scores: {
        Row: {
          created_at: string
          id: string
          positive_interactions: number
          score: number
          total_blocks_received: number
          total_likes_received: number
          total_reports_against: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          positive_interactions?: number
          score?: number
          total_blocks_received?: number
          total_likes_received?: number
          total_reports_against?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          positive_interactions?: number
          score?: number
          total_blocks_received?: number
          total_likes_received?: number
          total_reports_against?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      universities: {
        Row: {
          country: string
          created_at: string
          domain: string | null
          id: string
          is_active: boolean
          name: string
          verification_method: string
        }
        Insert: {
          country?: string
          created_at?: string
          domain?: string | null
          id?: string
          is_active?: boolean
          name: string
          verification_method?: string
        }
        Update: {
          country?: string
          created_at?: string
          domain?: string | null
          id?: string
          is_active?: boolean
          name?: string
          verification_method?: string
        }
        Relationships: []
      }
      user_connections: {
        Row: {
          connection_type: string
          created_at: string
          id: string
          user_a_id: string
          user_b_id: string
        }
        Insert: {
          connection_type?: string
          created_at?: string
          id?: string
          user_a_id: string
          user_b_id: string
        }
        Update: {
          connection_type?: string
          created_at?: string
          id?: string
          user_a_id?: string
          user_b_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_strikes: {
        Row: {
          created_at: string
          id: string
          issued_by: string | null
          reason: string
          report_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          issued_by?: string | null
          reason: string
          report_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          issued_by?: string | null
          reason?: string
          report_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_strikes_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          address: string | null
          age_verified: boolean | null
          bio: string | null
          class_of_year: number | null
          class_year: string | null
          created_at: string | null
          current_vibe: Json | null
          date_of_birth: string | null
          display_name: string | null
          email: string
          full_name: string | null
          gender: string | null
          id: string
          id_card_back_url: string | null
          id_card_front_url: string | null
          identity_verified: boolean | null
          interests: string[] | null
          phone_number: string | null
          photo_verified: boolean | null
          profile_completed: boolean | null
          university_id: string | null
          unpopular_opinion: string | null
          updated_at: string | null
          uploaded_at: string | null
          verification_completed_at: string | null
          verification_status: string | null
          verification_submitted_at: string | null
          voice_intro_duration: number | null
          voice_intro_url: string | null
        }
        Insert: {
          address?: string | null
          age_verified?: boolean | null
          bio?: string | null
          class_of_year?: number | null
          class_year?: string | null
          created_at?: string | null
          current_vibe?: Json | null
          date_of_birth?: string | null
          display_name?: string | null
          email: string
          full_name?: string | null
          gender?: string | null
          id?: string
          id_card_back_url?: string | null
          id_card_front_url?: string | null
          identity_verified?: boolean | null
          interests?: string[] | null
          phone_number?: string | null
          photo_verified?: boolean | null
          profile_completed?: boolean | null
          university_id?: string | null
          unpopular_opinion?: string | null
          updated_at?: string | null
          uploaded_at?: string | null
          verification_completed_at?: string | null
          verification_status?: string | null
          verification_submitted_at?: string | null
          voice_intro_duration?: number | null
          voice_intro_url?: string | null
        }
        Update: {
          address?: string | null
          age_verified?: boolean | null
          bio?: string | null
          class_of_year?: number | null
          class_year?: string | null
          created_at?: string | null
          current_vibe?: Json | null
          date_of_birth?: string | null
          display_name?: string | null
          email?: string
          full_name?: string | null
          gender?: string | null
          id?: string
          id_card_back_url?: string | null
          id_card_front_url?: string | null
          identity_verified?: boolean | null
          interests?: string[] | null
          phone_number?: string | null
          photo_verified?: boolean | null
          profile_completed?: boolean | null
          university_id?: string | null
          unpopular_opinion?: string | null
          updated_at?: string | null
          uploaded_at?: string | null
          verification_completed_at?: string | null
          verification_status?: string | null
          verification_submitted_at?: string | null
          voice_intro_duration?: number | null
          voice_intro_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_is_admin: { Args: { _user_id: string }; Returns: boolean }
      create_notification: {
        Args: {
          p_message: string
          p_reference_id?: string
          p_title: string
          p_type: string
          p_user_id: string
        }
        Returns: undefined
      }
      get_strike_count: { Args: { _user_id: string }; Returns: number }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_moderator: { Args: { user_id: string }; Returns: boolean }
      is_user_banned: { Args: { _user_id: string }; Returns: boolean }
      is_verified: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      verification_status_type: "none" | "pending" | "approved" | "rejected"
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
    Enums: {
      app_role: ["admin", "moderator", "user"],
      verification_status_type: ["none", "pending", "approved", "rejected"],
    },
  },
} as const
