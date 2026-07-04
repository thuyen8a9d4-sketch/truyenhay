import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getGenres } from "@/lib/queries";
import { createNovel } from "@/lib/actions/novels";
import { NovelForm } from "@/components/novel-form";

export const metadata: Metadata = {
  title: "Đăng truyện mới | TruyệnHay",
};

export default async function NewNovelPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (!profile.is_author) redirect("/author");

  const supabase = await createClient();
  const genres = await getGenres(supabase);

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-text">Đăng truyện mới</h1>
      <div className="rounded-xl border border-border bg-surface/50 p-6">
        <NovelForm action={createNovel} genres={genres} submitLabel="Tạo truyện" />
      </div>
    </div>
  );
}
