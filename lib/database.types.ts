export type NovelStatus = "ongoing" | "completed" | "hiatus";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          is_author: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          username: string;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          is_author?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      genres: {
        Row: { id: number; name: string; slug: string };
        Insert: { id?: number; name: string; slug: string };
        Update: Partial<{ id: number; name: string; slug: string }>;
        Relationships: [];
      };
      novels: {
        Row: {
          id: string;
          author_id: string;
          title: string;
          slug: string;
          cover_url: string | null;
          synopsis: string;
          status: NovelStatus;
          views: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          author_id: string;
          title: string;
          slug: string;
          cover_url?: string | null;
          synopsis: string;
          status?: NovelStatus;
          views?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["novels"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "novels_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      novel_genres: {
        Row: { novel_id: string; genre_id: number };
        Insert: { novel_id: string; genre_id: number };
        Update: Partial<{ novel_id: string; genre_id: number }>;
        Relationships: [
          {
            foreignKeyName: "novel_genres_novel_id_fkey";
            columns: ["novel_id"];
            isOneToOne: false;
            referencedRelation: "novels";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "novel_genres_genre_id_fkey";
            columns: ["genre_id"];
            isOneToOne: false;
            referencedRelation: "genres";
            referencedColumns: ["id"];
          },
        ];
      };
      chapters: {
        Row: {
          id: string;
          novel_id: string;
          chapter_number: number;
          title: string;
          content: string;
          views: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          novel_id: string;
          chapter_number: number;
          title: string;
          content: string;
          views?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["chapters"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "chapters_novel_id_fkey";
            columns: ["novel_id"];
            isOneToOne: false;
            referencedRelation: "novels";
            referencedColumns: ["id"];
          },
        ];
      };
      library: {
        Row: {
          user_id: string;
          novel_id: string;
          last_read_chapter_id: string | null;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          novel_id: string;
          last_read_chapter_id?: string | null;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["library"]["Insert"]>;
        Relationships: [];
      };
      ratings: {
        Row: {
          id: string;
          user_id: string;
          novel_id: string;
          rating: number;
          review: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          novel_id: string;
          rating: number;
          review?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["ratings"]["Insert"]>;
        Relationships: [];
      };
      comments: {
        Row: {
          id: string;
          user_id: string;
          chapter_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          chapter_id: string;
          content: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["comments"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "comments_chapter_id_fkey";
            columns: ["chapter_id"];
            isOneToOne: false;
            referencedRelation: "chapters";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      novel_stats: {
        Row: {
          novel_id: string;
          avg_rating: number;
          rating_count: number;
          chapter_count: number;
        };
        Relationships: [];
      };
    };
    Functions: {
      increment_novel_views: {
        Args: { p_novel_id: string };
        Returns: undefined;
      };
      increment_chapter_views: {
        Args: { p_chapter_id: string };
        Returns: undefined;
      };
    };
  };
};

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Genre = Database["public"]["Tables"]["genres"]["Row"];
export type Novel = Database["public"]["Tables"]["novels"]["Row"];
export type Chapter = Database["public"]["Tables"]["chapters"]["Row"];
export type LibraryEntry = Database["public"]["Tables"]["library"]["Row"];
export type Rating = Database["public"]["Tables"]["ratings"]["Row"];
export type Comment = Database["public"]["Tables"]["comments"]["Row"];
export type NovelStats = Database["public"]["Views"]["novel_stats"]["Row"];
