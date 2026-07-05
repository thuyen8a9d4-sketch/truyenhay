import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getWallet } from "@/lib/queries";
import { COIN_PACKAGES } from "@/lib/database.types";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Nạp xu | VanThu",
};

function formatVnd(n: number) {
  return n.toLocaleString("vi-VN") + "đ";
}

export default async function TopupPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [balance, { data: history }] = await Promise.all([
    getWallet(supabase, user.id),
    supabase
      .from("coin_purchases")
      .select("id, coins, amount_vnd, note, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold text-text">Nạp xu</h1>
      <p className="mb-6 text-text-muted">
        Số dư hiện tại: <strong className="text-accent">{balance} xu</strong>
      </p>

      <section className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {COIN_PACKAGES.map((pkg) => (
          <div
            key={pkg.coins}
            className="flex flex-col items-center gap-1 rounded-xl border border-border bg-surface p-4 text-center"
          >
            <span className="text-2xl">🪙</span>
            <span className="text-lg font-bold text-text">{pkg.coins} xu</span>
            <span className="text-sm text-text-muted">{formatVnd(pkg.priceVnd)}</span>
          </div>
        ))}
      </section>

      <section className="mb-8 rounded-xl border border-border bg-surface/50 p-5">
        <h2 className="mb-2 font-semibold text-text">Cách nạp xu</h2>
        <p className="mb-3 text-sm text-text-muted">
          Hệ thống hiện <strong>chưa kết nối cổng thanh toán tự động</strong> (VNPay/Momo/ZaloPay).
          Để nạp xu, vui lòng làm theo các bước sau:
        </p>
        <ol className="list-decimal space-y-1.5 pl-5 text-sm text-text-muted">
          <li>Chuyển khoản đúng số tiền của gói xu bạn muốn mua tới thông tin nhận tiền của chủ trang web (chủ web vui lòng cập nhật thông tin cụ thể tại đây).</li>
          <li>Ghi nội dung chuyển khoản kèm username của bạn để dễ đối chiếu.</li>
          <li>Gửi ảnh chụp biên lai chuyển khoản cho admin qua email/Zalo (chủ web bổ sung liên hệ).</li>
          <li>Admin sẽ cộng xu vào ví của bạn trong vòng 24 giờ.</li>
        </ol>
      </section>

      <section>
        <h2 className="mb-3 font-semibold text-text">Lịch sử nạp xu</h2>
        {history && history.length > 0 ? (
          <div className="divide-y divide-border rounded-lg border border-border">
            {history.map((h) => (
              <div key={h.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <div>
                  <p className="text-text">+{h.coins} xu</p>
                  {h.note && <p className="text-xs text-text-muted">{h.note}</p>}
                </div>
                <div className="text-right">
                  <p className="text-text">{formatVnd(h.amount_vnd)}</p>
                  <p className="text-xs text-text-muted">{formatDate(h.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-muted">Bạn chưa nạp xu lần nào.</p>
        )}
      </section>
    </div>
  );
}
