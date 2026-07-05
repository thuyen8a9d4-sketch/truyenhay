import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getNotifications } from "@/lib/queries";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Thông báo | VanThu",
};

export default async function NotificationsPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const supabase = await createClient();
  const notifications = await getNotifications(supabase, profile.id, 100);

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-text">Thông báo</h1>

      {notifications.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border py-16 text-center text-text-muted">
          Bạn chưa có thông báo nào.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {notifications.map((n) => (
            <Link
              key={n.id}
              href={n.link ?? "#"}
              className={`rounded-xl border border-border p-4 hover:bg-surface-hover ${
                n.is_read ? "bg-surface/50" : "bg-surface"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-text">{n.title}</span>
                {!n.is_read && <span className="h-2 w-2 shrink-0 rounded-full bg-accent" />}
              </div>
              {n.body && <p className="mt-1 text-sm text-text-muted">{n.body}</p>}
              <p className="mt-2 text-xs text-text-muted">{formatDate(n.created_at)}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
