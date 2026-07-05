"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ApplyState = { error?: string; success?: boolean } | undefined;

export async function applyForAuthor(
  _prevState: ApplyState,
  formData: FormData,
): Promise<ApplyState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Bạn cần đăng nhập." };

  const message = String(formData.get("message") ?? "").trim();
  if (!message) return { error: "Vui lòng cho biết lý do bạn muốn trở thành tác giả." };

  const { error } = await supabase
    .from("author_applications")
    .insert({ user_id: user.id, message });

  if (error) {
    if (error.code === "23505") return { error: "Bạn đã có một đơn đang chờ duyệt." };
    return { error: "Không thể gửi đơn. Vui lòng thử lại." };
  }

  revalidatePath("/author/apply");
  return { success: true };
}
