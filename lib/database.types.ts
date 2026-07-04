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
          is_admin: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          username: string;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          is_author?: boolean;
          is_admin?: boolean;
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
          is_locked: boolean;
          price_coins: number;
          views: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          novel_id: string;
          chapter_number: number;
          title: string;
          is_locked?: boolean;
          price_coins?: number;
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
      chapter_contents: {
        Row: { chapter_id: string; content: string };
        Insert: { chapter_id: string; content?: string };
        Update: Partial<{ chapter_id: string; content: string }>;
        Relationships: [
          {
            foreignKeyName: "chapter_contents_chapter_id_fkey";
            columns: ["chapter_id"];
            isOneToOne: true;
            referencedRelation: "chapters";
            referencedColumns: ["id"];
          },
        ];
      };
      wallets: {
        Row: { user_id: string; coin_balance: number; updated_at: string };
        Insert: {
          user_id: string;
          coin_balance?: number;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["wallets"]["Insert"]>;
        Relationships: [];
      };
      coin_purchases: {
        Row: {
          id: string;
          user_id: string;
          coins: number;
          amount_vnd: number;
          note: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          coins: number;
          amount_vnd: number;
          note?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["coin_purchases"]["Insert"]>;
        Relationships: [];
      };
      chapter_unlocks: {
        Row: {
          id: string;
          user_id: string;
          chapter_id: string;
          novel_id: string;
          coins_spent: number;
          value_vnd: number;
          author_earning_vnd: number;
          platform_earning_vnd: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          chapter_id: string;
          novel_id: string;
          coins_spent: number;
          value_vnd: number;
          author_earning_vnd: number;
          platform_earning_vnd: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["chapter_unlocks"]["Insert"]>;
        Relationships: [];
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
      unlock_chapter: {
        Args: { p_chapter_id: string };
        Returns: { success: boolean; message: string; new_balance: number }[];
      };
      admin_credit_coins: {
        Args: {
          p_user_id: string;
          p_coins: number;
          p_amount_vnd: number;
          p_note: string | null;
        };
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
export type Wallet = Database["public"]["Tables"]["wallets"]["Row"];
export type CoinPurchase = Database["public"]["Tables"]["coin_purchases"]["Row"];
export type ChapterUnlock = Database["public"]["Tables"]["chapter_unlocks"]["Row"];
export type ChapterContent = Database["public"]["Tables"]["chapter_contents"]["Row"];

export const COIN_VALUE_VND = 200;
export const AUTHOR_SHARE = 0.6;
export const PLATFORM_SHARE = 0.4;

export const COIN_PACKAGES = [
  { coins: 100, priceVnd: 20_000 },
  { coins: 300, priceVnd: 55_000 },
  { coins: 700, priceVnd: 120_000 },
  { coins: 1500, priceVnd: 240_000 },
] as const;
