import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import { NavSearch } from "@/components/nav-search";
import { NavGenreMenu } from "@/components/nav-genre-menu";
import { NavUserMenu } from "@/components/nav-user-menu";

export async function Navbar() {
  const supabase = await createClient();
  const [{ data: genres }, profile] = await Promise.all([
    supabase.from("genres").select("*").order("name"),
    getCurrentProfile(),
  ]);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-bg/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
        <Link href="/" className="shrink-0 text-xl font-bold text-accent">
          TruyệnHay
        </Link>

        <nav className="flex items-center gap-1">
          <Link
            href="/browse"
            className="rounded-lg px-3 py-2 text-sm text-text hover:bg-surface-hover"
          >
            Duyệt truyện
          </Link>
          <NavGenreMenu genres={genres ?? []} />
          <Link
            href="/rankings"
            className="rounded-lg px-3 py-2 text-sm text-text hover:bg-surface-hover"
          >
            Xếp hạng
          </Link>
        </nav>

        <NavSearch />

        <div className="ml-auto flex shrink-0 items-center gap-2">
          {profile ? (
            <NavUserMenu profile={profile} />
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg px-3 py-2 text-sm text-text hover:bg-surface-hover"
              >
                Đăng nhập
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-accent px-3.5 py-2 text-sm font-medium text-white hover:bg-accent-hover"
              >
                Đăng ký
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
