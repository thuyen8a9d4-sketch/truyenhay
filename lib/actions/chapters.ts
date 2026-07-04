"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ChapterFormState = { error?: string } | undefined;

export async function createChapter(
  novelId: string,
  novelSlug: string,
  _prevState: ChapterFormState,
  formData: FormData,
): Promise<ChapterFormState> {
  const supabase = await createClient();

  const chapterNumber = Number(formData.get("chapterNumber"));
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const isLocked = formData.get("isLocked") === "on";
  const priceCoins = isLocked ? Math.max(0, Number(formData.get("priceCoins")) || 0) : 0;

  if (!chapterNumber || chapterNumber < 1) return { error: "Số chương không hợp lệ." };
  if (!title) return { error: "Vui lòng nhập tiêu đề chương." };
  if (!content) return { error: "Vui lòng nhập nội dung chương." };
  if (isLocked && priceCoins < 1) return { error: "Chương khoá phải có giá tối thiểu 1 xu." };

  const { data: chapter, error } = await supabase
    .from("chapters")
    .insert({
      novel_id: novelId,
      chapter_number: chapterNumber,
      title,
      is_locked: isLocked,
      price_coins: priceCoins,
    })
    .select("id")
    .single();

  if (error || !chapter) {
    if (error?.code === "23505") return { error: `Chương số ${chapterNumber} đã tồn tại.` };
    return { error: "Không thể tạo chương. Vui lòng thử lại." };
  }

  const { error: contentError } = await supabase
    .from("chapter_contents")
    .insert({ chapter_id: chapter.id, content });

  if (contentError) {
    return { error: "Đã tạo chương nhưng không lưu được nội dung. Vui lòng sửa lại chương." };
  }

  revalidatePath(`/novel/${novelSlug}`);
  revalidatePath(`/author/${novelId}/chapters`);
  redirect(`/author/${novelId}/chapters`);
}

export async function updateChapter(
  chapterId: string,
  novelId: string,
  novelSlug: string,
  _prevState: ChapterFormState,
  formData: FormData,
): Promise<ChapterFormState> {
  const supabase = await createClient();

  const chapterNumber = Number(formData.get("chapterNumber"));
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const isLocked = formData.get("isLocked") === "on";
  const priceCoins = isLocked ? Math.max(0, Number(formData.get("priceCoins")) || 0) : 0;

  if (!chapterNumber || chapterNumber < 1) return { error: "Số chương không hợp lệ." };
  if (!title) return { error: "Vui lòng nhập tiêu đề chương." };
  if (!content) return { error: "Vui lòng nhập nội dung chương." };
  if (isLocked && priceCoins < 1) return { error: "Chương khoá phải có giá tối thiểu 1 xu." };

  const { error } = await supabase
    .from("chapters")
    .update({
      chapter_number: chapterNumber,
      title,
      is_locked: isLocked,
      price_coins: priceCoins,
    })
    .eq("id", chapterId);

  if (error) {
    if (error.code === "23505") return { error: `Chương số ${chapterNumber} đã tồn tại.` };
    return { error: "Không thể cập nhật chương." };
  }

  const { error: contentError } = await supabase
    .from("chapter_contents")
    .update({ content })
    .eq("chapter_id", chapterId);

  if (contentError) {
    return { error: "Không thể cập nhật nội dung chương." };
  }

  revalidatePath(`/novel/${novelSlug}`);
  revalidatePath(`/novel/${novelSlug}/${chapterNumber}`);
  revalidatePath(`/author/${novelId}/chapters`);
  redirect(`/author/${novelId}/chapters`);
}

export async function deleteChapter(chapterId: string, novelId: string, novelSlug: string) {
  const supabase = await createClient();
  await supabase.from("chapters").delete().eq("id", chapterId);

  revalidatePath(`/novel/${novelSlug}`);
  revalidatePath(`/author/${novelId}/chapters`);
  redirect(`/author/${novelId}/chapters`);
}
