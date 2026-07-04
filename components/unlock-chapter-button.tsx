"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { unlockChapter } from "@/lib/actions/coins";

export function UnlockChapterButton({
  chapterId,
  novelSlug,
  chapterNumber,
  priceCoins,
  walletBalance,
}: {
  chapterId: string;
  novelSlug: string;
  chapterNumber: number;
  priceCoins: number;
  walletBalance: number;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const insufficient = walletBalance < priceCoins;

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const result = await unlockChapter(chapterId, novelSlug, chapterNumber);
      if (result.success) {
        router.refresh();
      } else {
        setError(result.message);
      }
    });
  }

  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-surface p-8 text-center">
      <span className="text-3xl">🔒</span>
      <h3 className="text-lg font-bold text-text">Chương này cần mở khoá</h3>
      <p className="text-sm text-text-muted">
        Giá: <strong className="text-accent">{priceCoins} xu</strong> · Số dư của bạn:{" "}
        {walletBalance} xu
      </p>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      {insufficient ? (
        <Link
          href="/topup"
          className="gradient-accent rounded-lg px-5 py-2.5 font-medium text-white shadow-sm hover:opacity-90"
        >
          Nạp thêm xu
        </Link>
      ) : (
        <button
          onClick={handleClick}
          disabled={pending}
          className="gradient-accent rounded-lg px-5 py-2.5 font-medium text-white shadow-sm transition hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Đang mở khoá..." : `Mở khoá với ${priceCoins} xu`}
        </button>
      )}
    </div>
  );
}
