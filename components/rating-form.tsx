"use client";

import { useActionState, useState } from "react";
import { submitRating, type RatingState } from "@/lib/actions/ratings";

export function RatingForm({
  novelId,
  novelSlug,
  initialRating,
  initialReview,
}: {
  novelId: string;
  novelSlug: string;
  initialRating: number;
  initialReview: string;
}) {
  const action = submitRating.bind(null, novelId, novelSlug);
  const [state, formAction, pending] = useActionState<RatingState, FormData>(
    action,
    undefined,
  );
  const [rating, setRating] = useState(initialRating);
  const [hover, setHover] = useState(0);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="rating" value={rating} />

      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            type="button"
            onMouseEnter={() => setHover(s)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setRating(s)}
            className="p-0.5"
            aria-label={`${s} sao`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              width={26}
              height={26}
              fill={(hover || rating) >= s ? "var(--star)" : "none"}
              stroke="var(--star)"
              strokeWidth={(hover || rating) >= s ? 0 : 1.2}
            >
              <path d="M10 1.5l2.59 5.25 5.79.84-4.19 4.08.99 5.77L10 14.9l-5.18 2.54.99-5.77-4.19-4.08 5.79-.84L10 1.5z" />
            </svg>
          </button>
        ))}
      </div>

      <textarea
        name="review"
        defaultValue={initialReview}
        rows={3}
        placeholder="Viết cảm nhận của bạn (không bắt buộc)..."
        className="resize-none rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text outline-none focus:border-accent"
      />

      {state?.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
      {state?.success && (
        <p className="text-sm text-green-600 dark:text-green-400">Đã lưu đánh giá của bạn.</p>
      )}

      <button
        type="submit"
        disabled={pending || rating === 0}
        className="w-fit rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-hover disabled:opacity-50"
      >
        {pending ? "Đang gửi..." : "Gửi đánh giá"}
      </button>
    </form>
  );
}
