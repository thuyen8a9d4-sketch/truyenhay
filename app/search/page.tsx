import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { listNovels } from "@/lib/queries";
import { NovelGrid } from "@/components/novel-grid";
import { Pagination } from "@/components/pagination";

export const metadata: Metadata = {
  title: "Tìm kiếm | TruyệnHay",
};

const PAGE_SIZE = 24;

type SearchParams = Promise<{ q?: string; page?: string }>;

export default async function SearchPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const query = (sp.q ?? "").trim();
  const page = Math.max(1, Number(sp.page ?? "1") || 1);

  const supabase = await createClient();
  const { novels, total } = query
    ? await listNovels(supabase, { search: query, page, pageSize: PAGE_SIZE })
    : { novels: [], total: 0 };

  return (
    <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold text-text">Kết quả tìm kiếm</h1>
      <p className="mb-6 text-text-muted">
        {query
          ? `${total} kết quả cho "${query}"`
          : "Nhập từ khoá vào ô tìm kiếm phía trên để bắt đầu."}
      </p>
      <NovelGrid
        novels={novels}
        emptyMessage={query ? "Không tìm thấy truyện phù hợp." : "Chưa có từ khoá tìm kiếm."}
      />
      <Pagination
        page={page}
        total={total}
        pageSize={PAGE_SIZE}
        buildHref={(p) => `/search?q=${encodeURIComponent(query)}&page=${p}`}
      />
    </div>
  );
}
