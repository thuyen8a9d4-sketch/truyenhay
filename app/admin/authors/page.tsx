import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getPendingAuthorApplications } from "@/lib/queries";
import { reviewAuthorApplication } from "@/lib/actions/admin-review";
import { ReviewActions } from "@/components/review-actions";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Quản trị — Duyệt tác giả | VanThu",
};

export default async function AdminAuthorsPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (!profile.is_admin) redirect("/");

  const supabase = await createClient();
  const applications = await getPendingAuthorApplications(supabase);

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-text">Quản trị — Duyệt đơn tác giả</h1>

      {applications.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border py-16 text-center text-text-muted">
          Không có đơn nào đang chờ duyệt.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {applications.map((app) => (
            <div
              key={app.id}
              className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-border bg-surface p-4"
            >
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-text">
                  {app.applicant?.display_name ?? app.applicant?.username ?? "Ẩn danh"}
                </p>
                <p className="mt-1 whitespace-pre-line text-sm text-text-muted">{app.message}</p>
                <p className="mt-1 text-xs text-text-muted">{formatDate(app.created_at)}</p>
              </div>
              <ReviewActions
                actions={[
                  { label: "Duyệt", run: reviewAuthorApplication.bind(null, app.id, true) },
                  {
                    label: "Từ chối",
                    danger: true,
                    askReason: true,
                    run: reviewAuthorApplication.bind(null, app.id, false),
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
