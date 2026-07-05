import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import {
  getChapterList,
  getNovelDetail,
  getReviews,
  getUserRating,
} from "@/lib/queries";
import { StatusBadge } from "@/components/status-badge";
import { ApprovalBadge } from "@/components/approval-badge";
import { RatingStars } from "@/components/rating-stars";
import { LibraryButton } from "@/components/library-button";
import { ChapterList } from "@/components/chapter-list";
import { RatingForm } from "@/components/rating-form";
import { ReviewList } from "@/components/review-list";
import { formatNumber, genreColorClass, coverGradient } from "@/lib/utils";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const novel = await getNovelDetail(supabase, slug);
  if (!novel) return { title: "Không tìm thấy truyện | VanThu" };
  return { title: `${novel.title} | VanThu`, description: novel.synopsis };
}

export default async function NovelDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const supabase = await createClient();

  const novel = await getNovelDetail(supabase, slug);
  if (!novel) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const viewerProfile = user ? await getCurrentProfile() : null;

  const [chapters, reviews, libraryEntry, userRating] = await Promise.all([
    getChapterList(supabase, novel.id, user?.id),
    getReviews(supabase, novel.id),
    user
      ? supabase
          .from("library")
          .select("last_read_chapter_id")
          .eq("user_id", user.id)
          .eq("novel_id", novel.id)
          .maybeSingle()
          .then((r) => r.data)
      : Promise.resolve(null),
    user ? getUserRating(supabase, novel.id, user.id) : Promise.resolve(null),
  ]);

  const isOwner = user?.id === novel.author_id;
  const canSeeApprovalStatus = isOwner || !!viewerProfile?.is_admin;
  const firstChapter = chapters[0];
  const continueChapter = libraryEntry?.last_read_chapter_id
    ? chapters.find((c) => c.id === libraryEntry.last_read_chapter_id)
    : null;

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
      <div className="grid gap-8 sm:grid-cols-[220px_1fr]">
        <div className="flex flex-col gap-4">
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl border border-border bg-surface">
            {novel.cover_url ? (
              <Image
                src={novel.cover_url}
                alt={novel.title}
                fill
                sizes="220px"
                className="object-cover"
              />
            ) : (
              <div
                className="flex h-full items-center justify-center px-3 text-center text-sm font-semibold text-white"
                style={{ backgroundImage: coverGradient(novel.slug) }}
              >
                {novel.title}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 text-sm text-text-muted">
            <div className="flex justify-between">
              <span>Lượt xem</span>
              <span className="text-text">{formatNumber(novel.views)}</span>
            </div>
            <div className="flex justify-between">
              <span>Số chương</span>
              <span className="text-text">{novel.stats.chapter_count}</span>
            </div>
            <div className="flex justify-between">
              <span>Đánh giá</span>
              <span className="text-text">
                {novel.stats.avg_rating}/5 ({novel.stats.rating_count})
              </span>
            </div>
          </div>

          {firstChapter && (
            <Link
              href={`/novel/${novel.slug}/${continueChapter?.chapter_number ?? firstChapter.chapter_number}`}
              className="gradient-accent rounded-lg px-4 py-2.5 text-center font-medium text-white shadow-sm transition hover:opacity-90 hover:shadow-md"
            >
              {continueChapter ? "Đọc tiếp" : "Đọc từ đầu"}
            </Link>
          )}

          <LibraryButton
            novelId={novel.id}
            novelSlug={novel.slug}
            initialInLibrary={!!libraryEntry}
            isLoggedIn={!!user}
          />

          {isOwner && (
            <Link
              href={`/author/${novel.id}/edit`}
              className="rounded-lg border border-border px-4 py-2.5 text-center text-sm text-text hover:bg-surface-hover"
            >
              Chỉnh sửa truyện
            </Link>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text sm:text-3xl">{novel.title}</h1>
            <p className="mt-1 text-sm text-text-muted">
              Tác giả:{" "}
              <span className="text-text">
                {novel.author?.display_name ?? novel.author?.username ?? "Ẩn danh"}
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={novel.status} />
            {canSeeApprovalStatus && novel.approval_status !== "approved" && (
              <ApprovalBadge status={novel.approval_status} />
            )}
            <RatingStars rating={novel.stats.avg_rating} size={16} />
            {novel.genres.map((g) => (
              <Link
                key={g.id}
                href={`/browse?genre=${g.slug}`}
                className={`rounded-full px-3 py-1 text-xs font-medium transition hover:opacity-80 ${genreColorClass(g.id)}`}
              >
                {g.name}
              </Link>
            ))}
          </div>

          <p className="whitespace-pre-line text-sm leading-relaxed text-text-muted">
            {novel.synopsis || "Chưa có mô tả cho truyện này."}
          </p>

          {canSeeApprovalStatus && novel.approval_status === "rejected" && novel.reject_reason && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-600 dark:text-red-400">
              Lý do bị từ chối: {novel.reject_reason}
            </p>
          )}
        </div>
      </div>

      <section className="mt-10">
        <h2 className="mb-4 text-lg font-bold text-text">
          Danh sách chương ({chapters.length})
        </h2>
        <ChapterList
          novelSlug={novel.slug}
          chapters={chapters}
          lastReadChapterId={libraryEntry?.last_read_chapter_id}
        />
      </section>

      <section className="mt-10">
        <h2 className="mb-4 text-lg font-bold text-text">Đánh giá & Nhận xét</h2>
        <div className="mb-6 rounded-xl border border-border bg-surface/50 p-5">
          {user ? (
            <RatingForm
              novelId={novel.id}
              novelSlug={novel.slug}
              initialRating={userRating?.rating ?? 0}
              initialReview={userRating?.review ?? ""}
            />
          ) : (
            <p className="text-sm text-text-muted">
              <Link href="/login" className="text-accent hover:underline">
                Đăng nhập
              </Link>{" "}
              để đánh giá truyện này.
            </p>
          )}
        </div>
        <ReviewList reviews={reviews} />
      </section>
    </div>
  );
}
