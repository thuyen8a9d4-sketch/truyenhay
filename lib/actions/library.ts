"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function toggleLibrary(
  novelId: string,
  novelSlug: string,
): Promise<{ error: string } | { inLibrary: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Bạn cần đăng nhập." };
  }

  const { data: existing } = await supabase
    .from("library")
    .select("user_id")
    .eq("user_id", user.id)
    .eq("novel_id", novelId)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("library")
      .delete()
      .eq("user_id", user.id)
      .eq("novel_id", novelId);
  } else {
    await supabase.from("library").insert({ user_id: user.id, novel_id: novelId });
  }

  revalidatePath(`/novel/${novelSlug}`);
  revalidatePath("/library");

  return { inLibrary: !existing };
}

export async function updateReadingProgress(novelId: string, chapterId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  await supabase
    .from("library")
    .upsert(
      {
        user_id: user.id,
        novel_id: novelId,
        last_read_chapter_id: chapterId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,novel_id" },
    );

  revalidatePath("/library");
}
