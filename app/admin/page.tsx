import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getAdminOverview } from "@/lib/queries";
import { formatNumber } from "@/lib/utils";
import { StatCard } from "@/components/dashboard/stat-card";

export const metadata: Metadata = {
  title: "Tổng quan quản trị | VanThu",
};

function PendingCard({
  count,
  label,
  href,
  icon,
}: {
  count: number;
  label: string;
  href: string;
  icon: string;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-4 rounded-xl border p-4 transition hover:bg-surface-hover ${
        count > 0 ? "border-amber-500/40 bg-amber-500/5" : "border-border bg-surface"
      }`}
    >
      <span className="text-2xl" aria-hidden>
        {icon}
      </span>
      <div>
        <p className="text-xl font-semibold text-text">{count}</p>
        <p className="text-sm text-text-muted">{label}</p>
      </div>
      <span className="ml-auto text-text-muted" aria-hidden>
        →
      </span>
    </Link>
  );
}

export default async function AdminDashboardPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (!profile.is_admin) redirect("/");

  const supabase = await createClient();
  const overview = await getAdminOverview(supabase);

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 lg:px-8">
      <h1 className="mb-5 text-2xl font-bold text-text">Tổng quan hệ thống</h1>

      <h2 className="mb-3 text-sm font-semibold text-text">Việc cần xử lý</h2>
      <div className="mb-8 grid gap-3 sm:grid-cols-3">
        <PendingCard
          count={overview.pendingApplications}
          label="Đơn tác giả chờ duyệt"
          href="/admin/authors"
          icon="✅"
        />
        <PendingCard
          count={overview.pendingNovels}
          label="Truyện chờ duyệt"
          href="/admin/novels"
          icon="📖"
        />
        <PendingCard
          count={overview.pendingWithdrawals}
          label="Yêu cầu rút tiền chờ"
          href="/admin/withdrawals"
          icon="🏦"
        />
      </div>

      <h2 className="mb-3 text-sm font-semibold text-text">Số liệu nền tảng</h2>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatCard label="Người dùng" value={formatNumber(overview.totalUsers)} tone="accent" />
        <StatCard label="Tác giả" value={formatNumber(overview.totalAuthors)} tone="violet" />
        <StatCard label="Truyện" value={formatNumber(overview.totalNovels)} tone="cyan" />
        <StatCard
          label="Lượt xem hôm nay"
          value={formatNumber(overview.viewsToday)}
          tone="rose"
        />
        <StatCard
          label="Doanh thu tháng này"
          value={`${formatNumber(overview.revenueThisMonthVnd)}đ`}
          tone="emerald"
        />
        <StatCard
          label="Tổng doanh thu"
          value={`${formatNumber(overview.totalRevenueVnd)}đ`}
          tone="amber"
        />
      </div>
    </div>
  );
}
