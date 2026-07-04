"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import type { Genre } from "@/lib/database.types";

export function NavGenreMenu({ genres }: { genres: Genre[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-text hover:bg-surface-hover"
      >
        Thể loại
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`h-3.5 w-3.5 transition ${open ? "rotate-180" : ""}`}
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-20 mt-2 grid w-[520px] max-w-[90vw] grid-cols-3 gap-1 rounded-xl border border-border bg-surface p-3 shadow-xl">
          {genres.map((genre) => (
            <Link
              key={genre.id}
              href={`/browse?genre=${genre.slug}`}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2 text-sm text-text hover:bg-surface-hover"
            >
              {genre.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
