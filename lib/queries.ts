import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Genre, Novel, NovelStats, NovelStatus } from "@/lib/database.types";

type SB = SupabaseClient<Database>;

type NovelBase = Pick<
  Novel,
  | "id"
  | "author_id"
  | "title"
  | "slug"
  | "cover_url"
  | "synopsis"
  | "status"
  | "views"
  | "created_at"
  | "updated_at"
>;

export type NovelCardData = NovelBase & {
  author: { username: string; display_name: string | null } | null;
  genres: Genre[];
  stats: NovelStats;
};

const NOVEL_COLUMNS =
  "id,author_id,title,slug,cover_url,synopsis,status,views,created_at,updated_at";

export async function attachNovelCardData(
  supabase: SB,
  novels: NovelBase[],
): Promise<NovelCardData[]> {
  if (novels.length === 0) return [];

  const ids = novels.map((n) => n.id);
  const authorIds = Array.from(new Set(novels.map((n) => n.author_id)));

  const [{ data: authors }, { data: genreRows }, { data: statsRows }] =
    await Promise.all([
      supabase.from("profiles").select("id, username, display_name").in("id", authorIds),
      supabase
        .from("novel_genres")
        .select("novel_id, genres(id, name, slug)")
        .in("novel_id", ids),
      supabase.from("novel_stats").select("*").in("novel_id", ids),
    ]);

  const authorMap = new Map((authors ?? []).map((a) => [a.id, a]));
  const statsMap = new Map((statsRows ?? []).map((s) => [s.novel_id, s]));
  const genresMap = new Map<string, Genre[]>();

  for (const row of (genreRows ?? []) as unknown as {
    novel_id: string;
    genres: Genre | null;
  }[]) {
    const list = genresMap.get(row.novel_id) ?? [];
    if (row.genres) list.push(row.genres);
    genresMap.set(row.novel_id, list);
  }

  return novels.map((n) => ({
    ...n,
    author: authorMap.get(n.author_id) ?? null,
    genres: genresMap.get(n.id) ?? [],
    stats:
      statsMap.get(n.id) ?? {
        novel_id: n.id,
        avg_rating: 0,
        rating_count: 0,
        chapter_count: 0,
      },
  }));
}

export type NovelSort = "updated" | "newest" | "trending";

export type ListNovelsOptions = {
  genreSlug?: string;
  status?: NovelStatus;
  search?: string;
  sort?: NovelSort;
  page?: number;
  pageSize?: number;
  authorId?: string;
};

export async function listNovels(supabase: SB, opts: ListNovelsOptions) {
  const page = opts.page ?? 1;
  const pageSize = opts.pageSize ?? 24;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let genreNovelIds: string[] | null = null;
  if (opts.genreSlug) {
    const { data: genre } = await supabase
      .from("genres")
      .select("id")
      .eq("slug", opts.genreSlug)
      .single();
    if (!genre) return { novels: [] as NovelCardData[], total: 0 };

    const { data: rels } = await supabase
      .from("novel_genres")
      .select("novel_id")
      .eq("genre_id", genre.id);
    genreNovelIds = (rels ?? []).map((r) => r.novel_id);
    if (genreNovelIds.length === 0) return { novels: [] as NovelCardData[], total: 0 };
  }

  let query = supabase
    .from("novels")
    .select(NOVEL_COLUMNS, { count: "exact" });

  if (opts.status) query = query.eq("status", opts.status);
  if (opts.authorId) query = query.eq("author_id", opts.authorId);
  if (genreNovelIds) query = query.in("id", genreNovelIds);
  if (opts.search) query = query.ilike("title", `%${opts.search}%`);

  if (opts.sort === "newest") {
    query = query.order("created_at", { ascending: false });
  } else if (opts.sort === "trending") {
    query = query.order("views", { ascending: false });
  } else {
    query = query.order("updated_at", { ascending: false });
  }

  const { data, count } = await query.range(from, to);
  const novels = await attachNovelCardData(supabase, data ?? []);

  return { novels, total: count ?? 0 };
}

export type RankingSort = "views" | "rating" | "newest";

export async function getRankings(
  supabase: SB,
  opts: { sort: RankingSort; page?: number; pageSize?: number },
) {
  const page = opts.page ?? 1;
  const pageSize = opts.pageSize ?? 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  if (opts.sort === "rating") {
    const { data: statsRows, count } = await supabase
      .from("novel_stats")
      .select("novel_id, avg_rating, rating_count", { count: "exact" })
      .gt("rating_count", 0)
      .order("avg_rating", { ascending: false })
      .range(from, to);

    const ids = (statsRows ?? []).map((s) => s.novel_id);
    if (ids.length === 0) return { novels: [] as NovelCardData[], total: count ?? 0 };

    const { data: novelRows } = await supabase
      .from("novels")
      .select(NOVEL_COLUMNS)
      .in("id", ids);

    const orderMap = new Map(ids.map((id, idx) => [id, idx]));
    const ordered = (novelRows ?? []).sort(
      (a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0),
    );

    const novels = await attachNovelCardData(supabase, ordered);
    return { novels, total: count ?? 0 };
  }

  return listNovels(supabase, {
    sort: opts.sort === "newest" ? "newest" : "trending",
    page,
    pageSize,
  });
}

export async function getGenres(supabase: SB): Promise<Genre[]> {
  const { data } = await supabase.from("genres").select("*").order("name");
  return data ?? [];
}

export type AuthorInfo = {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
};

export type NovelDetail = Novel & {
  author: AuthorInfo | null;
  genres: Genre[];
  stats: NovelStats;
};

export async function getNovelDetail(
  supabase: SB,
  slug: string,
): Promise<NovelDetail | null> {
  const { data: novel } = await supabase
    .from("novels")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!novel) return null;

  const [{ data: author }, { data: genreRows }, { data: statsRow }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url, bio")
        .eq("id", novel.author_id)
        .single(),
      supabase.from("novel_genres").select("genres(id, name, slug)").eq("novel_id", novel.id),
      supabase.from("novel_stats").select("*").eq("novel_id", novel.id).single(),
    ]);

  const genres = ((genreRows ?? []) as unknown as { genres: Genre | null }[])
    .map((r) => r.genres)
    .filter((g): g is Genre => g !== null);

  return {
    ...novel,
    author: author ?? null,
    genres,
    stats: statsRow ?? {
      novel_id: novel.id,
      avg_rating: 0,
      rating_count: 0,
      chapter_count: 0,
    },
  };
}

export type ChapterListItem = {
  id: string;
  chapter_number: number;
  title: string;
  created_at: string;
  views: number;
};

export async function getChapterList(
  supabase: SB,
  novelId: string,
): Promise<ChapterListItem[]> {
  const { data } = await supabase
    .from("chapters")
    .select("id, chapter_number, title, created_at, views")
    .eq("novel_id", novelId)
    .order("chapter_number", { ascending: true });
  return data ?? [];
}

export type ReviewItem = {
  id: string;
  rating: number;
  review: string | null;
  created_at: string;
  user_id: string;
  author: { username: string; display_name: string | null } | null;
};

export async function getReviews(
  supabase: SB,
  novelId: string,
): Promise<ReviewItem[]> {
  const { data } = await supabase
    .from("ratings")
    .select("id, rating, review, created_at, user_id")
    .eq("novel_id", novelId)
    .not("review", "is", null)
    .order("created_at", { ascending: false })
    .limit(20);

  if (!data || data.length === 0) return [];

  const userIds = Array.from(new Set(data.map((r) => r.user_id)));
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, username, display_name")
    .in("id", userIds);

  const map = new Map((profiles ?? []).map((p) => [p.id, p]));
  return data.map((r) => ({ ...r, author: map.get(r.user_id) ?? null }));
}

export type CommentItem = {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  author: { username: string; display_name: string | null } | null;
};

export async function getComments(
  supabase: SB,
  chapterId: string,
): Promise<CommentItem[]> {
  const { data } = await supabase
    .from("comments")
    .select("id, content, created_at, user_id")
    .eq("chapter_id", chapterId)
    .order("created_at", { ascending: false });

  if (!data || data.length === 0) return [];

  const userIds = Array.from(new Set(data.map((c) => c.user_id)));
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, username, display_name")
    .in("id", userIds);

  const map = new Map((profiles ?? []).map((p) => [p.id, p]));
  return data.map((c) => ({ ...c, author: map.get(c.user_id) ?? null }));
}

export async function getUserRating(supabase: SB, novelId: string, userId: string) {
  const { data } = await supabase
    .from("ratings")
    .select("rating, review")
    .eq("novel_id", novelId)
    .eq("user_id", userId)
    .maybeSingle();
  return data;
}

export type LibraryItem = {
  novel: NovelCardData;
  lastReadChapter: { chapter_number: number; title: string } | null;
  updatedAt: string;
};

export async function getLibrary(supabase: SB, userId: string): Promise<LibraryItem[]> {
  const { data: entries } = await supabase
    .from("library")
    .select("novel_id, last_read_chapter_id, updated_at")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (!entries || entries.length === 0) return [];

  const novelIds = entries.map((e) => e.novel_id);
  const { data: novelRows } = await supabase
    .from("novels")
    .select(NOVEL_COLUMNS)
    .in("id", novelIds);
  const novels = await attachNovelCardData(supabase, novelRows ?? []);
  const novelMap = new Map(novels.map((n) => [n.id, n]));

  const chapterIds = entries
    .map((e) => e.last_read_chapter_id)
    .filter((id): id is string => !!id);
  const { data: chapterRows } =
    chapterIds.length > 0
      ? await supabase.from("chapters").select("id, chapter_number, title").in("id", chapterIds)
      : { data: [] as { id: string; chapter_number: number; title: string }[] };
  const chapterMap = new Map(
    (chapterRows ?? []).map((c) => [
      c.id,
      { chapter_number: c.chapter_number, title: c.title },
    ]),
  );

  return entries
    .map((e) => {
      const novel = novelMap.get(e.novel_id);
      if (!novel) return null;
      return {
        novel,
        lastReadChapter: e.last_read_chapter_id
          ? chapterMap.get(e.last_read_chapter_id) ?? null
          : null,
        updatedAt: e.updated_at,
      };
    })
    .filter((x): x is LibraryItem => x !== null);
}
