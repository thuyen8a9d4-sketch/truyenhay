"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { Genre } from "@/lib/database.types";

const STATUS_OPTIONS = [
  { value: "", label: "Tất cả" },
  { value: "ongoing", label: "Đang ra" },
  { value: "completed", label: "Hoàn thành" },
  { value: "hiatus", label: "Tạm ngưng" },
];

const SORT_OPTIONS = [
  { value: "updated", label: "Mới cập nhật" },
  { value: "newest", label: "Mới đăng" },
  { value: "trending", label: "Thịnh hành" },
];

export function BrowseFilters({ genres }: { genres: Genre[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  const currentGenre = searchParams.get("genre") ?? "";
  const currentStatus = searchParams.get("status") ?? "";
  const currentSort = searchParams.get("sort") ?? "updated";

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3">
      <select
        value={currentGenre}
        onChange={(e) => setParam("genre", e.target.value)}
        className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-accent"
      >
        <option value="">Tất cả thể loại</option>
        {genres.map((g) => (
          <option key={g.id} value={g.slug}>
            {g.name}
          </option>
        ))}
      </select>

      <div className="flex flex-wrap gap-1.5">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setParam("status", opt.value)}
            className={`rounded-full px-3 py-1.5 text-sm transition ${
              currentStatus === opt.value
                ? "bg-accent text-white"
                : "bg-surface text-text-muted hover:text-text"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5 sm:ml-auto">
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setParam("sort", opt.value)}
            className={`rounded-full px-3 py-1.5 text-sm transition ${
              currentSort === opt.value
                ? "bg-accent text-white"
                : "bg-surface text-text-muted hover:text-text"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
