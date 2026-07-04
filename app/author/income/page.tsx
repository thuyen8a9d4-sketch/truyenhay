import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getIncomeStatement } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Sao kê thu nhập | VanThu",
};

function formatVnd(n: number) {
  return Math.round(n).toLocaleString("vi-VN") + "đ";
}

export default async function AuthorIncomePage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (!profile.is_author) redirect("/author");

  const supabase = await createClient();
  const summary = await getIncomeStatement(supabase);

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold text-text">Sao kê thu nhập</h1>
      <p className="mb-6 text-sm text-text-muted">
        Số liệu doanh thu từ các chương khoá đã bán (bạn nhận 60% giá trị mỗi giao dịch). Dùng số
        liệu này để tự khai thuế thu nhập cá nhân theo quy định — hệ thống{" "}
        <strong>không tự động nộp thuế thay bạn</strong>.
      </p>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <SummaryCard label="Tổng giao dịch" value={summary.totalTransactions.toString()} />
        <SummaryCard label="Tổng doanh thu" value={formatVnd(summary.totalValueVnd)} />
        <SummaryCard
          label="Thu nhập của bạn (60%)"
          value={formatVnd(summary.totalAuthorEarningVnd)}
          highlight
        />
      </div>

      <h2 className="mb-3 font-semibold text-text">Chi tiết theo tháng</h2>
      {summary.byMonth.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border py-12 text-center text-sm text-text-muted">
          Chưa có giao dịch mở khoá chương nào.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[480px] text-sm">
            <thead>
              <tr className="border-b border-border bg-surface text-left text-text-muted">
                <th className="px-4 py-2.5 font-medium">Tháng</th>
                <th className="px-4 py-2.5 font-medium">Giao dịch</th>
                <th className="px-4 py-2.5 font-medium">Doanh thu</th>
                <th className="px-4 py-2.5 font-medium">Thu nhập của bạn</th>
              </tr>
            </thead>
            <tbody>
              {summary.byMonth.map((m) => (
                <tr key={m.month} className="border-b border-border last:border-none">
                  <td className="px-4 py-2.5 text-text">{m.month}</td>
                  <td className="px-4 py-2.5 text-text-muted">{m.transactions}</td>
                  <td className="px-4 py-2.5 text-text-muted">{formatVnd(m.valueVnd)}</td>
                  <td className="px-4 py-2.5 font-medium text-accent">
                    {formatVnd(m.authorEarningVnd)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
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
