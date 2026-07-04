"use client";

import { useActionState, useState, useTransition } from "react";
import { verifySignupOtp, resendSignupOtp, type OtpState } from "@/lib/actions/auth";

export function VerifyOtpForm({ email }: { email: string }) {
  const [state, formAction, pending] = useActionState<OtpState, FormData>(
    verifySignupOtp,
    undefined,
  );
  const [resendPending, startResend] = useTransition();
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  function handleResend() {
    setResendMessage(null);
    startResend(async () => {
      const result = await resendSignupOtp(email);
      setResendMessage(result.sent ? "Đã gửi lại mã OTP." : (result.error ?? "Có lỗi xảy ra."));
    });
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="email" value={email} />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="token" className="text-sm text-text-muted">
          Mã OTP (6 số)
        </label>
        <input
          id="token"
          name="token"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          required
          className="rounded-lg border border-border bg-surface px-3.5 py-2.5 text-center text-lg tracking-[0.5em] text-text outline-none focus:border-accent"
          placeholder="------"
        />
      </div>

      {state?.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
      {resendMessage && <p className="text-sm text-text-muted">{resendMessage}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-accent px-4 py-2.5 font-medium text-white transition hover:bg-accent-hover disabled:opacity-60"
      >
        {pending ? "Đang xác thực..." : "Xác thực"}
      </button>

      <button
        type="button"
        onClick={handleResend}
        disabled={resendPending}
        className="text-sm text-accent hover:underline disabled:opacity-60"
      >
        {resendPending ? "Đang gửi..." : "Gửi lại mã"}
      </button>
    </form>
  );
}
