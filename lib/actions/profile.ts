"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ProfileState = { error?: string; success?: boolean } | undefined;

export async function updateProfile(
  _prevState: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Bạn cần đăng nhập." };
  }

  const displayName = String(formData.get("displayName") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  const isAuthor = formData.get("isAuthor") === "on";

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: displayName || null,
      bio: bio || null,
      is_author: isAuthor,
    })
    .eq("id", user.id);

  if (error) {
    return { error: "Không thể cập nhật hồ sơ. Vui lòng thử lại." };
  }

  revalidatePath("/profile");
  revalidatePath("/", "layout");
  return { success: true };
}
