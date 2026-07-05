import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getAuthorApplicationStatus } from "@/lib/queries";
import { AuthorApplicationForm } from "@/components/author-application-form";
import { ApprovalBadge } from "@/components/approval-badge";

export const metadata: Metadata = {
  title: "Đơn xin làm tác giả | VanThu",
};

export default async function AuthorApplyPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.is_author) redirect("/author");

  const supabase = await createClient();
  const application = await getAuthorApplicationStatus(supabase, profile.id);

  return (
    <div className="mx-auto w-full max-w-xl flex-1 px-4 py-16">
      <h1 className="mb-2 text-2xl font-bold text-text">Đơn xin làm tác giả</h1>
      <p className="mb-6 text-sm text-text-muted">
        Sau khi được quản trị viên duyệt, bạn sẽ có quyền truy cập Trang tác giả để đăng truyện.
      </p>

      <div className="rounded-xl border border-border bg-surface/50 p-6">
        {application && application.status === "pending" ? (
          <div className="flex flex-col items-center gap-2 text-center">
            <ApprovalBadge status="pending" />
            <p className="text-sm text-text-muted">
              Đơn của bạn đang chờ quản trị viên duyệt.
            </p>
          </div>
        ) : application && application.status === "rejected" ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col items-center gap-2 text-center">
              <ApprovalBadge status="rejected" />
              {application.reject_reason && (
                <p className="text-sm text-text-muted">Lý do: {application.reject_reason}</p>
              )}
            </div>
            <AuthorApplicationForm />
          </div>
        ) : (
          <AuthorApplicationForm />
        )}
      </div>
    </div>
  );
}
