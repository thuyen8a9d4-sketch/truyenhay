import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getIncomeStatement, getIncomeByAuthor } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Sao kê thu nhập nền tảng | VanThu",
};

function formatVnd(n: number) {
  return Math.round(n).toLocaleString("vi-VN") + "đ";
}

export default async function AdminIncomePage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (!profile.is_admin) redirect("/");

  const supabase = await createClient();
  const [summary, byAuthor] = await Promise.all([
    getIncomeStatement(supabase),
    getIncomeByAuthor(supabase),
  ]);

  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold text-text">Sao kê thu nhập nền tảng</h1>
      <p className="mb-6 text-sm text-text-muted">
        Toàn bộ doanh thu từ hệ thống xu (chủ web nhận 40%, tác giả nhận 60% mỗi giao dịch). Dùng số
        liệu này để tự khai thuế/kê khai doanh thu — hệ thống{" "}
        <strong>không tự động nộp thuế thay bạn</strong>.
      </p>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <SummaryCard label="Tổng giao dịch" value={summary.totalTransactions.toString()} />
        <SummaryCard label="Tổng doanh thu" value={formatVnd(summary.totalValueVnd)} />
        <SummaryCard label="Tác giả nhận (60%)" value={formatVnd(summary.totalAuthorEarningVnd)} />
        <SummaryCard
          label="Nền tảng nhận (40%)"
          value={formatVnd(summary.totalPlatformEarningVnd)}
          highlight
        />
      </div>

      <h2 className="mb-3 font-semibold text-text">Theo tháng</h2>
      <div className="mb-8 overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr className="border-b border-border bg-surface text-left text-text-muted">
              <th className="px-4 py-2.5 font-medium">Tháng</th>
              <th className="px-4 py-2.5 font-medium">Giao dịch</th>
              <th className="px-4 py-2.5 font-medium">Doanh thu</th>
              <th className="px-4 py-2.5 font-medium">Tác giả</th>
              <th className="px-4 py-2.5 font-medium">Nền tảng</th>
            </tr>
          </thead>
          <tbody>
            {summary.byMonth.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-text-muted">
                  Chưa có giao dịch nào.
                </td>
              </tr>
            ) : (
              summary.byMonth.map((m) => (
                <tr key={m.month} className="border-b border-border last:border-none">
                  <td className="px-4 py-2.5 text-text">{m.month}</td>
                  <td className="px-4 py-2.5 text-text-muted">{m.transactions}</td>
                  <td className="px-4 py-2.5 text-text-muted">{formatVnd(m.valueVnd)}</td>
                  <td className="px-4 py-2.5 text-text-muted">{formatVnd(m.authorEarningVnd)}</td>
                  <td className="px-4 py-2.5 font-medium text-accent">
                    {formatVnd(m.platformEarningVnd)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <h2 className="mb-3 font-semibold text-text">Theo tác giả</h2>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr className="border-b border-border bg-surface text-left text-text-muted">
              <th className="px-4 py-2.5 font-medium">Tác giả</th>
              <th className="px-4 py-2.5 font-medium">Giao dịch</th>
              <th className="px-4 py-2.5 font-medium">Doanh thu</th>
              <th className="px-4 py-2.5 font-medium">Thu nhập tác giả</th>
            </tr>
          </thead>
          <tbody>
            {byAuthor.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-text-muted">
                  Chưa có dữ liệu.
                </td>
              </tr>
            ) : (
              byAuthor.map((a) => (
                <tr key={a.authorId} className="border-b border-border last:border-none">
                  <td className="px-4 py-2.5 text-text">{a.authorName}</td>
                  <td className="px-4 py-2.5 text-text-muted">{a.transactions}</td>
                  <td className="px-4 py-2.5 text-text-muted">{formatVnd(a.totalValueVnd)}</td>
                  <td className="px-4 py-2.5 font-medium text-accent">
                    {formatVnd(a.authorEarningVnd)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <p className="text-xs text-text-muted">{label}</p>
      <p className={`mt-1 text-lg font-bold ${highlight ? "text-accent" : "text-text"}`}>{value}</p>
    </div>
  );
}
