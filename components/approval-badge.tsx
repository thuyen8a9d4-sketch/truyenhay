import type { NovelApprovalStatus } from "@/lib/database.types";

const LABELS: Record<NovelApprovalStatus, string> = {
  pending: "Chờ duyệt",
  approved: "Đã duyệt",
  rejected: "Bị từ chối",
};

const COLORS: Record<NovelApprovalStatus, string> = {
  pending: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  approved: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  rejected: "bg-red-500/15 text-red-600 dark:text-red-400",
};

export function ApprovalBadge({ status }: { status: NovelApprovalStatus }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${COLORS[status]}`}>
      {LABELS[status]}
    </span>
  );
}
