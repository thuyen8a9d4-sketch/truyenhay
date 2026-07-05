"use client";

import { useState } from "react";
import Link from "next/link";
import { BarChart } from "@/components/dashboard/bar-chart";
import { ApprovalBadge } from "@/components/approval-badge";
import { formatNumber } from "@/lib/utils";
import type { AuthorNovelOverview } from "@/lib/queries";

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-text-muted">{label}</p>
      <p className="mt-0.5 text-xl font-semibold text-text">{value}</p>
    </div>
  );
}

export function NovelPicker({ novels }: { novels: AuthorNovelOverview[] }) {
  const [selectedId, setSelectedId] = useState(novels[0]?.id ?? "");
  const novel = novels.find((n) => n.id === selectedId) ?? novels[0];

  if (!novel) {
    return (
      <div className="rounded-xl border border-dashed border-border p-10 text-center">
        <p className="text-text-muted">Bạn chưa có truyện nào.</p>
        <Link
          href="/author/new"
          className="mt-4 inline-block rounded-lg bg-accent px-5 py-2.5 font-medium text-white hover:bg-accent-hover"
        >
          + Đăng truyện mới
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-bold text-text">{novel.title}</h2>
            {novel.approval_status !== "approved" && (
              <ApprovalBadge status={novel.approval_status} />
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              href={`/author/${novel.id}/chapters/new`}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
            >
              Thêm chương mới
            </Link>
            <Link
              href={`/author/${novel.id}/chapters`}
              className="rounded-lg border border-border px-4 py-2 text-sm text-text hover:bg-surface-hover"
            >
              Quản lý chương
            </Link>
            <Link
              href={`/author/${novel.id}/edit`}
              className="rounded-lg border border-border px-4 py-2 text-sm text-text hover:bg-surface-hover"
            >
              Chi tiết
            </Link>
          </div>
        </div>

        {novels.length > 1 && (
          <select
            value={novel.id}
            onChange={(e) => setSelectedId(e.target.value)}
            aria-label="Chọn truyện"
            className="rounded-lg border border-border bg-surface px-3.5 py-2 text-sm font-medium uppercase tracking-wide text-text outline-none focus:border-accent"
          >
            {novels.map((n) => (
              <option key={n.id} value={n.id}>
                {n.title}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4 border-t border-border pt-4 sm:grid-cols-3 lg:grid-cols-5">
        <MiniStat label="Sưu tầm" value={formatNumber(novel.libraryCount)} />
        <MiniStat label="Lượt xem" value={formatNumber(novel.views)} />
        <MiniStat label="Chương" value={formatNumber(novel.chapterCount)} />
        <MiniStat label="Số chữ" value={formatNumber(novel.totalChars)} />
        <MiniStat label="Doanh thu" value={`${formatNumber(novel.revenueVnd)}đ`} />
      </div>

      <div className="mt-6">
        <h3 className="mb-4 text-sm font-semibold text-text">Lượt xem 7 ngày gần nhất</h3>
        <BarChart data={novel.views7d} valueSuffix=" lượt xem" />
      </div>
    </div>
  );
}
