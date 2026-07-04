"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";
import type { NovelStatus } from "@/lib/database.types";

export type NovelFormState = { error?: string; success?: boolean } | undefined;

function parseGenreIds(formData: FormData): number[] {
  return formData
    .getAll("genres")
    .map((v) => Number(v))
    .filter((n) => Number.isInteger(n));
}

async function uploadCoverIfProvided(
  supabase: Awaited<ReturnType<typeof createClient>>,
  authorId: string,
  novelId: string,
  formData: FormData,
) {
  const cover = formData.get("cover");
  if (!(cover instanceof File) || cover.size === 0) return;

  const ext = cover.name.split(".").pop() || "jpg";
  const path = `${authorId}/${novelId}-${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("covers")
    .upload(path, cover, { contentType: cover.type, upsert: true });

  if (!uploadError) {
    const { data } = supabase.storage.from("covers").getPublicUrl(path);
    await supabase.from("novels").update({ cover_url: data.publicUrl }).eq("id", novelId);
  }
}

export async function createNovel(
  _prevState: NovelFormState,
  formData: FormData,
): Promise<NovelFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Bạn cần đăng nhập." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_author")
    .eq("id", user.id)
    .single();
  if (!profile?.is_author) {
    return { error: "Bạn cần bật chế độ tác giả trong Hồ sơ trước." };
  }

  const title = String(formData.get("title") ?? "").trim();
  const synopsis = String(formData.get("synopsis") ?? "").trim();
  const status = String(formData.get("status") ?? "ongoing") as NovelStatus;
  const genreIds = parseGenreIds(formData);

  if (!title) return { error: "Vui lòng nhập tên truyện." };

  const slug = `${slugify(title)}-${Math.random().toString(36).slice(2, 7)}`;

  const { data: novel, error } = await supabase
    .from("novels")
    .insert({ author_id: user.id, title, slug, synopsis, status })
    .select("id, slug")
    .single();

  if (error || !novel) return { error: "Không thể tạo truyện. Vui lòng thử lại." };

  if (genreIds.length > 0) {
    await supabase
      .from("novel_genres")
      .insert(genreIds.map((genre_id) => ({ novel_id: novel.id, genre_id })));
  }

  await uploadCoverIfProvided(supabase, user.id, novel.id, formData);

  revalidatePath("/author");
  redirect(`/author/${novel.id}/chapters/new`);
}

export async function updateNovel(
  novelId: string,
  _prevState: NovelFormState,
  formData: FormData,
): Promise<NovelFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Bạn cần đăng nhập." };

  const title = String(formData.get("title") ?? "").trim();
  const synopsis = String(formData.get("synopsis") ?? "").trim();
  const status = String(formData.get("status") ?? "ongoing") as NovelStatus;
  const genreIds = parseGenreIds(formData);

  if (!title) return { error: "Vui lòng nhập tên truyện." };

  const { data: novel, error } = await supabase
    .from("novels")
    .update({ title, synopsis, status })
    .eq("id", novelId)
    .eq("author_id", user.id)
    .select("id, slug")
    .single();

  if (error || !novel) return { error: "Không thể cập nhật truyện." };

  await supabase.from("novel_genres").delete().eq("novel_id", novelId);
  if (genreIds.length > 0) {
    await supabase
      .from("novel_genres")
      .insert(genreIds.map((genre_id) => ({ novel_id: novelId, genre_id })));
  }

  await uploadCoverIfProvided(supabase, user.id, novelId, formData);

  revalidatePath("/author");
  revalidatePath(`/novel/${novel.slug}`);
  return { success: true };
}

export async function deleteNovel(novelId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase.from("novels").delete().eq("id", novelId).eq("author_id", user.id);

  revalidatePath("/author");
  redirect("/author");
}
