import type { NovelCardData } from "@/lib/queries";
import { NovelCard } from "@/components/novel-card";
import { EmptyState } from "@/components/empty-state";

export function NovelGrid({
  novels,
  emptyMessage = "Chưa có truyện nào.",
}: {
  novels: NovelCardData[];
  emptyMessage?: string;
}) {
  if (novels.length === 0) {
    return <EmptyState message={emptyMessage} />;
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {novels.map((novel) => (
        <NovelCard key={novel.id} novel={novel} />
      ))}
    </div>
  );
}
