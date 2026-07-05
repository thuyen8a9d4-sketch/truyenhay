import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getPendingWithdrawals } from "@/lib/queries";
import { reviewWithdrawal } from "@/lib/actions/admin-review";
import { ReviewActions } from "@/components/review-actions";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Quản trị — Duyệt rút tiền | VanThu",
};

export default async function AdminWithdrawalsPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (!profile.is_admin) redirect("/");

  const supabase = await createClient();
  const requests = await getPendingWithdrawals(supabase);

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-text">Quản trị — Duyệt rút tiền</h1>

      {requests.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border py-16 text-center text-text-muted">
          Không có yêu cầu rút tiền nào đang chờ xử lý.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {requests.map((req) => (
            <div
              key={req.id}
              className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-border bg-surface p-4"
            >
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-text">
                  {req.author?.display_name ?? req.author?.username ?? "Ẩn danh"}
                </p>
                <p className="mt-1 text-sm text-text">
                  {req.coins} xu · {req.amount_vnd.toLocaleString("vi-VN")}đ
                </p>
                <p className="mt-1 text-sm text-text-muted">
                  {req.bank_name} · {req.bank_account_number} · {req.bank_account_holder}
                </p>
                <p className="mt-1 text-xs text-text-muted">{formatDate(req.created_at)}</p>
              </div>
              <ReviewActions
                actions={[
                  { label: "Đã chuyển khoản", run: reviewWithdrawal.bind(null, req.id, "paid") },
                  { label: "Duyệt", run: reviewWithdrawal.bind(null, req.id, "approved") },
                  {
                    label: "Từ chối",
                    danger: true,
                    askReason: true,
                    run: reviewWithdrawal.bind(null, req.id, "rejected"),
                  },
                ]}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
