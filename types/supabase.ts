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
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      audit_log: {
        Row: {
          action: string
          actor_id: string
          created_at: string
          id: string
          metadata: Json | null
          patient_id: string
          target_id: string | null
          target_type: string | null
        }
        Insert: {
          action: string
          actor_id: string
          created_at?: string
          id?: string
          metadata?: Json | null
          patient_id: string
          target_id?: string | null
          target_type?: string | null
        }
        Update: {
          action?: string
          actor_id?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          patient_id?: string
          target_id?: string | null
          target_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_log_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      consents: {
        Row: {
          accepted: boolean
          accepted_at: string
          id: string
          ip: unknown
          type: string
          user_id: string
          version: string
        }
        Insert: {
          accepted: boolean
          accepted_at?: string
          id?: string
          ip?: unknown
          type: string
          user_id: string
          version: string
        }
        Update: {
          accepted?: boolean
          accepted_at?: string
          id?: string
          ip?: unknown
          type?: string
          user_id?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "consents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cycle_entries: {
        Row: {
          bbt: number | null
          clots: boolean | null
          contraception_used: boolean | null
          created_at: string
          date: string
          id: string
          notes: string | null
          ovulation_test: boolean | null
          pain_level: number | null
          patient_id: string
          period_end: boolean | null
          period_flow: number | null
          sexual_activity: boolean | null
          updated_at: string | null
        }
        Insert: {
          bbt?: number | null
          clots?: boolean | null
          contraception_used?: boolean | null
          created_at?: string
          date: string
          id?: string
          notes?: string | null
          ovulation_test?: boolean | null
          pain_level?: number | null
          patient_id: string
          period_end?: boolean | null
          period_flow?: number | null
          sexual_activity?: boolean | null
          updated_at?: string | null
        }
        Update: {
          bbt?: number | null
          clots?: boolean | null
          contraception_used?: boolean | null
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          ovulation_test?: boolean | null
          pain_level?: number | null
          patient_id?: string
          period_end?: boolean | null
          period_flow?: number | null
          sexual_activity?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cycle_entries_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      doctor_comments: {
        Row: {
          created_at: string
          doctor_id: string
          id: string
          patient_id: string
          target_id: string | null
          target_type: string
          text: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          doctor_id: string
          id?: string
          patient_id: string
          target_id?: string | null
          target_type: string
          text: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          doctor_id?: string
          id?: string
          patient_id?: string
          target_id?: string | null
          target_type?: string
          text?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "doctor_comments_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doctor_comments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      doctor_profiles: {
        Row: {
          clinic: string | null
          created_at: string
          full_name: string
          id: string
          invite_code: string | null
          license_number: string | null
          specialty: string
          updated_at: string | null
          user_id: string
          verified: boolean
        }
        Insert: {
          clinic?: string | null
          created_at?: string
          full_name: string
          id?: string
          invite_code?: string | null
          license_number?: string | null
          specialty?: string
          updated_at?: string | null
          user_id: string
          verified?: boolean
        }
        Update: {
          clinic?: string | null
          created_at?: string
          full_name?: string
          id?: string
          invite_code?: string | null
          license_number?: string | null
          specialty?: string
          updated_at?: string | null
          user_id?: string
          verified?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "doctor_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_results: {
        Row: {
          created_at: string
          cycle_day: number | null
          file_url: string | null
          id: string
          lab_name: string | null
          notes: string | null
          patient_id: string
          taken_at: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          cycle_day?: number | null
          file_url?: string | null
          id?: string
          lab_name?: string | null
          notes?: string | null
          patient_id: string
          taken_at: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          cycle_day?: number | null
          file_url?: string | null
          id?: string
          lab_name?: string | null
          notes?: string | null
          patient_id?: string
          taken_at?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lab_results_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_values: {
        Row: {
          created_at: string
          id: string
          lab_result_id: string
          marker_code: string
          reference_high: number | null
          reference_low: number | null
          unit: string
          value: number
        }
        Insert: {
          created_at?: string
          id?: string
          lab_result_id: string
          marker_code: string
          reference_high?: number | null
          reference_low?: number | null
          unit: string
          value: number
        }
        Update: {
          created_at?: string
          id?: string
          lab_result_id?: string
          marker_code?: string
          reference_high?: number | null
          reference_low?: number | null
          unit?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "lab_values_lab_result_id_fkey"
            columns: ["lab_result_id"]
            isOneToOne: false
            referencedRelation: "lab_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_values_marker_code_fkey"
            columns: ["marker_code"]
            isOneToOne: false
            referencedRelation: "markers"
            referencedColumns: ["code"]
          },
        ]
      }
      marker_references: {
        Row: {
          condition: string
          created_at: string
          id: string
          marker_id: string
          reference_high: number | null
          reference_low: number | null
          source: string
          unit: string
        }
        Insert: {
          condition?: string
          created_at?: string
          id?: string
          marker_id: string
          reference_high?: number | null
          reference_low?: number | null
          source: string
          unit: string
        }
        Update: {
          condition?: string
          created_at?: string
          id?: string
          marker_id?: string
          reference_high?: number | null
          reference_low?: number | null
          source?: string
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "marker_references_marker_id_fkey"
            columns: ["marker_id"]
            isOneToOne: false
            referencedRelation: "markers"
            referencedColumns: ["id"]
          },
        ]
      }
      markers: {
        Row: {
          category: string
          code: string
          created_at: string
          default_unit: string
          id: string
          name_en: string | null
          name_ru: string
          sort_order: number
        }
        Insert: {
          category: string
          code: string
          created_at?: string
          default_unit: string
          id?: string
          name_en?: string | null
          name_ru: string
          sort_order?: number
        }
        Update: {
          category?: string
          code?: string
          created_at?: string
          default_unit?: string
          id?: string
          name_en?: string | null
          name_ru?: string
          sort_order?: number
        }
        Relationships: []
      }
      patient_links: {
        Row: {
          created_at: string
          doctor_id: string
          id: string
          patient_id: string
          permissions: string[] | null
          status: Database["public"]["Enums"]["link_status"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          doctor_id: string
          id?: string
          patient_id: string
          permissions?: string[] | null
          status?: Database["public"]["Enums"]["link_status"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          doctor_id?: string
          id?: string
          patient_id?: string
          permissions?: string[] | null
          status?: Database["public"]["Enums"]["link_status"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_links_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_links_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_profiles: {
        Row: {
          avg_cycle_length: number | null
          birth_date: string | null
          contraception_type: string | null
          created_at: string
          height_cm: number | null
          id: string
          last_period_date: string | null
          primary_diagnoses: string[] | null
          updated_at: string | null
          user_id: string
          weight_kg: number | null
        }
        Insert: {
          avg_cycle_length?: number | null
          birth_date?: string | null
          contraception_type?: string | null
          created_at?: string
          height_cm?: number | null
          id?: string
          last_period_date?: string | null
          primary_diagnoses?: string[] | null
          updated_at?: string | null
          user_id: string
          weight_kg?: number | null
        }
        Update: {
          avg_cycle_length?: number | null
          birth_date?: string | null
          contraception_type?: string | null
          created_at?: string
          height_cm?: number | null
          id?: string
          last_period_date?: string | null
          primary_diagnoses?: string[] | null
          updated_at?: string | null
          user_id?: string
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          locale: string
          marketing_consent: boolean
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          locale?: string
          marketing_consent?: boolean
          phone?: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          locale?: string
          marketing_consent?: boolean
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          id: string
          next_billing_at: string | null
          plan: Database["public"]["Enums"]["subscription_plan"]
          started_at: string
          status: Database["public"]["Enums"]["subscription_status"]
          trial_ends_at: string | null
          updated_at: string | null
          user_id: string
          yookassa_payment_method_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          next_billing_at?: string | null
          plan?: Database["public"]["Enums"]["subscription_plan"]
          started_at?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          trial_ends_at?: string | null
          updated_at?: string | null
          user_id: string
          yookassa_payment_method_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          next_billing_at?: string | null
          plan?: Database["public"]["Enums"]["subscription_plan"]
          started_at?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          trial_ends_at?: string | null
          updated_at?: string | null
          user_id?: string
          yookassa_payment_method_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      symptoms: {
        Row: {
          created_at: string
          cycle_entry_id: string
          id: string
          patient_id: string
          severity: number
          type: Database["public"]["Enums"]["symptom_type"]
        }
        Insert: {
          created_at?: string
          cycle_entry_id: string
          id?: string
          patient_id: string
          severity: number
          type: Database["public"]["Enums"]["symptom_type"]
        }
        Update: {
          created_at?: string
          cycle_entry_id?: string
          id?: string
          patient_id?: string
          severity?: number
          type?: Database["public"]["Enums"]["symptom_type"]
        }
        Relationships: [
          {
            foreignKeyName: "symptoms_cycle_entry_id_fkey"
            columns: ["cycle_entry_id"]
            isOneToOne: false
            referencedRelation: "cycle_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "symptoms_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      link_status: "pending" | "active" | "revoked"
      subscription_plan: "free" | "premium" | "premium_doctor"
      subscription_status: "active" | "past_due" | "canceled" | "trialing"
      symptom_type:
        | "mood"
        | "anxiety"
        | "libido"
        | "headache"
        | "bloating"
        | "acne"
        | "hair_loss"
        | "breast_pain"
        | "sugar_craving"
        | "sleep_issues"
        | "fatigue"
        | "other"
      user_role: "patient" | "doctor"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      link_status: ["pending", "active", "revoked"],
      subscription_plan: ["free", "premium", "premium_doctor"],
      subscription_status: ["active", "past_due", "canceled", "trialing"],
      symptom_type: [
        "mood",
        "anxiety",
        "libido",
        "headache",
        "bloating",
        "acne",
        "hair_loss",
        "breast_pain",
        "sugar_craving",
        "sleep_issues",
        "fatigue",
        "other",
      ],
      user_role: ["patient", "doctor"],
    },
  },
} as const
