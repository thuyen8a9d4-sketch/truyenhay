"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { signOut } from "@/lib/actions/auth";
import type { Profile } from "@/lib/database.types";

export function NavUserMenu({
  profile,
  coinBalance,
}: {
  profile: Profile;
  coinBalance: number;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const initial = (profile.display_name ?? profile.username)
    .charAt(0)
    .toUpperCase();

  return (
    <div ref={ref} className="relative flex items-center gap-2">
      <Link
        href="/topup"
        className="hidden items-center gap-1 rounded-full border border-border bg-surface px-3 py-1.5 text-sm text-text hover:bg-surface-hover sm:flex"
      >
        🪙 {coinBalance}
      </Link>

      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-border bg-surface px-2 py-1.5 pr-3 text-sm text-text hover:bg-surface-hover"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-sm font-semibold text-white">
          {initial}
        </span>
        <span className="max-w-[120px] truncate">
          {profile.display_name ?? profile.username}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-20 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-surface shadow-xl">
          <Link
            href="/topup"
            onClick={() => setOpen(false)}
            className="flex items-center justify-between px-4 py-2.5 text-sm text-text hover:bg-surface-hover sm:hidden"
          >
            <span>Ví của tôi</span>
            <span>🪙 {coinBalance}</span>
          </Link>
          <Link
            href="/library"
            onClick={() => setOpen(false)}
            className="block px-4 py-2.5 text-sm text-text hover:bg-surface-hover"
          >
            Thư viện của tôi
          </Link>
          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="block px-4 py-2.5 text-sm text-text hover:bg-surface-hover"
          >
            Hồ sơ
          </Link>
          <Link
            href="/topup"
            onClick={() => setOpen(false)}
            className="hidden px-4 py-2.5 text-sm text-text hover:bg-surface-hover sm:block"
          >
            Nạp xu
          </Link>
          {profile.is_author && (
            <>
              <Link
                href="/author"
                onClick={() => setOpen(false)}
                className="block px-4 py-2.5 text-sm text-text hover:bg-surface-hover"
              >
                Trang tác giả
              </Link>
              <Link
                href="/author/income"
                onClick={() => setOpen(false)}
                className="block px-4 py-2.5 text-sm text-text hover:bg-surface-hover"
              >
                Sao kê thu nhập
              </Link>
            </>
          )}
          {profile.is_admin && (
            <>
              <Link
                href="/admin/coins"
                onClick={() => setOpen(false)}
                className="block px-4 py-2.5 text-sm text-text hover:bg-surface-hover"
              >
                Quản trị — Cộng xu
              </Link>
              <Link
                href="/admin/income"
                onClick={() => setOpen(false)}
                className="block px-4 py-2.5 text-sm text-text hover:bg-surface-hover"
              >
                Quản trị — Doanh thu
              </Link>
            </>
          )}
          <form action={signOut}>
            <button
              type="submit"
              className="block w-full border-t border-border px-4 py-2.5 text-left text-sm text-red-600 hover:bg-surface-hover dark:text-red-400"
            >
              Đăng xuất
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
