"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type WithdrawalFormState = { error?: string; success?: boolean } | undefined;

export async function requestWithdrawal(
  _prevState: WithdrawalFormState,
  formData: FormData,
): Promise<WithdrawalFormState> {
  const supabase = await createClient();

  const coins = Number(formData.get("coins"));
  const bankName = String(formData.get("bankName") ?? "").trim();
  const bankAccountNumber = String(formData.get("bankAccountNumber") ?? "").trim();
  const bankAccountHolder = String(formData.get("bankAccountHolder") ?? "").trim();

  if (!coins || coins < 1) return { error: "Số xu muốn rút không hợp lệ." };
  if (!bankName || !bankAccountNumber || !bankAccountHolder) {
    return { error: "Vui lòng nhập đầy đủ thông tin ngân hàng." };
  }

  const { data, error } = await supabase.rpc("request_withdrawal", {
    p_coins: coins,
    p_bank_name: bankName,
    p_bank_account_number: bankAccountNumber,
    p_bank_account_holder: bankAccountHolder,
  });

  if (error || !data || data.length === 0) {
    return { error: "Không thể gửi yêu cầu. Vui lòng thử lại." };
  }

  const result = data[0];
  if (!result.success) return { error: result.message };

  revalidatePath("/author/withdraw");
  return { success: true };
}
