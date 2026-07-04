"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type CommentState = { error?: string } | undefined;

export async function postComment(
  chapterId: string,
  revalidatePathTarget: string,
  _prevState: CommentState,
  formData: FormData,
): Promise<CommentState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Bạn cần đăng nhập để bình luận." };
  }

  const content = String(formData.get("content") ?? "").trim();
  if (!content) {
    return { error: "Nội dung bình luận không được để trống." };
  }

  const { error } = await supabase
    .from("comments")
    .insert({ user_id: user.id, chapter_id: chapterId, content });

  if (error) {
    return { error: "Không thể gửi bình luận. Vui lòng thử lại." };
  }

  revalidatePath(revalidatePathTarget);
  return undefined;
}
