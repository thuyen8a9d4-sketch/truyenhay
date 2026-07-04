import type { Metadata } from "next";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getChapterList } from "@/lib/queries";
import { deleteChapter } from "@/lib/actions/chapters";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Quản lý chương | TruyệnHay",
};

type Params = Promise<{ novelId: string }>;

export default async function ManageChaptersPage({ params }: { params: Params }) {
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

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href={`/author/${novelId}/edit`} className="text-sm text-accent hover:underline">
            ← {novel.title}
          </Link>
          <h1 className="mt-1 text-2xl font-bold text-text">Quản lý chương</h1>
        </div>
        <Link
          href={`/author/${novelId}/chapters/new`}
          className="rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-hover"
        >
          + Thêm chương
        </Link>
      </div>

      {chapters.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border py-16 text-center text-text-muted">
          Chưa có chương nào.
        </p>
      ) : (
        <div className="divide-y divide-border rounded-xl border border-border">
          {chapters.map((c) => (
            <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-text">
                  Chương {c.chapter_number}: {c.title}
                </p>
                <p className="text-xs text-text-muted">
                  {formatDate(c.created_at)} · {c.views} lượt xem
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/author/${novelId}/chapters/${c.id}/edit`}
                  className="rounded-lg border border-border px-3 py-1.5 text-sm text-text hover:bg-surface-hover"
                >
                  Sửa
                </Link>
                <form action={deleteChapter.bind(null, c.id, novelId, novel.slug)}>
                  <ConfirmSubmitButton
                    confirmMessage="Xoá chương này?"
                    className="rounded-lg border border-red-500/40 px-3 py-1.5 text-sm text-red-600 hover:bg-red-500/10 dark:text-red-400"
                  >
                    Xoá
                  </ConfirmSubmitButton>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
