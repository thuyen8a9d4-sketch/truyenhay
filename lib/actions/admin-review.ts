"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ReviewResult = { success: boolean; message: string };

export async function reviewAuthorApplication(
  applicationId: string,
  approve: boolean,
  reason: string | null,
): Promise<ReviewResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_review_author_application", {
    p_application_id: applicationId,
    p_approve: approve,
    p_reason: reason,
  });

  if (error) return { success: false, message: "Không thể xử lý đơn." };

  revalidatePath("/admin/authors");
  return { success: true, message: approve ? "Đã duyệt đơn." : "Đã từ chối đơn." };
}

export async function reviewNovel(
  novelId: string,
  approve: boolean,
  reason: string | null,
): Promise<ReviewResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_review_novel", {
    p_novel_id: novelId,
    p_approve: approve,
    p_reason: reason,
  });

  if (error) return { success: false, message: "Không thể xử lý truyện." };

  revalidatePath("/admin/novels");
  revalidatePath("/browse");
  return { success: true, message: approve ? "Đã duyệt truyện." : "Đã từ chối truyện." };
}

export async function reviewWithdrawal(
  requestId: string,
  decision: "approved" | "paid" | "rejected",
  reason: string | null,
): Promise<ReviewResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_review_withdrawal", {
    p_request_id: requestId,
    p_decision: decision,
    p_reason: reason,
  });

  if (error) return { success: false, message: "Không thể xử lý yêu cầu." };

  revalidatePath("/admin/withdrawals");
  return { success: true, message: "Đã cập nhật yêu cầu rút tiền." };
}
