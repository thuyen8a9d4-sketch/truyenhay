import { RatingStars } from "@/components/rating-stars";
import { formatDate } from "@/lib/utils";
import type { ReviewItem } from "@/lib/queries";

export function ReviewList({ reviews }: { reviews: ReviewItem[] }) {
  if (reviews.length === 0) {
    return (
      <p className="text-sm text-text-muted">
        Chưa có đánh giá nào. Hãy là người đầu tiên chia sẻ cảm nhận!
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {reviews.map((r) => (
        <div key={r.id} className="border-b border-border pb-4 last:border-none">
          <div className="mb-1 flex items-center gap-2">
            <span className="text-sm font-medium text-text">
              {r.author?.display_name ?? r.author?.username ?? "Ẩn danh"}
            </span>
            <RatingStars rating={r.rating} size={12} />
            <span className="text-xs text-text-muted">{formatDate(r.created_at)}</span>
          </div>
          {r.review && <p className="text-sm text-text-muted">{r.review}</p>}
        </div>
      ))}
    </div>
  );
}
