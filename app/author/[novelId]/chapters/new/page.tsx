import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getChapterList } from "@/lib/queries";
import { createChapter } from "@/lib/actions/chapters";
import { ChapterForm } from "@/components/chapter-form";

export const metadata: Metadata = {
  title: "Thêm chương mới | VanThu",
};

type Params = Promise<{ novelId: string }>;

export default async function NewChapterPage({ params }: { params: Params }) {
  const { novelId } = await params;
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const supabase = await createClient();
  const { data: novel } = await supabase
    .from("novels")
    .select("id, title, slug, author_id")
    .eq("id", novelId)
    .single();
  if (!novel) notFound();
  if (novel.author_id !== profile.id) redirect("/author");

  const chapters = await getChapterList(supabase, novelId);
  const nextNumber =
    chapters.length > 0 ? chapters[chapters.length - 1].chapter_number + 1 : 1;

  const action = createChapter.bind(null, novelId, novel.slug);

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
      <h1 className="mb-1 text-2xl font-bold text-text">Thêm chương mới</h1>
      <p className="mb-6 text-sm text-text-muted">{novel.title}</p>
      <div className="rounded-xl border border-border bg-surface/50 p-6">
        <ChapterForm
          action={action}
          initial={{ chapterNumber: nextNumber, title: "", content: "" }}
          submitLabel="Đăng chương"
        />
      </div>
    </div>
  );
}
