import Link from "next/link";
import { formatDate } from "@/lib/utils";
import type { ChapterListItem } from "@/lib/queries";

export function ChapterList({
  novelSlug,
  chapters,
  lastReadChapterId,
}: {
  novelSlug: string;
  chapters: ChapterListItem[];
  lastReadChapterId?: string | null;
}) {
  if (chapters.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border py-8 text-center text-sm text-text-muted">
        Truyện chưa có chương nào.
      </p>
    );
  }

  return (
    <div className="max-h-[520px] divide-y divide-border overflow-y-auto rounded-lg border border-border">
      {chapters.map((c) => (
        <Link
          key={c.id}
          href={`/novel/${novelSlug}/${c.chapter_number}`}
          className={`flex items-center justify-between gap-3 px-4 py-3 text-sm hover:bg-surface-hover ${
            c.id === lastReadChapterId ? "bg-accent/10" : ""
          }`}
        >
          <span className="truncate text-text">
            Chương {c.chapter_number}: {c.title}
          </span>
          <span className="shrink-0 text-xs text-text-muted">
            {formatDate(c.created_at)}
          </span>
        </Link>
      ))}
    </div>
  );
}
