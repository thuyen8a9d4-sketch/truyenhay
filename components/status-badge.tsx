import { statusLabel } from "@/lib/utils";
import type { NovelStatus } from "@/lib/database.types";

const COLORS: Record<NovelStatus, string> = {
  ongoing: "bg-emerald-500/15 text-emerald-400",
  completed: "bg-sky-500/15 text-sky-400",
  hiatus: "bg-amber-500/15 text-amber-400",
};

export function StatusBadge({ status }: { status: NovelStatus }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${COLORS[status]}`}
    >
      {statusLabel(status)}
    </span>
  );
}
