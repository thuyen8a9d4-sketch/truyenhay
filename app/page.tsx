import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { listNovels } from "@/lib/queries";
import { NovelGrid } from "@/components/novel-grid";
import { RatingStars } from "@/components/rating-stars";
import { StatusBadge } from "@/components/status-badge";
import { coverGradient } from "@/lib/utils";

export default async function HomePage() {
  const supabase = await createClient();

  const [{ novels: trending }, { novels: updated }, { novels: newest }] =
    await Promise.all([
      listNovels(supabase, { sort: "trending", pageSize: 12 }),
      listNovels(supabase, { sort: "updated", pageSize: 12 }),
      listNovels(supabase, { sort: "newest", pageSize: 12 }),
    ]);

  const hero = trending[0];

  return (
    <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
      {hero ? (
        <section className="hero-gradient mb-10 overflow-hidden rounded-2xl border border-border">
          <div className="grid gap-6 p-6 sm:grid-cols-[180px_1fr] sm:p-8">
            <div className="relative mx-auto aspect-[3/4] w-40 overflow-hidden rounded-xl shadow-lg sm:mx-0 sm:w-full">
              {hero.cover_url ? (
                <Image
                  src={hero.cover_url}
                  alt={hero.title}
                  fill
                  sizes="200px"
                  className="object-cover"
                />
              ) : (
                <div
                  className="flex h-full items-center justify-center px-2 text-center text-sm font-semibold text-white"
                  style={{ backgroundImage: coverGradient(hero.slug) }}
                >
                  {hero.title}
                </div>
              )}
            </div>
            <div className="flex flex-col justify-center gap-3">
              <span className="w-fit rounded-full bg-accent/15 px-3 py-1 text-xs font-medium text-accent">
                🔥 Nổi bật
              </span>
              <h1 className="text-2xl font-bold text-text sm:text-3xl">
                {hero.title}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-text-muted">
                <StatusBadge status={hero.status} />
                <RatingStars rating={hero.stats.avg_rating} />
                <span>{hero.stats.chapter_count} chương</span>
                {hero.author && (
                  <span>· {hero.author.display_name ?? hero.author.username}</span>
                )}
              </div>
              <p className="line-clamp-3 text-sm text-text-muted">
                {hero.synopsis || "Chưa có mô tả."}
              </p>
              <Link
                href={`/novel/${hero.slug}`}
                className="gradient-accent mt-2 w-fit rounded-lg px-5 py-2.5 font-medium text-white shadow-md transition hover:opacity-90 hover:shadow-lg"
              >
                Đọc ngay
              </Link>
            </div>
          </div>
        </section>
      ) : (
        <section className="hero-gradient mb-10 rounded-2xl border border-border p-10 text-center">
          <h1 className="text-2xl font-bold text-text">
            Chào mừng đến với TruyệnHay
          </h1>
          <p className="mx-auto mt-2 max-w-md text-text-muted">
            Nền tảng chưa có truyện nào. Hãy là người đầu tiên đăng ký tài khoản,
            bật chế độ tác giả và đăng truyện của bạn!
          </p>
          <Link
            href="/signup"
            className="gradient-accent mt-5 inline-block rounded-lg px-5 py-2.5 font-medium text-white shadow-md transition hover:opacity-90 hover:shadow-lg"
          >
            Bắt đầu ngay
          </Link>
        </section>
      )}

      <HomeSection title="Đang thịnh hành" href="/rankings?sort=views" novels={trending} />
      <HomeSection title="Mới cập nhật" href="/browse?sort=updated" novels={updated} />
      <HomeSection title="Truyện mới đăng" href="/browse?sort=newest" novels={newest} />
    </div>
  );
}

function HomeSection({
  title,
  href,
  novels,
}: {
  title: string;
  href: string;
  novels: Awaited<ReturnType<typeof listNovels>>["novels"];
}) {
  if (novels.length === 0) return null;

  return (
    <section className="mb-10">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-text">{title}</h2>
        <Link href={href} className="text-sm text-accent hover:underline">
          Xem thêm
        </Link>
      </div>
      <NovelGrid novels={novels} />
    </section>
  );
}
