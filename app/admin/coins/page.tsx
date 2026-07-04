import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { CreditCoinsForm } from "@/components/credit-coins-form";

export const metadata: Metadata = {
  title: "Quản trị — Cộng xu | VanThu",
};

export default async function AdminCoinsPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (!profile.is_admin) redirect("/");

  const supabase = await createClient();
  const { data: recent } = await supabase
    .from("coin_purchases")
    .select("id, user_id, coins, amount_vnd, note, created_at")
    .order("created_at", { ascending: false })
    .limit(30);

  const userIds = Array.from(new Set((recent ?? []).map((r) => r.user_id)));
  const { data: users } =
    userIds.length > 0
      ? await supabase.from("profiles").select("id, username").in("id", userIds)
      : { data: [] as { id: string; username: string }[] };
  const userMap = new Map((users ?? []).map((u) => [u.id, u.username]));

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-text">Quản trị — Cộng xu thủ công</h1>

      <div className="mb-8 rounded-xl border border-border bg-surface/50 p-6">
        <CreditCoinsForm />
      </div>

      <h2 className="mb-3 font-semibold text-text">Lịch sử cộng xu gần đây</h2>
      {recent && recent.length > 0 ? (
        <div className="divide-y divide-border rounded-lg border border-border">
          {recent.map((r) => (
            <div key={r.id} className="flex items-center justify-between px-4 py-3 text-sm">
              <div>
                <p className="text-text">{userMap.get(r.user_id) ?? "?"}</p>
                {r.note && <p className="text-xs text-text-muted">{r.note}</p>}
              </div>
              <div className="text-right">
                <p className="text-text">+{r.coins} xu · {Number(r.amount_vnd).toLocaleString("vi-VN")}đ</p>
                <p className="text-xs text-text-muted">{formatDate(r.created_at)}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-text-muted">Chưa có giao dịch nào.</p>
      )}
    </div>
  );
}
