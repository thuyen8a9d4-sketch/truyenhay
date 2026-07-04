import Image from "next/image";
import Link from "next/link";
import type { NovelCardData } from "@/lib/queries";
import { StatusBadge } from "@/components/status-badge";
import { RatingStars } from "@/components/rating-stars";
import { formatNumber, genreColorClass, coverGradient } from "@/lib/utils";

export function NovelCard({ novel }: { novel: NovelCardData }) {
  return (
    <Link
      href={`/novel/${novel.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-sm transition hover:-translate-y-0.5 hover:border-accent/60 hover:shadow-md"
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden">
        {novel.cover_url ? (
          <Image
            src={novel.cover_url}
            alt={novel.title}
            fill
            sizes="(max-width: 768px) 45vw, 200px"
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center px-3 text-center text-sm font-semibold text-white"
            style={{ backgroundImage: coverGradient(novel.slug) }}
          >
            {novel.title}
          </div>
        )}
        <div className="absolute left-1.5 top-1.5">
          <StatusBadge status={novel.status} />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <h3 className="line-clamp-2 text-sm font-semibold text-text group-hover:text-accent">
          {novel.title}
        </h3>
        {novel.genres.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {novel.genres.slice(0, 2).map((g) => (
              <span
                key={g.id}
                className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${genreColorClass(g.id)}`}
              >
                {g.name}
              </span>
            ))}
          </div>
        )}
        <div className="mt-auto flex items-center justify-between pt-1">
          <RatingStars rating={novel.stats.avg_rating} size={12} />
          <span className="text-xs text-text-muted">
            {formatNumber(novel.stats.chapter_count)} chương
          </span>
        </div>
      </div>
    </Link>
  );
}
