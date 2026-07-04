import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getChapterList, getComments } from "@/lib/queries";
import { updateReadingProgress } from "@/lib/actions/library";
import { ReaderSettings } from "@/components/reader-settings";
import { ChapterJump } from "@/components/chapter-jump";
import { CommentSection } from "@/components/comment-section";

type Params = Promise<{ slug: string; chapterNumber: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { chapterNumber } = await params;
  return { title: `Chương ${chapterNumber} | TruyệnHay` };
}

export default async function ChapterReaderPage({ params }: { params: Params }) {
  const { slug, chapterNumber } = await params;
  const chapterNum = Number(chapterNumber);
  if (!Number.isInteger(chapterNum)) notFound();

  const supabase = await createClient();

  const { data: novel } = await supabase
    .from("novels")
    .select("id, title, slug")
    .eq("slug", slug)
    .single();
  if (!novel) notFound();

  const { data: chapter } = await supabase
    .from("chapters")
    .select("*")
    .eq("novel_id", novel.id)
    .eq("chapter_number", chapterNum)
    .single();
  if (!chapter) notFound();

  const chapters = await getChapterList(supabase, novel.id);
  const currentIndex = chapters.findIndex((c) => c.id === chapter.id);
  const prevChapter = currentIndex > 0 ? chapters[currentIndex - 1] : null;
  const nextChapter =
    currentIndex >= 0 && currentIndex < chapters.length - 1
      ? chapters[currentIndex + 1]
      : null;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  await Promise.all([
    supabase.rpc("increment_chapter_views", { p_chapter_id: chapter.id }),
    supabase.rpc("increment_novel_views", { p_novel_id: novel.id }),
    user ? updateReadingProgress(novel.id, chapter.id) : Promise.resolve(),
  ]);

  const comments = await getComments(supabase, chapter.id);
  const paragraphs = chapter.content
    .split(/\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
  const revalidateTarget = `/novel/${slug}/${chapterNumber}`;

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
      <div className="mb-4">
        <Link href={`/novel/${novel.slug}`} className="text-sm text-accent hover:underline">
          ← {novel.title}
        </Link>
        <h1 className="mt-1 text-xl font-bold text-text">
          Chương {chapter.chapter_number}: {chapter.title}
        </h1>
      </div>

      <ReaderSettings>
        {paragraphs.length > 0 ? (
          paragraphs.map((p, i) => <p key={i}>{p}</p>)
        ) : (
          <p className="text-text-muted">Chương này chưa có nội dung.</p>
        )}
      </ReaderSettings>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        {prevChapter ? (
          <Link
            href={`/novel/${novel.slug}/${prevChapter.chapter_number}`}
            className="rounded-lg border border-border bg-surface px-4 py-2 text-sm text-text hover:bg-surface-hover"
          >
            ← Chương trước
          </Link>
        ) : (
          <span className="rounded-lg border border-border px-4 py-2 text-sm text-text-muted opacity-40">
            ← Chương trước
          </span>
        )}

        <ChapterJump
          novelSlug={novel.slug}
          chapters={chapters}
          currentNumber={chapter.chapter_number}
        />

        {nextChapter ? (
          <Link
            href={`/novel/${novel.slug}/${nextChapter.chapter_number}`}
            className="rounded-lg border border-border bg-surface px-4 py-2 text-sm text-text hover:bg-surface-hover"
          >
            Chương sau →
          </Link>
        ) : (
          <span className="rounded-lg border border-border px-4 py-2 text-sm text-text-muted opacity-40">
            Chương sau →
          </span>
        )}
      </div>

      <CommentSection
        chapterId={chapter.id}
        revalidateTarget={revalidateTarget}
        comments={comments}
        isLoggedIn={!!user}
      />
    </div>
  );
}
