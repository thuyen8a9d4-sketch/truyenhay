"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import Link from "next/link";
import { markNotificationRead, markAllNotificationsRead } from "@/lib/actions/notifications";
import { formatDate } from "@/lib/utils";
import type { Notification } from "@/lib/database.types";

type NotificationItem = Omit<Notification, "user_id">;

export function NotificationBell({
  notifications,
  unreadCount,
  userId,
}: {
  notifications: NotificationItem[];
  unreadCount: number;
  userId: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function handleItemClick(n: NotificationItem) {
    if (!n.is_read) startTransition(() => markNotificationRead(n.id));
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-sm hover:bg-surface-hover"
        aria-label="Thông báo"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-20 mt-2 w-80 overflow-hidden rounded-xl border border-border bg-surface shadow-xl">
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <span className="text-sm font-semibold text-text">Thông báo</span>
            {unreadCount > 0 && (
              <button
                onClick={() => startTransition(() => markAllNotificationsRead(userId))}
                className="text-xs text-accent hover:underline"
              >
                Đánh dấu đã đọc hết
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-text-muted">
                Chưa có thông báo nào.
              </p>
            ) : (
              notifications.map((n) => (
                <Link
                  key={n.id}
                  href={n.link ?? "/notifications"}
                  onClick={() => handleItemClick(n)}
                  className={`block border-b border-border px-4 py-2.5 text-sm hover:bg-surface-hover ${
                    n.is_read ? "text-text-muted" : "text-text"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">{n.title}</span>
                    {!n.is_read && <span className="h-2 w-2 shrink-0 rounded-full bg-accent" />}
                  </div>
                  {n.body && <p className="mt-0.5 line-clamp-2 text-xs">{n.body}</p>}
                  <p className="mt-1 text-[11px] text-text-muted">{formatDate(n.created_at)}</p>
                </Link>
              ))
            )}
          </div>
          <Link
            href="/notifications"
            onClick={() => setOpen(false)}
            className="block px-4 py-2.5 text-center text-sm text-accent hover:bg-surface-hover"
          >
            Xem tất cả
          </Link>
        </div>
      )}
    </div>
  );
}
