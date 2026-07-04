"use client";

import { useActionState, useEffect, useRef } from "react";
import { postComment, type CommentState } from "@/lib/actions/comments";

export function CommentForm({
  chapterId,
  revalidateTarget,
}: {
  chapterId: string;
  revalidateTarget: string;
}) {
  const action = postComment.bind(null, chapterId, revalidateTarget);
  const [state, formAction, pending] = useActionState<CommentState, FormData>(
    action,
    undefined,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending && !state?.error) {
      formRef.current?.reset();
    }
    wasPending.current = pending;
  }, [pending, state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-2">
      <textarea
        name="content"
        rows={3}
        placeholder="Viết bình luận về chương này..."
        className="resize-none rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text outline-none focus:border-accent"
      />
      {state?.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-hover disabled:opacity-50"
      >
        {pending ? "Đang gửi..." : "Gửi bình luận"}
      </button>
    </form>
  );
}
