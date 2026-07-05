import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getAuthorNovelEligibility, getWithdrawalHistory } from "@/lib/queries";
import { WithdrawalForm } from "@/components/withdrawal-form";
import { formatDate, formatNumber } from "@/lib/utils";
import { WITHDRAWAL_MIN_CHARS, WITHDRAWAL_MIN_VIEWS } from "@/lib/database.types";

export const metadata: Metadata = {
  title: "Rút tiền | VanThu",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Đang chờ duyệt",
  approved: "Đã duyệt",
  paid: "Đã chuyển khoản",
  rejected: "Bị từ chối",
};

export default async function AuthorWithdrawPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (!profile.is_author) redirect("/author");

  const supabase = await createClient();
  const [{ data: wallet }, eligibility, history] = await Promise.all([
    supabase.from("wallets").select("author_earned_coins").eq("user_id", profile.id).maybeSingle(),
    getAuthorNovelEligibility(supabase, profile.id),
    getWithdrawalHistory(supabase, profile.id),
  ]);

  const earnedCoins = wallet?.author_earned_coins ?? 0;
  const canWithdraw = eligibility.some((n) => n.eligible);

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold text-text">Rút tiền</h1>
      <p className="mb-6 text-sm text-text-muted">
        Chỉ có thể rút tiền khi có ít nhất một truyện đã duyệt đạt tối thiểu{" "}
        {formatNumber(WITHDRAWAL_MIN_VIEWS)} lượt xem và {formatNumber(WITHDRAWAL_MIN_CHARS)} chữ.
        Yêu cầu sẽ được quản trị viên xử lý và chuyển khoản thủ công.
      </p>

      <div className="mb-6 rounded-xl border border-border bg-surface p-4">
        <p className="text-xs text-text-muted">Số xu kiếm được khả dụng để rút</p>
        <p className="mt-1 text-2xl font-bold text-accent">{earnedCoins} xu</p>
      </div>

      <h2 className="mb-3 font-semibold text-text">Điều kiện theo từng truyện</h2>
      {eligibility.length === 0 ? (
        <p className="mb-6 rounded-xl border border-dashed border-border py-8 text-center text-sm text-text-muted">
          Bạn chưa có truyện nào được duyệt.
        </p>
      ) : (
        <div className="mb-6 flex flex-col gap-2">
          {eligibility.map((n) => (
            <div key={n.id} className="rounded-lg border border-border bg-surface p-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium text-text">{n.title}</span>
                <span className={n.eligible ? "text-emerald-600 dark:text-emerald-400" : "text-text-muted"}>
                  {n.eligible ? "Đủ điều kiện" : "Chưa đủ điều kiện"}
                </span>
              </div>
              <p className="mt-1 text-xs text-text-muted">
                {formatNumber(n.views)}/{formatNumber(WITHDRAWAL_MIN_VIEWS)} lượt xem ·{" "}
                {formatNumber(n.totalChars)}/{formatNumber(WITHDRAWAL_MIN_CHARS)} chữ
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="mb-8 rounded-xl border border-border bg-surface/50 p-6">
        {canWithdraw ? (
          <WithdrawalForm maxCoins={earnedCoins} />
        ) : (
          <p className="text-sm text-text-muted">
            Bạn cần có ít nhất một truyện đủ điều kiện ở trên mới có thể gửi yêu cầu rút tiền.
          </p>
        )}
      </div>

      <h2 className="mb-3 font-semibold text-text">Lịch sử yêu cầu</h2>
      {history.length === 0 ? (
        <p className="text-sm text-text-muted">Chưa có yêu cầu rút tiền nào.</p>
      ) : (
        <div className="divide-y divide-border rounded-lg border border-border">
          {history.map((h) => (
            <div key={h.id} className="flex items-center justify-between px-4 py-3 text-sm">
              <div>
                <p className="text-text">
                  {h.coins} xu · {Number(h.amount_vnd).toLocaleString("vi-VN")}đ
                </p>
                {h.reject_reason && (
                  <p className="text-xs text-text-muted">Lý do: {h.reject_reason}</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-text">{STATUS_LABELS[h.status] ?? h.status}</p>
                <p className="text-xs text-text-muted">{formatDate(h.created_at)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
