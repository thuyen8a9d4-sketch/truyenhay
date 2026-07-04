import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getRankings, type RankingSort } from "@/lib/queries";
import { NovelGrid } from "@/components/novel-grid";
import { Pagination } from "@/components/pagination";

export const metadata: Metadata = {
  title: "Bảng xếp hạng | TruyệnHay",
};

const PAGE_SIZE = 24;

const TABS: { value: RankingSort; label: string }[] = [
  { value: "views", label: "Lượt xem" },
  { value: "rating", label: "Đánh giá cao" },
  { value: "newest", label: "Mới nhất" },
];

type SearchParams = Promise<{ sort?: string; page?: string }>;

export default async function RankingsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const sort: RankingSort =
    sp.sort === "rating" || sp.sort === "newest" ? sp.sort : "views";
  const page = Math.max(1, Number(sp.page ?? "1") || 1);

  const supabase = await createClient();
  const { novels, total } = await getRankings(supabase, {
    sort,
    page,
    pageSize: PAGE_SIZE,
  });

  return (
    <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-text">Bảng xếp hạng</h1>

      <div className="mb-6 flex gap-1.5">
        {TABS.map((tab) => (
          <Link
            key={tab.value}
            href={`/rankings?sort=${tab.value}`}
            className={`rounded-full px-4 py-2 text-sm transition ${
              sort === tab.value
                ? "bg-accent text-white"
                : "bg-surface text-text-muted hover:text-text"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <NovelGrid novels={novels} emptyMessage="Chưa có dữ liệu xếp hạng." />
      <Pagination
        page={page}
        total={total}
        pageSize={PAGE_SIZE}
        buildHref={(p) => `/rankings?sort=${sort}&page=${p}`}
      />
    </div>
  );
}
