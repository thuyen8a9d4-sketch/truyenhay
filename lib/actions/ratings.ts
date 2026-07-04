"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type RatingState = { error?: string; success?: boolean } | undefined;

export async function submitRating(
  novelId: string,
  novelSlug: string,
  _prevState: RatingState,
  formData: FormData,
): Promise<RatingState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Bạn cần đăng nhập để đánh giá." };
  }

  const rating = Number(formData.get("rating"));
  const review = String(formData.get("review") ?? "").trim();

  if (!rating || rating < 1 || rating > 5) {
    return { error: "Vui lòng chọn số sao đánh giá." };
  }

  const { error } = await supabase
    .from("ratings")
    .upsert(
      { user_id: user.id, novel_id: novelId, rating, review: review || null },
      { onConflict: "user_id,novel_id" },
    );

  if (error) {
    return { error: "Không thể gửi đánh giá. Vui lòng thử lại." };
  }

  revalidatePath(`/novel/${novelSlug}`);
  return { success: true };
}
