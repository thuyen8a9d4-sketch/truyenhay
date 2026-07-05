import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getChapterList, getChapterContent, getComments, getWallet } from "@/lib/queries";
import { updateReadingProgress } from "@/lib/actions/library";
import { ReaderSettings } from "@/components/reader-settings";
import { ChapterJump } from "@/components/chapter-jump";
import { CommentSection } from "@/components/comment-section";
import { UnlockChapterButton } from "@/components/unlock-chapter-button";

type Params = Promise<{ slug: string; chapterNumber: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { chapterNumber } = await params;
  return { title: `Chương ${chapterNumber} | VanThu` };
}

export default async function ChapterReaderPage({ params }: { params: Params }) {
  const { slug, chapterNumber } = await params;
  const chapterNum = Number(chapterNumber);
  if (!Number.isInteger(chapterNum)) notFound();

  const supabase = await createClient();

  const { data: novel } = await supabase
    .from("novels")
    .select("id, title, slug, author_id")
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const chapters = await getChapterList(supabase, novel.id, user?.id);
  const currentIndex = chapters.findIndex((c) => c.id === chapter.id);
  const prevChapter = currentIndex > 0 ? chapters[currentIndex - 1] : null;
  const nextChapter =
    currentIndex >= 0 && currentIndex < chapters.length - 1
      ? chapters[currentIndex + 1]
      : null;

  const isOwner = user?.id === novel.author_id;
  const isFree = !chapter.is_locked || chapter.price_coins === 0;
  const alreadyUnlocked = chapters[currentIndex]?.unlocked ?? false;
  const hasAccess = isFree || isOwner || alreadyUnlocked;

  const walletBalance = !hasAccess && user ? await getWallet(supabase, user.id) : 0;

  if (hasAccess) {
    await Promise.all([
      supabase.rpc("increment_chapter_views", { p_chapter_id: chapter.id }),
      supabase.rpc("increment_novel_views", { p_novel_id: novel.id }),
      user ? updateReadingProgress(novel.id, chapter.id) : Promise.resolve(),
    ]);
  }

  const content = hasAccess ? await getChapterContent(supabase, chapter.id) : null;
  const comments = hasAccess ? await getComments(supabase, chapter.id) : [];
  const paragraphs = (content ?? "")
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
          {!isFree && <span className="ml-2 text-sm text-text-muted">🔒 {chapter.price_coins} xu</span>}
        </h1>
      </div>

      {hasAccess ? (
        <ReaderSettings>
          {paragraphs.length > 0 ? (
            paragraphs.map((p, i) => <p key={i}>{p}</p>)
          ) : (
            <p className="text-text-muted">Chương này chưa có nội dung.</p>
          )}
        </ReaderSettings>
      ) : user ? (
        <UnlockChapterButton
          chapterId={chapter.id}
          novelSlug={novel.slug}
          chapterNumber={chapter.chapter_number}
          priceCoins={chapter.price_coins}
          walletBalance={walletBalance}
        />
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-surface p-8 text-center">
          <span className="text-3xl">🔒</span>
          <h3 className="text-lg font-bold text-text">Chương này cần mở khoá</h3>
          <p className="text-sm text-text-muted">
            Giá: <strong className="text-accent">{chapter.price_coins} xu</strong>
          </p>
          <Link
            href="/login"
            className="gradient-accent rounded-lg px-5 py-2.5 font-medium text-white shadow-sm hover:opacity-90"
          >
            Đăng nhập để mở khoá
          </Link>
        </div>
      )}

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

      {hasAccess && (
        <CommentSection
          chapterId={chapter.id}
          revalidateTarget={revalidateTarget}
          comments={comments}
          isLoggedIn={!!user}
        />
      )}
    </div>
  );
}
