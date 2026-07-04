"use client";

import { useRouter } from "next/navigation";

export function ChapterJump({
  novelSlug,
  chapters,
  currentNumber,
}: {
  novelSlug: string;
  chapters: { chapter_number: number; title: string }[];
  currentNumber: number;
}) {
  const router = useRouter();

  return (
    <select
      value={currentNumber}
      onChange={(e) => router.push(`/novel/${novelSlug}/${e.target.value}`)}
      className="max-w-[220px] rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-accent"
    >
      {chapters.map((c) => (
        <option key={c.chapter_number} value={c.chapter_number}>
          Chương {c.chapter_number}: {c.title}
        </option>
      ))}
    </select>
  );
}
