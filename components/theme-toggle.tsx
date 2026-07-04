"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(current === "dark" ? "dark" : "light");
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      // bỏ qua nếu localStorage không khả dụng
    }
  }

  return (
    <button
      onClick={toggle}
      aria-label={theme === "dark" ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối"}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-text hover:bg-surface-hover"
    >
      {theme === "dark" ? (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4.5 w-4.5">
          <path d="M10 2a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 2zM10 15.5a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5a.75.75 0 01.75-.75zM17.25 10a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5a.75.75 0 01.75.75zM5 10a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 015 10zM15.657 5.404a.75.75 0 010-1.06l1.06-1.061a.75.75 0 111.061 1.06l-1.06 1.06a.75.75 0 01-1.061 0zM3.222 14.717a.75.75 0 010-1.06l1.06-1.061a.75.75 0 011.061 1.06l-1.06 1.061a.75.75 0 01-1.061 0zM14.596 15.657a.75.75 0 011.06 0l1.061 1.06a.75.75 0 11-1.06 1.061l-1.061-1.06a.75.75 0 010-1.061zM5.404 3.222a.75.75 0 011.06 0l1.061 1.06a.75.75 0 01-1.06 1.061l-1.061-1.06a.75.75 0 010-1.061zM10 6a4 4 0 100 8 4 4 0 000-8z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4.5 w-4.5">
          <path
            fillRule="evenodd"
            d="M7.455 2.004a.75.75 0 01.26.77 7 7 0 009.958 7.967.75.75 0 011.067.853A8.5 8.5 0 116.647 1.921a.75.75 0 01.808.083z"
            clipRule="evenodd"
          />
        </svg>
      )}
    </button>
  );
}
