export type BarDatum = { label: string; value: number };

/**
 * Biểu đồ cột đơn sắc thuần CSS cho một chuỗi dữ liệu (không cần legend).
 * Cột bo tròn 4px ở đầu dữ liệu, vuông ở chân trục; khe 2px giữa các cột;
 * giá trị chi tiết nằm trong tooltip khi rê chuột, chỉ cột lớn nhất được ghi số.
 */
export function BarChart({ data, valueSuffix = "" }: { data: BarDatum[]; valueSuffix?: string }) {
  const max = Math.max(...data.map((d) => d.value), 0);

  if (max === 0) {
    return (
      <p className="flex h-36 items-center justify-center text-sm text-text-muted">
        Chưa có dữ liệu trong khoảng thời gian này.
      </p>
    );
  }

  return (
    <div>
      <div className="flex h-36 items-end gap-0.5 border-b border-border">
        {data.map((d, i) => {
          const heightPct = (d.value / max) * 100;
          const isMax = d.value === max;
          return (
            <div key={i} className="group relative flex h-full flex-1 items-end justify-center">
              <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs text-text shadow-lg group-hover:block">
                {d.label}: {d.value.toLocaleString("vi-VN")}
                {valueSuffix}
              </div>
              {isMax && d.value > 0 && (
                <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs text-text-muted">
                  {d.value.toLocaleString("vi-VN")}
                </span>
              )}
              <div
                className="w-full max-w-6 rounded-t bg-accent transition group-hover:opacity-80"
                style={{ height: `${Math.max(heightPct, d.value > 0 ? 2 : 0)}%` }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-1.5 flex gap-0.5">
        {data.map((d, i) => (
          <span key={i} className="flex-1 truncate text-center text-[11px] text-text-muted">
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}
