import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { updateChapter } from "@/lib/actions/chapters";
import { ChapterForm } from "@/components/chapter-form";

export const metadata: Metadata = {
  title: "Sửa chương | VanThu",
};

type Params = Promise<{ novelId: string; chapterId: string }>;

export default async function EditChapterPage({ params }: { params: Params }) {
  const { novelId, chapterId } = await params;
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const supabase = await createClient();
  const { data: novel } = await supabase
    .from("novels")
    .select("id, slug, author_id, views")
    .eq("id", novelId)
    .single();
  if (!novel) notFound();
  if (novel.author_id !== profile.id) redirect("/author");

  const { data: chapter } = await supabase
    .from("chapters")
    .select("*")
    .eq("id", chapterId)
    .eq("novel_id", novelId)
    .single();
  if (!chapter) notFound();

  const { data: chapterContent } = await supabase
    .from("chapter_contents")
    .select("content")
    .eq("chapter_id", chapterId)
    .single();

  const action = updateChapter.bind(null, chapterId, novelId, novel.slug);

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-text">Sửa chương</h1>
      <div className="rounded-xl border border-border bg-surface/50 p-6">
        <ChapterForm
          action={action}
          initial={{
            chapterNumber: chapter.chapter_number,
            title: chapter.title,
            content: chapterContent?.content ?? "",
            isLocked: chapter.is_locked,
            priceCoins: chapter.price_coins,
          }}
          submitLabel="Lưu thay đổi"
          novelViews={novel.views}
        />
      </div>
    </div>
  );
}
