const TONES = {
  accent: "bg-accent",
  violet: "bg-accent-2",
  cyan: "bg-accent-3",
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
} as const;

export type StatTone = keyof typeof TONES;

export function StatCard({
  label,
  value,
  delta,
  deltaLabel = "so với hôm qua",
  tone = "accent",
}: {
  label: string;
  value: string;
  delta?: number;
  deltaLabel?: string;
  tone?: StatTone;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${TONES[tone]}`} aria-hidden />
        <p className="text-xs text-text-muted">{label}</p>
      </div>
      <p className="mt-1.5 text-2xl font-semibold text-text">{value}</p>
      {delta !== undefined && (
        <p
          className={`mt-1 text-xs ${
            delta > 0
              ? "text-emerald-600 dark:text-emerald-400"
              : delta < 0
                ? "text-rose-600 dark:text-rose-400"
                : "text-text-muted"
          }`}
        >
          {delta > 0 ? "↗" : delta < 0 ? "↘" : "→"} {delta > 0 ? "+" : ""}
          {delta.toLocaleString("vi-VN")} {deltaLabel}
        </p>
      )}
    </div>
  );
}
