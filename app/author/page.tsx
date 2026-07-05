import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getAuthorOverview, getAuthorReleaseStats, getNotifications } from "@/lib/queries";
import { formatDate, formatNumber } from "@/lib/utils";
import { StatCard } from "@/components/dashboard/stat-card";
import { BarChart } from "@/components/dashboard/bar-chart";
import { NovelPicker } from "@/components/dashboard/novel-picker";

export const metadata: Metadata = {
  title: "Tổng quan tác giả | VanThu",
};

export default async function AuthorDashboardPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const supabase = await createClient();
  const [overview, releaseStats, notifications, { data: wallet }] = await Promise.all([
    getAuthorOverview(supabase, profile.id),
    getAuthorReleaseStats(supabase, profile.id),
    getNotifications(supabase, profile.id, 5),
    supabase
      .from("wallets")
      .select("author_earned_coins")
      .eq("user_id", profile.id)
      .maybeSingle(),
  ]);

  const viewsDelta = overview.totalViewsToday - overview.totalViewsYesterday;

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 lg:px-8">
      <h1 className="mb-5 text-2xl font-bold text-text">Tổng quan</h1>

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Lượt xem hôm nay"
          value={formatNumber(overview.totalViewsToday)}
          delta={viewsDelta}
          tone="accent"
        />
        <StatCard
          label="Lượt sưu tầm"
          value={formatNumber(overview.totalLibraryCount)}
          tone="violet"
        />
        <StatCard
          label="Tổng doanh thu"
          value={`${formatNumber(overview.totalRevenueVnd)}đ`}
          tone="emerald"
        />
        <StatCard
          label="Xu khả dụng"
          value={formatNumber(wallet?.author_earned_coins ?? 0)}
          tone="amber"
        />
      </div>

      <div className="mb-6">
        <NovelPicker novels={overview.novels} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-surface p-5">
          <h2 className="mb-4 text-sm font-semibold text-text">
            Thống kê phát hành — chương đăng theo tháng
          </h2>
          <BarChart data={releaseStats} valueSuffix=" chương" />
        </section>

        <section className="rounded-xl border border-border bg-surface p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-text">Thông báo</h2>
            <Link href="/notifications" className="text-xs text-accent hover:underline">
              Xem tất cả
            </Link>
          </div>
          {notifications.length === 0 ? (
            <p className="py-8 text-center text-sm text-text-muted">Chưa có thông báo nào.</p>
          ) : (
            <ul className="divide-y divide-border">
              {notifications.map((n) => (
                <li key={n.id}>
                  <Link
                    href={n.link ?? "/notifications"}
                    className="flex items-center justify-between gap-2 py-2.5 hover:bg-surface-hover"
                  >
                    <span
                      className={`truncate text-sm ${n.is_read ? "text-text-muted" : "font-medium text-text"}`}
                    >
                      {n.title}
                    </span>
                    <span className="shrink-0 text-xs text-text-muted">
                      {formatDate(n.created_at)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
