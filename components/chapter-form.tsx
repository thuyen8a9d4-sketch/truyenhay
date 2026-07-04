"use client";

import { useActionState } from "react";
import type { ChapterFormState } from "@/lib/actions/chapters";

export function ChapterForm({
  action,
  initial,
  submitLabel,
}: {
  action: (state: ChapterFormState, formData: FormData) => Promise<ChapterFormState>;
  initial?: { chapterNumber: number; title: string; content: string };
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState<ChapterFormState, FormData>(
    action,
    undefined,
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="chapterNumber" className="text-sm text-text-muted">
          Số chương
        </label>
        <input
          id="chapterNumber"
          type="number"
          name="chapterNumber"
          min={1}
          required
          defaultValue={initial?.chapterNumber}
          className="w-32 rounded-lg border border-border bg-surface px-3.5 py-2.5 text-text outline-none focus:border-accent"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="title" className="text-sm text-text-muted">
          Tiêu đề chương
        </label>
        <input
          id="title"
          name="title"
          required
          defaultValue={initial?.title}
          className="rounded-lg border border-border bg-surface px-3.5 py-2.5 text-text outline-none focus:border-accent"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="content" className="text-sm text-text-muted">
          Nội dung
        </label>
        <textarea
          id="content"
          name="content"
          rows={16}
          required
          defaultValue={initial?.content}
          placeholder="Mỗi dòng trống sẽ tách thành một đoạn văn khi hiển thị."
          className="resize-y rounded-lg border border-border bg-surface px-3.5 py-2.5 text-text outline-none focus:border-accent"
        />
      </div>

      {state?.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded-lg bg-accent px-5 py-2.5 font-medium text-white transition hover:bg-accent-hover disabled:opacity-60"
      >
        {pending ? "Đang lưu..." : submitLabel}
      </button>
    </form>
  );
}
