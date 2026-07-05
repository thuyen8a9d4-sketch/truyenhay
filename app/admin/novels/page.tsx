import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getPendingNovels } from "@/lib/queries";
import { reviewNovel } from "@/lib/actions/admin-review";
import { ReviewActions } from "@/components/review-actions";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Quản trị — Duyệt truyện | VanThu",
};

export default async function AdminNovelsPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (!profile.is_admin) redirect("/");

  const supabase = await createClient();
  const novels = await getPendingNovels(supabase);

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-text">Quản trị — Duyệt truyện</h1>

      {novels.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border py-16 text-center text-text-muted">
          Không có truyện nào đang chờ duyệt.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {novels.map((novel) => (
            <div
              key={novel.id}
              className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-border bg-surface p-4"
            >
              <div className="min-w-0 flex-1">
                <Link
                  href={`/novel/${novel.slug}`}
                  target="_blank"
                  className="font-semibold text-text hover:underline"
                >
                  {novel.title}
                </Link>
                <p className="mt-1 text-sm text-text-muted">
                  Tác giả: {novel.author?.display_name ?? novel.author?.username ?? "Ẩn danh"}
                </p>
                <p className="mt-1 line-clamp-2 text-sm text-text-muted">{novel.synopsis}</p>
                <p className="mt-1 text-xs text-text-muted">{formatDate(novel.created_at)}</p>
              </div>
              <ReviewActions
                actions={[
                  { label: "Duyệt", run: reviewNovel.bind(null, novel.id, true) },
                  {
                    label: "Từ chối",
                    danger: true,
                    askReason: true,
                    run: reviewNovel.bind(null, novel.id, false),
                  },
                ]}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
