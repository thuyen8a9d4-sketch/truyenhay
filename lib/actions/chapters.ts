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

  if (!chapterNumber || chapterNumber < 1) return { error: "Số chương không hợp lệ." };
  if (!title) return { error: "Vui lòng nhập tiêu đề chương." };
  if (!content) return { error: "Vui lòng nhập nội dung chương." };

  const { error } = await supabase
    .from("chapters")
    .insert({ novel_id: novelId, chapter_number: chapterNumber, title, content });

  if (error) {
    if (error.code === "23505") return { error: `Chương số ${chapterNumber} đã tồn tại.` };
    return { error: "Không thể tạo chương. Vui lòng thử lại." };
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

  if (!chapterNumber || chapterNumber < 1) return { error: "Số chương không hợp lệ." };
  if (!title) return { error: "Vui lòng nhập tiêu đề chương." };
  if (!content) return { error: "Vui lòng nhập nội dung chương." };

  const { error } = await supabase
    .from("chapters")
    .update({ chapter_number: chapterNumber, title, content })
    .eq("id", chapterId);

  if (error) {
    if (error.code === "23505") return { error: `Chương số ${chapterNumber} đã tồn tại.` };
    return { error: "Không thể cập nhật chương." };
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
