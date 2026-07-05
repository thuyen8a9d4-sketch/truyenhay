"use client";

import { useActionState, useState } from "react";
import {
  CHAPTER_PRICE_CAP_ESTABLISHED,
  CHAPTER_PRICE_CAP_NEW,
  CHAPTER_PRICE_CAP_VIEWS_THRESHOLD,
} from "@/lib/database.types";
import type { ChapterFormState } from "@/lib/actions/chapters";

export function ChapterForm({
  action,
  initial,
  submitLabel,
  novelViews = 0,
}: {
  action: (state: ChapterFormState, formData: FormData) => Promise<ChapterFormState>;
  initial?: {
    chapterNumber: number;
    title: string;
    content: string;
    isLocked?: boolean;
    priceCoins?: number;
  };
  submitLabel: string;
  novelViews?: number;
}) {
  const [state, formAction, pending] = useActionState<ChapterFormState, FormData>(
    action,
    undefined,
  );
  const [isLocked, setIsLocked] = useState(initial?.isLocked ?? false);
  const priceCap =
    novelViews > CHAPTER_PRICE_CAP_VIEWS_THRESHOLD
      ? CHAPTER_PRICE_CAP_ESTABLISHED
      : CHAPTER_PRICE_CAP_NEW;

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

      <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            name="isLocked"
            checked={isLocked}
            onChange={(e) => setIsLocked(e.target.checked)}
            className="h-4 w-4 accent-[var(--accent)]"
          />
          <span className="text-sm text-text">
            🔒 Khoá chương này — độc giả cần trả xu để đọc
          </span>
        </label>

        {isLocked && (
          <div className="flex flex-col gap-1.5 pl-7">
            <label htmlFor="priceCoins" className="text-sm text-text-muted">
              Giá mở khoá (xu)
            </label>
            <input
              id="priceCoins"
              type="number"
              name="priceCoins"
              min={1}
              max={priceCap}
              defaultValue={initial?.priceCoins || Math.min(10, priceCap)}
              className="w-32 rounded-lg border border-border bg-bg px-3.5 py-2.5 text-text outline-none focus:border-accent"
            />
            <p className="text-xs text-text-muted">
              Tối đa {priceCap} xu/chương ở mức truyện hiện tại (
              {novelViews > CHAPTER_PRICE_CAP_VIEWS_THRESHOLD
                ? "đã đạt trên 10.000 lượt xem"
                : "chưa đạt 10.000 lượt xem"}
              ). Bạn nhận 60% giá trị, nền tảng giữ 40%. Xem chi tiết ở trang Sao kê thu nhập.
            </p>
          </div>
        )}
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
