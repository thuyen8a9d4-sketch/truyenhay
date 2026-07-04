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
            {c.is_locked && c.price_coins > 0 && !c.unlocked && "🔒 "}
            Chương {c.chapter_number}: {c.title}
          </span>
          <span className="flex shrink-0 items-center gap-2 text-xs text-text-muted">
            {c.is_locked && c.price_coins > 0 && !c.unlocked && (
              <span className="rounded-full bg-accent/15 px-2 py-0.5 text-accent">
                {c.price_coins} xu
              </span>
            )}
            {formatDate(c.created_at)}
          </span>
        </Link>
      ))}
    </div>
  );
}
