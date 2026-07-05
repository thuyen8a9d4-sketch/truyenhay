import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getAuthorDashboardStats, listNovels } from "@/lib/queries";
import { formatNumber } from "@/lib/utils";
import { StatusBadge } from "@/components/status-badge";
import { ApprovalBadge } from "@/components/approval-badge";

export const metadata: Metadata = {
  title: "Trang tác giả | VanThu",
};

export default async function AuthorDashboardPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  if (!profile.is_author) {
    return (
      <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-text">Trở thành tác giả</h1>
        <p className="mt-2 text-text-muted">
          Gửi đơn xin làm tác giả để được quản trị viên duyệt và bắt đầu đăng truyện của bạn.
        </p>
        <Link
          href="/author/apply"
          className="mt-5 inline-block rounded-lg bg-accent px-5 py-2.5 font-medium text-white hover:bg-accent-hover"
        >
          Gửi đơn xin làm tác giả
        </Link>
      </div>
    );
  }

  const supabase = await createClient();
  const [{ novels }, stats] = await Promise.all([
    listNovels(supabase, {
      authorId: profile.id,
      approvalStatus: "all",
      sort: "updated",
      pageSize: 100,
    }),
    getAuthorDashboardStats(supabase, profile.id),
  ]);

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text">Truyện của tôi</h1>
        <Link
          href="/author/new"
          className="rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-hover"
        >
          + Đăng truyện mới
        </Link>
      </div>

      {novels.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border py-16 text-center text-text-muted">
          Bạn chưa có truyện nào. Bấm &quot;+ Đăng truyện mới&quot; để bắt đầu.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {novels.map((novel) => {
            const novelStats = stats.get(novel.id);
            return (
            <div
              key={novel.id}
              className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-surface p-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-text">{novel.title}</span>
                  <StatusBadge status={novel.status} />
                  {novel.approval_status !== "approved" && (
                    <ApprovalBadge status={novel.approval_status} />
                  )}
                </div>
                <p className="mt-1 text-sm text-text-muted">
                  {novel.stats.chapter_count} chương · {formatNumber(novel.views)} lượt xem ·{" "}
                  {novel.stats.avg_rating}/5 sao · {novelStats?.commentCount ?? 0} bình luận ·{" "}
                  {formatNumber(novelStats?.revenueVnd ?? 0)}đ doanh thu
                </p>
              </div>
              <Link
                href={`/author/${novel.id}/chapters`}
                className="rounded-lg border border-border px-3 py-2 text-sm text-text hover:bg-surface-hover"
              >
                Quản lý chương
              </Link>
              <Link
                href={`/author/${novel.id}/edit`}
                className="rounded-lg border border-border px-3 py-2 text-sm text-text hover:bg-surface-hover"
              >
                Sửa
              </Link>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
