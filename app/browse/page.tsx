import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getGenres, listNovels, type NovelSort } from "@/lib/queries";
import type { NovelStatus } from "@/lib/database.types";
import { BrowseFilters } from "@/components/browse-filters";
import { NovelGrid } from "@/components/novel-grid";
import { Pagination } from "@/components/pagination";

export const metadata: Metadata = {
  title: "Duyệt truyện | TruyệnHay",
};

const PAGE_SIZE = 24;

type SearchParams = Promise<{
  genre?: string;
  status?: string;
  sort?: string;
  page?: string;
}>;

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? "1") || 1);

  const supabase = await createClient();
  const genres = await getGenres(supabase);
  const { novels, total } = await listNovels(supabase, {
    genreSlug: sp.genre || undefined,
    status: (sp.status as NovelStatus) || undefined,
    sort: (sp.sort as NovelSort) || "updated",
    page,
    pageSize: PAGE_SIZE,
  });

  function buildHref(p: number) {
    const params = new URLSearchParams();
    if (sp.genre) params.set("genre", sp.genre);
    if (sp.status) params.set("status", sp.status);
    if (sp.sort) params.set("sort", sp.sort);
    params.set("page", String(p));
    return `/browse?${params.toString()}`;
  }

  return (
    <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-text">Duyệt truyện</h1>
      <BrowseFilters genres={genres} />
      <NovelGrid novels={novels} emptyMessage="Không tìm thấy truyện phù hợp." />
      <Pagination page={page} total={total} pageSize={PAGE_SIZE} buildHref={buildHref} />
    </div>
  );
}
