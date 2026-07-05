"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { COIN_VALUE_VND } from "@/lib/database.types";

export type UnlockResult = { success: boolean; message: string; newBalance: number };

export async function unlockChapter(
  chapterId: string,
  novelSlug: string,
  chapterNumber: number,
): Promise<UnlockResult> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("unlock_chapter", {
    p_chapter_id: chapterId,
  });

  if (error || !data || data.length === 0) {
    return { success: false, message: "Không thể mở khoá chương. Vui lòng thử lại.", newBalance: 0 };
  }

  const result = data[0];

  if (result.success) {
    revalidatePath(`/novel/${novelSlug}/${chapterNumber}`);
    revalidatePath(`/novel/${novelSlug}`);
  }

  return {
    success: result.success,
    message: result.message,
    newBalance: result.new_balance,
  };
}

export type CreditCoinsState = { error?: string; success?: boolean } | undefined;

export async function creditCoins(
  _prevState: CreditCoinsState,
  formData: FormData,
): Promise<CreditCoinsState> {
  const supabase = await createClient();

  const usernameOrEmail = String(formData.get("usernameOrEmail") ?? "").trim();
  const amountVnd = Number(formData.get("amountVnd"));
  const note = String(formData.get("note") ?? "").trim() || null;

  if (!usernameOrEmail) return { error: "Vui lòng nhập username người nhận." };
  if (!amountVnd || amountVnd < COIN_VALUE_VND) {
    return { error: `Số tiền tối thiểu ${COIN_VALUE_VND.toLocaleString("vi-VN")}đ (= 1 xu).` };
  }

  const coins = Math.floor(amountVnd / COIN_VALUE_VND);

  const { data: targetProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", usernameOrEmail)
    .maybeSingle();

  if (!targetProfile) {
    return { error: "Không tìm thấy người dùng với username này." };
  }

  const { error } = await supabase.rpc("admin_credit_coins", {
    p_user_id: targetProfile.id,
    p_coins: coins,
    p_amount_vnd: amountVnd,
    p_note: note,
  });

  if (error) {
    return { error: "Không thể cộng xu. Bạn có chắc tài khoản của mình có quyền admin?" };
  }

  revalidatePath("/admin/coins");
  return { success: true };
}
