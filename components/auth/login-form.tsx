"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signIn, type AuthState } from "@/lib/actions/auth";

const initialState: AuthState = undefined;

export function LoginForm() {
  const [state, action, pending] = useActionState(signIn, initialState);

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm text-text-muted">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="rounded-lg border border-border bg-surface px-3.5 py-2.5 text-text outline-none focus:border-accent"
          placeholder="ban@email.com"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm text-text-muted">
          Mật khẩu
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="rounded-lg border border-border bg-surface px-3.5 py-2.5 text-text outline-none focus:border-accent"
          placeholder="••••••••"
        />
      </div>

      {state?.error && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-lg bg-accent px-4 py-2.5 font-medium text-white transition hover:bg-accent-hover disabled:opacity-60"
      >
        {pending ? "Đang đăng nhập..." : "Đăng nhập"}
      </button>

      <p className="text-center text-sm text-text-muted">
        Chưa có tài khoản?{" "}
        <Link href="/signup" className="text-accent hover:underline">
          Đăng ký ngay
        </Link>
      </p>
    </form>
  );
}
