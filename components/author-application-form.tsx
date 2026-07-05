"use client";

import { useActionState } from "react";
import { applyForAuthor, type ApplyState } from "@/lib/actions/author-applications";

export function AuthorApplicationForm() {
  const [state, action, pending] = useActionState<ApplyState, FormData>(
    applyForAuthor,
    undefined,
  );

  if (state?.success) {
    return (
      <p className="rounded-xl border border-border bg-surface p-6 text-center text-text-muted">
        Đã gửi đơn thành công. Vui lòng chờ quản trị viên duyệt.
      </p>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="message" className="text-sm text-text-muted">
          Vì sao bạn muốn trở thành tác giả?
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          placeholder="Giới thiệu ngắn về bạn và dự định đăng truyện..."
          className="resize-none rounded-lg border border-border bg-surface px-3.5 py-2.5 text-text outline-none focus:border-accent"
        />
      </div>

      {state?.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded-lg bg-accent px-5 py-2.5 font-medium text-white transition hover:bg-accent-hover disabled:opacity-60"
      >
        {pending ? "Đang gửi..." : "Gửi đơn"}
      </button>
    </form>
  );
}
