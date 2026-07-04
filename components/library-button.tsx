"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleLibrary } from "@/lib/actions/library";

export function LibraryButton({
  novelId,
  novelSlug,
  initialInLibrary,
  isLoggedIn,
}: {
  novelId: string;
  novelSlug: string;
  initialInLibrary: boolean;
  isLoggedIn: boolean;
}) {
  const [inLibrary, setInLibrary] = useState(initialInLibrary);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleClick() {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    startTransition(async () => {
      const result = await toggleLibrary(novelId, novelSlug);
      if (result && "inLibrary" in result) {
        setInLibrary(result.inLibrary);
      }
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      className={`rounded-lg border px-5 py-2.5 font-medium transition disabled:opacity-60 ${
        inLibrary
          ? "border-accent bg-accent/10 text-accent"
          : "border-border bg-surface text-text hover:bg-surface-hover"
      }`}
    >
      {inLibrary ? "✓ Trong thư viện" : "+ Thêm vào thư viện"}
    </button>
  );
}
