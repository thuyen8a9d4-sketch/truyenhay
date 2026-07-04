import Link from "next/link";

export function Pagination({
  page,
  total,
  pageSize,
  buildHref,
}: {
  page: number;
  total: number;
  pageSize: number;
  buildHref: (page: number) => string;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2,
  );

  return (
    <nav className="mt-8 flex flex-wrap items-center justify-center gap-1.5">
      <Link
        href={buildHref(Math.max(1, page - 1))}
        aria-disabled={page === 1}
        className={`rounded-lg border border-border px-3 py-1.5 text-sm ${
          page === 1
            ? "pointer-events-none text-text-muted opacity-40"
            : "text-text hover:bg-surface-hover"
        }`}
      >
        Trước
      </Link>

      {pages.map((p, idx) => (
        <span key={p} className="flex items-center gap-1.5">
          {idx > 0 && pages[idx - 1] !== p - 1 && (
            <span className="px-1 text-text-muted">…</span>
          )}
          <Link
            href={buildHref(p)}
            className={`rounded-lg border px-3 py-1.5 text-sm ${
              p === page
                ? "border-accent bg-accent text-white"
                : "border-border text-text hover:bg-surface-hover"
            }`}
          >
            {p}
          </Link>
        </span>
      ))}

      <Link
        href={buildHref(Math.min(totalPages, page + 1))}
        aria-disabled={page === totalPages}
        className={`rounded-lg border border-border px-3 py-1.5 text-sm ${
          page === totalPages
            ? "pointer-events-none text-text-muted opacity-40"
            : "text-text hover:bg-surface-hover"
        }`}
      >
        Sau
      </Link>
    </nav>
  );
}
