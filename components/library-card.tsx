import Image from "next/image";
import Link from "next/link";
import type { LibraryItem } from "@/lib/queries";
import { StatusBadge } from "@/components/status-badge";

export function LibraryCard({ item }: { item: LibraryItem }) {
  const continueHref = item.lastReadChapter
    ? `/novel/${item.novel.slug}/${item.lastReadChapter.chapter_number}`
    : `/novel/${item.novel.slug}`;

  return (
    <div className="flex gap-3 rounded-xl border border-border bg-surface p-3">
      <Link
        href={`/novel/${item.novel.slug}`}
        className="relative h-24 w-16 shrink-0 overflow-hidden rounded-lg bg-surface-hover"
      >
        {item.novel.cover_url ? (
          <Image
            src={item.novel.cover_url}
            alt={item.novel.title}
            fill
            sizes="64px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-1 text-center text-[10px] text-text-muted">
            {item.novel.title}
          </div>
        )}
      </Link>
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <Link
            href={`/novel/${item.novel.slug}`}
            className="line-clamp-1 text-sm font-semibold text-text hover:text-accent"
          >
            {item.novel.title}
          </Link>
          <div className="mt-1 flex items-center gap-2">
            <StatusBadge status={item.novel.status} />
            <span className="text-xs text-text-muted">
              {item.novel.stats.chapter_count} chương
            </span>
          </div>
        </div>
        <Link
          href={continueHref}
          className="mt-2 w-fit rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white hover:bg-accent-hover"
        >
          {item.lastReadChapter
            ? `Đọc tiếp: Chương ${item.lastReadChapter.chapter_number}`
            : "Bắt đầu đọc"}
        </Link>
      </div>
    </div>
  );
}
