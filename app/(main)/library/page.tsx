import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getLibrary } from "@/lib/queries";
import { LibraryCard } from "@/components/library-card";
import { EmptyState } from "@/components/empty-state";

export const metadata: Metadata = {
  title: "Thư viện của tôi | VanThu",
};

export default async function LibraryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const items = await getLibrary(supabase, user.id);

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-text">Thư viện của tôi</h1>
      {items.length === 0 ? (
        <EmptyState
          message="Bạn chưa lưu truyện nào."
          actionHref="/browse"
          actionLabel="Khám phá truyện"
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <LibraryCard key={item.novel.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
