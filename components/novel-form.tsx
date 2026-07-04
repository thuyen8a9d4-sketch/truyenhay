"use client";

import { useActionState } from "react";
import type { Genre, NovelStatus } from "@/lib/database.types";
import type { NovelFormState } from "@/lib/actions/novels";

export function NovelForm({
  action,
  genres,
  initial,
  submitLabel,
}: {
  action: (state: NovelFormState, formData: FormData) => Promise<NovelFormState>;
  genres: Genre[];
  initial?: {
    title: string;
    synopsis: string;
    status: NovelStatus;
    genreIds: number[];
    coverUrl: string | null;
  };
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState<NovelFormState, FormData>(
    action,
    undefined,
  );

  return (
    <form action={formAction} encType="multipart/form-data" className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="title" className="text-sm text-text-muted">
          Tên truyện
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
        <label htmlFor="synopsis" className="text-sm text-text-muted">
          Mô tả
        </label>
        <textarea
          id="synopsis"
          name="synopsis"
          rows={5}
          defaultValue={initial?.synopsis}
          className="resize-none rounded-lg border border-border bg-surface px-3.5 py-2.5 text-text outline-none focus:border-accent"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="status" className="text-sm text-text-muted">
          Tình trạng
        </label>
        <select
          id="status"
          name="status"
          defaultValue={initial?.status ?? "ongoing"}
          className="w-fit rounded-lg border border-border bg-surface px-3.5 py-2.5 text-text outline-none focus:border-accent"
        >
          <option value="ongoing">Đang ra</option>
          <option value="completed">Hoàn thành</option>
          <option value="hiatus">Tạm ngưng</option>
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-sm text-text-muted">Thể loại</span>
        <div className="flex flex-wrap gap-2">
          {genres.map((g) => (
            <label
              key={g.id}
              className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-sm text-text"
            >
              <input
                type="checkbox"
                name="genres"
                value={g.id}
                defaultChecked={initial?.genreIds?.includes(g.id)}
                className="accent-[var(--accent)]"
              />
              {g.name}
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="cover" className="text-sm text-text-muted">
          Ảnh bìa {initial?.coverUrl ? "(để trống nếu giữ ảnh cũ)" : ""}
        </label>
        <input
          id="cover"
          type="file"
          name="cover"
          accept="image/*"
          className="text-sm text-text file:mr-3 file:rounded-lg file:border-0 file:bg-surface-hover file:px-3 file:py-1.5 file:text-text"
        />
      </div>

      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}
      {state?.success && <p className="text-sm text-green-400">Đã lưu thay đổi.</p>}

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
