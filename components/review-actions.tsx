"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export type ReviewAction = {
  label: string;
  danger?: boolean;
  askReason?: boolean;
  run: (reason: string | null) => Promise<{ success: boolean; message: string }>;
};

export function ReviewActions({ actions }: { actions: ReviewAction[] }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function handle(action: ReviewAction) {
    let reason: string | null = null;
    if (action.askReason) {
      reason = window.prompt("Lý do (không bắt buộc):");
      if (reason === null) return;
    }
    setError(null);
    startTransition(async () => {
      const result = await action.run(reason);
      if (result.success) router.refresh();
      else setError(result.message);
    });
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex flex-wrap justify-end gap-2">
        {actions.map((a) => (
          <button
            key={a.label}
            onClick={() => handle(a)}
            disabled={pending}
            className={
              a.danger
                ? "rounded-lg border border-red-500/40 px-3 py-1.5 text-sm text-red-600 hover:bg-red-500/10 disabled:opacity-60 dark:text-red-400"
                : "rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-60"
            }
          >
            {a.label}
          </button>
        ))}
      </div>
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
