"use client";

import { useActionState } from "react";
import { requestWithdrawal, type WithdrawalFormState } from "@/lib/actions/withdrawals";

export function WithdrawalForm({ maxCoins }: { maxCoins: number }) {
  const [state, action, pending] = useActionState<WithdrawalFormState, FormData>(
    requestWithdrawal,
    undefined,
  );

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="coins" className="text-sm text-text-muted">
          Số xu muốn rút (khả dụng: {maxCoins} xu)
        </label>
        <input
          id="coins"
          type="number"
          name="coins"
          min={1}
          max={maxCoins}
          required
          className="w-40 rounded-lg border border-border bg-surface px-3.5 py-2.5 text-text outline-none focus:border-accent"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="bankName" className="text-sm text-text-muted">
          Ngân hàng
        </label>
        <input
          id="bankName"
          name="bankName"
          required
          className="rounded-lg border border-border bg-surface px-3.5 py-2.5 text-text outline-none focus:border-accent"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="bankAccountNumber" className="text-sm text-text-muted">
          Số tài khoản
        </label>
        <input
          id="bankAccountNumber"
          name="bankAccountNumber"
          required
          className="rounded-lg border border-border bg-surface px-3.5 py-2.5 text-text outline-none focus:border-accent"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="bankAccountHolder" className="text-sm text-text-muted">
          Chủ tài khoản
        </label>
        <input
          id="bankAccountHolder"
          name="bankAccountHolder"
          required
          className="rounded-lg border border-border bg-surface px-3.5 py-2.5 text-text outline-none focus:border-accent"
        />
      </div>

      {state?.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
      {state?.success && (
        <p className="text-sm text-green-600 dark:text-green-400">Đã gửi yêu cầu rút tiền.</p>
      )}

      <button
        type="submit"
        disabled={pending || maxCoins < 1}
        className="w-fit rounded-lg bg-accent px-5 py-2.5 font-medium text-white transition hover:bg-accent-hover disabled:opacity-60"
      >
        {pending ? "Đang gửi..." : "Gửi yêu cầu rút tiền"}
      </button>
    </form>
  );
}
