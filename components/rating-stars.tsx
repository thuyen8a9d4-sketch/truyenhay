export function RatingStars({
  rating,
  size = 14,
}: {
  rating: number;
  size?: number;
}) {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating}/5 sao`}>
      {stars.map((s) => {
        const filled = rating >= s - 0.25;
        return (
          <svg
            key={s}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            width={size}
            height={size}
            fill={filled ? "var(--star)" : "none"}
            stroke="var(--star)"
            strokeWidth={filled ? 0 : 1}
          >
            <path d="M10 1.5l2.59 5.25 5.79.84-4.19 4.08.99 5.77L10 14.9l-5.18 2.54.99-5.77-4.19-4.08 5.79-.84L10 1.5z" />
          </svg>
        );
      })}
    </div>
  );
}
