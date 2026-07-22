// Generated from the Vela-Astrology Supabase schema (project khcwkssirzqcwboaisco).
// Regenerate with the Supabase CLI / MCP after schema changes.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      app_admins: {
        Row: { created_at: string; email: string | null; user_id: string };
        Insert: { created_at?: string; email?: string | null; user_id: string };
        Update: { created_at?: string; email?: string | null; user_id?: string };
        Relationships: [];
      };
      charts: {
        Row: { client_id: string; computed_at: string; data: Json; engine: string; house_system: string; id: string; verification: Json | null; zodiac: string };
        Insert: { client_id: string; computed_at?: string; data: Json; engine: string; house_system?: string; id?: string; verification?: Json | null; zodiac?: string };
        Update: { client_id?: string; computed_at?: string; data?: Json; engine?: string; house_system?: string; id?: string; verification?: Json | null; zodiac?: string };
        Relationships: [{ foreignKeyName: "charts_client_id_fkey"; columns: ["client_id"]; isOneToOne: true; referencedRelation: "clients"; referencedColumns: ["id"] }];
      };
      clients: {
        Row: { access_token: string; birth_date: string; birth_place: string; birth_time: string | null; created_at: string; created_by: string | null; id: string; lat: number; lon: number; name: string; notes: string | null; updated_at: string };
        Insert: { access_token?: string; birth_date: string; birth_place: string; birth_time?: string | null; created_at?: string; created_by?: string | null; id?: string; lat: number; lon: number; name: string; notes?: string | null; updated_at?: string };
        Update: { access_token?: string; birth_date?: string; birth_place?: string; birth_time?: string | null; created_at?: string; created_by?: string | null; id?: string; lat?: number; lon?: number; name?: string; notes?: string | null; updated_at?: string };
        Relationships: [];
      };
      interpretations: {
        Row: { client_id: string; created_at: string; draft: Json | null; edited: Json | null; facts: Json | null; id: string; kind: string; model: string | null; published_at: string | null; status: string; temperature: number | null; updated_at: string };
        Insert: { client_id: string; created_at?: string; draft?: Json | null; edited?: Json | null; facts?: Json | null; id?: string; kind?: string; model?: string | null; published_at?: string | null; status?: string; temperature?: number | null; updated_at?: string };
        Update: { client_id?: string; created_at?: string; draft?: Json | null; edited?: Json | null; facts?: Json | null; id?: string; kind?: string; model?: string | null; published_at?: string | null; status?: string; temperature?: number | null; updated_at?: string };
        Relationships: [{ foreignKeyName: "interpretations_client_id_fkey"; columns: ["client_id"]; isOneToOne: false; referencedRelation: "clients"; referencedColumns: ["id"] }];
      };
      knowledge: {
        Row: { body: string; category: string; created_at: string; embedding: string | null; id: string; subject_key: string; title: string | null; updated_at: string };
        Insert: { body: string; category: string; created_at?: string; embedding?: string | null; id?: string; subject_key: string; title?: string | null; updated_at?: string };
        Update: { body?: string; category?: string; created_at?: string; embedding?: string | null; id?: string; subject_key?: string; title?: string | null; updated_at?: string };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

export type ClientRow = Database["public"]["Tables"]["clients"]["Row"];
export type ChartRow = Database["public"]["Tables"]["charts"]["Row"];
export type InterpretationRow = Database["public"]["Tables"]["interpretations"]["Row"];
export type KnowledgeRow = Database["public"]["Tables"]["knowledge"]["Row"];
export type InterpretationStatus = "draft" | "in_review" | "approved" | "published" | "rejected";
