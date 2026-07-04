import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getGenres } from "@/lib/queries";
import { updateNovel, deleteNovel } from "@/lib/actions/novels";
import { NovelForm } from "@/components/novel-form";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";

export const metadata: Metadata = {
  title: "Chỉnh sửa truyện | TruyệnHay",
};

type Params = Promise<{ novelId: string }>;

export default async function EditNovelPage({ params }: { params: Params }) {
  const { novelId } = await params;
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const supabase = await createClient();
  const { data: novel } = await supabase
    .from("novels")
    .select("*")
    .eq("id", novelId)
    .single();
  if (!novel) notFound();
  if (novel.author_id !== profile.id) redirect("/author");

  const [genres, { data: novelGenreRows }] = await Promise.all([
    getGenres(supabase),
    supabase.from("novel_genres").select("genre_id").eq("novel_id", novelId),
  ]);
  const genreIds = (novelGenreRows ?? []).map((r) => r.genre_id);

  const action = updateNovel.bind(null, novelId);
  const deleteAction = deleteNovel.bind(null, novelId);

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-text">Chỉnh sửa truyện</h1>
      <div className="rounded-xl border border-border bg-surface/50 p-6">
        <NovelForm
          action={action}
          genres={genres}
          initial={{
            title: novel.title,
            synopsis: novel.synopsis,
            status: novel.status,
            genreIds,
            coverUrl: novel.cover_url,
          }}
          submitLabel="Lưu thay đổi"
        />
      </div>

      <form action={deleteAction} className="mt-6">
        <ConfirmSubmitButton
          confirmMessage="Xoá truyện này? Toàn bộ chương, bình luận và đánh giá sẽ bị xoá vĩnh viễn."
          className="rounded-lg border border-red-500/40 px-4 py-2.5 text-sm text-red-600 hover:bg-red-500/10 dark:text-red-400"
        >
          Xoá truyện
        </ConfirmSubmitButton>
      </form>
    </div>
  );
}
