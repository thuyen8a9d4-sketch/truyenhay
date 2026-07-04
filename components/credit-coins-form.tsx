"use client";

import { useActionState } from "react";
import { creditCoins, type CreditCoinsState } from "@/lib/actions/coins";

export function CreditCoinsForm() {
  const [state, formAction, pending] = useActionState<CreditCoinsState, FormData>(
    creditCoins,
    undefined,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="usernameOrEmail" className="text-sm text-text-muted">
          Username người nhận
        </label>
        <input
          id="usernameOrEmail"
          name="usernameOrEmail"
          required
          className="rounded-lg border border-border bg-surface px-3.5 py-2.5 text-text outline-none focus:border-accent"
          placeholder="vd: nguyenvana_ab12cd"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="coins" className="text-sm text-text-muted">
            Số xu cộng
          </label>
          <input
            id="coins"
            type="number"
            name="coins"
            min={1}
            required
            className="rounded-lg border border-border bg-surface px-3.5 py-2.5 text-text outline-none focus:border-accent"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="amountVnd" className="text-sm text-text-muted">
            Số tiền đã nhận (VNĐ)
          </label>
          <input
            id="amountVnd"
            type="number"
            name="amountVnd"
            min={0}
            required
            className="rounded-lg border border-border bg-surface px-3.5 py-2.5 text-text outline-none focus:border-accent"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="note" className="text-sm text-text-muted">
          Ghi chú (mã giao dịch...)
        </label>
        <input
          id="note"
          name="note"
          className="rounded-lg border border-border bg-surface px-3.5 py-2.5 text-text outline-none focus:border-accent"
        />
      </div>

      {state?.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
      {state?.success && (
        <p className="text-sm text-green-600 dark:text-green-400">Đã cộng xu thành công.</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded-lg bg-accent px-5 py-2.5 font-medium text-white transition hover:bg-accent-hover disabled:opacity-60"
      >
        {pending ? "Đang xử lý..." : "Cộng xu"}
      </button>
    </form>
  );
}
