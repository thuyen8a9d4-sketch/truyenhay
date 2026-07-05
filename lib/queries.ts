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
  | "approval_status"
  | "created_at"
  | "updated_at"
>;

export type NovelCardData = NovelBase & {
  author: { username: string; display_name: string | null } | null;
  genres: Genre[];
  stats: NovelStats;
};

const NOVEL_COLUMNS =
  "id,author_id,title,slug,cover_url,synopsis,status,views,approval_status,created_at,updated_at";

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
  /** Mặc định "approved" cho các trang công khai. Trang dashboard tác giả
   * truyền "all" (kèm authorId) để tác giả thấy cả truyện đang chờ/bị từ chối. */
  approvalStatus?: "approved" | "all";
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
  if (opts.approvalStatus !== "all") query = query.eq("approval_status", "approved");

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
      .eq("approval_status", "approved")
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
  is_locked: boolean;
  price_coins: number;
  unlocked: boolean;
};

export async function getChapterList(
  supabase: SB,
  novelId: string,
  userId?: string,
): Promise<ChapterListItem[]> {
  const { data } = await supabase
    .from("chapters")
    .select("id, chapter_number, title, created_at, views, is_locked, price_coins")
    .eq("novel_id", novelId)
    .order("chapter_number", { ascending: true });

  const chapters = data ?? [];
  if (!userId || chapters.length === 0) {
    return chapters.map((c) => ({ ...c, unlocked: false }));
  }

  const { data: unlocks } = await supabase
    .from("chapter_unlocks")
    .select("chapter_id")
    .eq("user_id", userId)
    .in(
      "chapter_id",
      chapters.map((c) => c.id),
    );

  const unlockedSet = new Set((unlocks ?? []).map((u) => u.chapter_id));
  return chapters.map((c) => ({ ...c, unlocked: unlockedSet.has(c.id) }));
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

export async function getWallet(supabase: SB, userId: string): Promise<number> {
  const { data } = await supabase
    .from("wallets")
    .select("coin_balance")
    .eq("user_id", userId)
    .maybeSingle();
  return data?.coin_balance ?? 0;
}

export async function getChapterContent(
  supabase: SB,
  chapterId: string,
): Promise<string | null> {
  const { data } = await supabase
    .from("chapter_contents")
    .select("content")
    .eq("chapter_id", chapterId)
    .maybeSingle();
  return data?.content ?? null;
}

export type IncomeSummary = {
  totalTransactions: number;
  totalCoinsSpent: number;
  totalValueVnd: number;
  totalAuthorEarningVnd: number;
  totalPlatformEarningVnd: number;
  byMonth: {
    month: string;
    valueVnd: number;
    authorEarningVnd: number;
    platformEarningVnd: number;
    transactions: number;
  }[];
};

export async function getIncomeStatement(supabase: SB): Promise<IncomeSummary> {
  const { data } = await supabase
    .from("chapter_unlocks")
    .select("coins_spent, value_vnd, author_earning_vnd, platform_earning_vnd, created_at")
    .order("created_at", { ascending: false });

  const rows = data ?? [];
  const byMonthMap = new Map<
    string,
    { valueVnd: number; authorEarningVnd: number; platformEarningVnd: number; transactions: number }
  >();

  let totalCoinsSpent = 0;
  let totalValueVnd = 0;
  let totalAuthorEarningVnd = 0;
  let totalPlatformEarningVnd = 0;

  for (const r of rows) {
    totalCoinsSpent += r.coins_spent;
    totalValueVnd += Number(r.value_vnd);
    totalAuthorEarningVnd += Number(r.author_earning_vnd);
    totalPlatformEarningVnd += Number(r.platform_earning_vnd);

    const month = r.created_at.slice(0, 7);
    const entry = byMonthMap.get(month) ?? {
      valueVnd: 0,
      authorEarningVnd: 0,
      platformEarningVnd: 0,
      transactions: 0,
    };
    entry.valueVnd += Number(r.value_vnd);
    entry.authorEarningVnd += Number(r.author_earning_vnd);
    entry.platformEarningVnd += Number(r.platform_earning_vnd);
    entry.transactions += 1;
    byMonthMap.set(month, entry);
  }

  const byMonth = Array.from(byMonthMap.entries())
    .map(([month, v]) => ({ month, ...v }))
    .sort((a, b) => b.month.localeCompare(a.month));

  return {
    totalTransactions: rows.length,
    totalCoinsSpent,
    totalValueVnd,
    totalAuthorEarningVnd,
    totalPlatformEarningVnd,
    byMonth,
  };
}

export type AuthorIncomeRow = {
  authorId: string;
  authorName: string;
  transactions: number;
  totalValueVnd: number;
  authorEarningVnd: number;
  platformEarningVnd: number;
};

export async function getIncomeByAuthor(supabase: SB): Promise<AuthorIncomeRow[]> {
  const { data } = await supabase
    .from("chapter_unlocks")
    .select("novel_id, value_vnd, author_earning_vnd, platform_earning_vnd");

  const rows = data ?? [];
  if (rows.length === 0) return [];

  const novelIds = Array.from(new Set(rows.map((r) => r.novel_id)));
  const { data: novels } = await supabase
    .from("novels")
    .select("id, author_id")
    .in("id", novelIds);
  const novelMap = new Map((novels ?? []).map((n) => [n.id, n]));

  const authorIds = Array.from(new Set((novels ?? []).map((n) => n.author_id)));
  const { data: authors } = await supabase
    .from("profiles")
    .select("id, username, display_name")
    .in("id", authorIds);
  const authorMap = new Map((authors ?? []).map((a) => [a.id, a]));

  const byAuthor = new Map<string, AuthorIncomeRow>();
  for (const r of rows) {
    const novel = novelMap.get(r.novel_id);
    if (!novel) continue;
    const author = authorMap.get(novel.author_id);
    const key = novel.author_id;
    const entry = byAuthor.get(key) ?? {
      authorId: key,
      authorName: author?.display_name ?? author?.username ?? "Không rõ",
      transactions: 0,
      totalValueVnd: 0,
      authorEarningVnd: 0,
      platformEarningVnd: 0,
    };
    entry.transactions += 1;
    entry.totalValueVnd += Number(r.value_vnd);
    entry.authorEarningVnd += Number(r.author_earning_vnd);
    entry.platformEarningVnd += Number(r.platform_earning_vnd);
    byAuthor.set(key, entry);
  }

  return Array.from(byAuthor.values()).sort((a, b) => b.authorEarningVnd - a.authorEarningVnd);
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

export type PendingNovelItem = {
  id: string;
  title: string;
  slug: string;
  synopsis: string;
  created_at: string;
  author: { username: string; display_name: string | null } | null;
};

export async function getPendingNovels(supabase: SB): Promise<PendingNovelItem[]> {
  const { data } = await supabase
    .from("novels")
    .select("id, title, slug, synopsis, author_id, created_at")
    .eq("approval_status", "pending")
    .order("created_at", { ascending: true });

  const rows = data ?? [];
  if (rows.length === 0) return [];

  const authorIds = Array.from(new Set(rows.map((r) => r.author_id)));
  const { data: authors } = await supabase
    .from("profiles")
    .select("id, username, display_name")
    .in("id", authorIds);
  const authorMap = new Map((authors ?? []).map((a) => [a.id, a]));

  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    slug: r.slug,
    synopsis: r.synopsis,
    created_at: r.created_at,
    author: authorMap.get(r.author_id) ?? null,
  }));
}

export type PendingAuthorApplicationItem = {
  id: string;
  message: string;
  created_at: string;
  applicant: { username: string; display_name: string | null } | null;
};

export async function getPendingAuthorApplications(
  supabase: SB,
): Promise<PendingAuthorApplicationItem[]> {
  const { data } = await supabase
    .from("author_applications")
    .select("id, user_id, message, created_at")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  const rows = data ?? [];
  if (rows.length === 0) return [];

  const userIds = Array.from(new Set(rows.map((r) => r.user_id)));
  const { data: users } = await supabase
    .from("profiles")
    .select("id, username, display_name")
    .in("id", userIds);
  const userMap = new Map((users ?? []).map((u) => [u.id, u]));

  return rows.map((r) => ({
    id: r.id,
    message: r.message,
    created_at: r.created_at,
    applicant: userMap.get(r.user_id) ?? null,
  }));
}

export async function getAuthorApplicationStatus(supabase: SB, userId: string) {
  const { data } = await supabase
    .from("author_applications")
    .select("id, status, reject_reason, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data;
}

export type PendingWithdrawalItem = {
  id: string;
  coins: number;
  amount_vnd: number;
  bank_name: string;
  bank_account_number: string;
  bank_account_holder: string;
  created_at: string;
  author: { username: string; display_name: string | null } | null;
};

export async function getPendingWithdrawals(supabase: SB): Promise<PendingWithdrawalItem[]> {
  const { data } = await supabase
    .from("withdrawal_requests")
    .select(
      "id, author_id, coins, amount_vnd, bank_name, bank_account_number, bank_account_holder, created_at",
    )
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  const rows = data ?? [];
  if (rows.length === 0) return [];

  const authorIds = Array.from(new Set(rows.map((r) => r.author_id)));
  const { data: authors } = await supabase
    .from("profiles")
    .select("id, username, display_name")
    .in("id", authorIds);
  const authorMap = new Map((authors ?? []).map((a) => [a.id, a]));

  return rows.map((r) => ({
    id: r.id,
    coins: r.coins,
    amount_vnd: Number(r.amount_vnd),
    bank_name: r.bank_name,
    bank_account_number: r.bank_account_number,
    bank_account_holder: r.bank_account_holder,
    created_at: r.created_at,
    author: authorMap.get(r.author_id) ?? null,
  }));
}

export async function getWithdrawalHistory(supabase: SB, authorId: string) {
  const { data } = await supabase
    .from("withdrawal_requests")
    .select("id, coins, amount_vnd, status, reject_reason, created_at")
    .eq("author_id", authorId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getNotifications(supabase: SB, userId: string, limit = 20) {
  const { data } = await supabase
    .from("notifications")
    .select("id, user_id, type, title, body, link, is_read, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function getUnreadNotificationCount(supabase: SB, userId: string): Promise<number> {
  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_read", false);
  return count ?? 0;
}

export type AuthorNovelEligibility = {
  id: string;
  title: string;
  views: number;
  totalChars: number;
  eligible: boolean;
};

export async function getAuthorNovelEligibility(
  supabase: SB,
  authorId: string,
): Promise<AuthorNovelEligibility[]> {
  const { data: novels } = await supabase
    .from("novels")
    .select("id, title, views")
    .eq("author_id", authorId)
    .eq("approval_status", "approved");

  const rows = novels ?? [];
  if (rows.length === 0) return [];

  const { data: statsRows } = await supabase
    .from("novel_content_stats")
    .select("novel_id, total_chars")
    .in(
      "novel_id",
      rows.map((n) => n.id),
    );
  const statsMap = new Map((statsRows ?? []).map((s) => [s.novel_id, s.total_chars]));

  return rows.map((n) => {
    const totalChars = statsMap.get(n.id) ?? 0;
    return {
      id: n.id,
      title: n.title,
      views: n.views,
      totalChars,
      eligible: n.views >= 2000 && totalChars >= 20000,
    };
  });
}

export type AuthorDashboardStat = {
  novelId: string;
  revenueVnd: number;
  commentCount: number;
};

export async function getAuthorDashboardStats(
  supabase: SB,
  authorId: string,
): Promise<Map<string, AuthorDashboardStat>> {
  const { data: novels } = await supabase
    .from("novels")
    .select("id")
    .eq("author_id", authorId);
  const novelIds = (novels ?? []).map((n) => n.id);
  const result = new Map<string, AuthorDashboardStat>();
  if (novelIds.length === 0) return result;

  for (const id of novelIds) {
    result.set(id, { novelId: id, revenueVnd: 0, commentCount: 0 });
  }

  const { data: unlocks } = await supabase
    .from("chapter_unlocks")
    .select("novel_id, author_earning_vnd")
    .in("novel_id", novelIds);
  for (const u of unlocks ?? []) {
    const entry = result.get(u.novel_id);
    if (entry) entry.revenueVnd += Number(u.author_earning_vnd);
  }

  const { data: chapterRows } = await supabase
    .from("chapters")
    .select("id, novel_id")
    .in("novel_id", novelIds);
  const chapterToNovel = new Map((chapterRows ?? []).map((c) => [c.id, c.novel_id]));
  const chapterIds = (chapterRows ?? []).map((c) => c.id);

  if (chapterIds.length > 0) {
    const { data: comments } = await supabase
      .from("comments")
      .select("chapter_id")
      .in("chapter_id", chapterIds);
    for (const c of comments ?? []) {
      const novelId = chapterToNovel.get(c.chapter_id);
      const entry = novelId ? result.get(novelId) : undefined;
      if (entry) entry.commentCount += 1;
    }
  }

  return result;
}
