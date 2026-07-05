"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type SidebarItem = { href: string; label: string; icon: string };

export function DashboardSidebar({
  title,
  items,
  switchLinks,
  userName,
}: {
  title: string;
  items: SidebarItem[];
  switchLinks: SidebarItem[];
  userName: string;
}) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/author" || href === "/admin") return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  }

  const initial = userName.charAt(0).toUpperCase();

  return (
    <aside className="flex shrink-0 flex-row items-center gap-1 overflow-x-auto border-b border-border bg-surface px-3 py-2 lg:sticky lg:top-0 lg:h-screen lg:w-60 lg:flex-col lg:items-stretch lg:gap-0 lg:overflow-y-auto lg:border-b-0 lg:border-r lg:px-4 lg:py-5">
      <Link
        href="/"
        className="gradient-accent hidden shrink-0 bg-clip-text px-2 pb-1 text-xl font-extrabold text-transparent lg:block"
      >
        VanThu
      </Link>
      <p className="hidden px-2 pb-4 text-xs text-text-muted lg:block">{title}</p>

      <nav className="flex flex-row gap-1 lg:flex-col">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm transition lg:py-2.5 ${
              isActive(item.href)
                ? "bg-accent/12 font-medium text-accent"
                : "text-text hover:bg-surface-hover"
            }`}
          >
            <span aria-hidden>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="ml-auto flex shrink-0 flex-row items-center gap-1 lg:ml-0 lg:mt-auto lg:flex-col lg:items-stretch lg:gap-1.5 lg:pt-4">
        <div className="hidden items-center gap-2.5 border-t border-border px-2 pb-1 pt-4 lg:flex">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-sm font-semibold text-white">
            {initial}
          </span>
          <span className="truncate text-sm font-medium text-text">{userName}</span>
        </div>
        {switchLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-lg border border-border px-3 py-2 text-sm text-text-muted transition hover:bg-surface-hover hover:text-text"
          >
            <span aria-hidden>{link.icon}</span>
            {link.label}
          </Link>
        ))}
      </div>
    </aside>
  );
}
