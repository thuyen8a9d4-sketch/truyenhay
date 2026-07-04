"use client";

import { useEffect, useState } from "react";

type Theme = "dark" | "light" | "sepia";

const THEMES: Record<Theme, { bg: string; text: string; label: string }> = {
  dark: { bg: "#14171c", text: "#e6e8eb", label: "Tối" },
  light: { bg: "#ffffff", text: "#1a1a1a", label: "Sáng" },
  sepia: { bg: "#f1e7d0", text: "#3b2f1e", label: "Sepia" },
};

function readStoredPrefs(): { fontSize: number; theme: Theme } {
  const defaults = { fontSize: 18, theme: "dark" as Theme };
  try {
    const saved = localStorage.getItem("reader-settings");
    if (!saved) return defaults;
    const parsed = JSON.parse(saved) as { fontSize?: number; theme?: Theme };
    return {
      fontSize: parsed.fontSize ?? defaults.fontSize,
      theme: parsed.theme ?? defaults.theme,
    };
  } catch {
    return defaults;
  }
}

export function ReaderSettings({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [fontSize, setFontSize] = useState(18);
  const [theme, setTheme] = useState<Theme>("dark");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Đồng bộ một lần từ localStorage sau khi mount (client-only), tránh lệch hydration.
    const prefs = readStoredPrefs();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFontSize(prefs.fontSize);
    setTheme(prefs.theme);
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) {
      localStorage.setItem("reader-settings", JSON.stringify({ fontSize, theme }));
    }
  }, [fontSize, theme, ready]);

  const current = THEMES[theme];

  return (
    <div>
      <div className="mb-4 flex items-center justify-end">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-text hover:bg-surface-hover"
        >
          ⚙ Cài đặt đọc
        </button>
      </div>

      {open && (
        <div className="mb-4 flex flex-wrap items-center gap-5 rounded-lg border border-border bg-surface p-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-text-muted">Cỡ chữ</span>
            <button
              onClick={() => setFontSize((s) => Math.max(14, s - 1))}
              className="h-7 w-7 rounded border border-border text-text hover:bg-surface-hover"
            >
              −
            </button>
            <span className="w-6 text-center text-sm text-text">{fontSize}</span>
            <button
              onClick={() => setFontSize((s) => Math.min(28, s + 1))}
              className="h-7 w-7 rounded border border-border text-text hover:bg-surface-hover"
            >
              +
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-text-muted">Nền</span>
            {(Object.keys(THEMES) as Theme[]).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`rounded-full border px-3 py-1 text-xs transition ${
                  theme === t
                    ? "border-accent text-accent"
                    : "border-border text-text-muted hover:text-text"
                }`}
              >
                {THEMES[t].label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div
        className="reader-content rounded-xl p-6 transition-colors"
        style={{ background: current.bg, color: current.text, fontSize: `${fontSize}px` }}
      >
        {children}
      </div>
    </div>
  );
}
