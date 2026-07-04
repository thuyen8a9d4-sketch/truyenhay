"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { signOut } from "@/lib/actions/auth";
import type { Profile } from "@/lib/database.types";

export function NavUserMenu({ profile }: { profile: Profile }) {
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
    <div ref={ref} className="relative">
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
          {profile.is_author && (
            <Link
              href="/author"
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-sm text-text hover:bg-surface-hover"
            >
              Trang tác giả
            </Link>
          )}
          <form action={signOut}>
            <button
              type="submit"
              className="block w-full border-t border-border px-4 py-2.5 text-left text-sm text-red-400 hover:bg-surface-hover"
            >
              Đăng xuất
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
