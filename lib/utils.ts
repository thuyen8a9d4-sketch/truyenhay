export function slugify(input: string): string {
  const from = "àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ";
  const to = "aaaaaaaaaaaaaaaaaeeeeeeeeeeeiiiiiooooooooooooooooouuuuuuuuuuuyyyyyd";

  let result = input.toLowerCase();
  for (let i = 0; i < from.length; i++) {
    result = result.replaceAll(from[i], to[i]);
  }

  return result
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return `${n}`;
}

const GENRE_COLORS = [
  "bg-rose-500/12 text-rose-600 dark:text-rose-400",
  "bg-violet-500/12 text-violet-600 dark:text-violet-400",
  "bg-sky-500/12 text-sky-600 dark:text-sky-400",
  "bg-amber-500/12 text-amber-600 dark:text-amber-400",
  "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400",
  "bg-fuchsia-500/12 text-fuchsia-600 dark:text-fuchsia-400",
  "bg-cyan-500/12 text-cyan-600 dark:text-cyan-400",
  "bg-orange-500/12 text-orange-600 dark:text-orange-400",
];

export function genreColorClass(genreId: number): string {
  return GENRE_COLORS[genreId % GENRE_COLORS.length];
}

const COVER_GRADIENTS = [
  "linear-gradient(135deg, #ff5a36, #ff9a5a)",
  "linear-gradient(135deg, #8b5cf6, #ec4899)",
  "linear-gradient(135deg, #06b6d4, #3b82f6)",
  "linear-gradient(135deg, #f59e0b, #ef4444)",
  "linear-gradient(135deg, #10b981, #06b6d4)",
  "linear-gradient(135deg, #d946ef, #f43f5e)",
];

export function coverGradient(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return COVER_GRADIENTS[hash % COVER_GRADIENTS.length];
}

export function statusLabel(status: string): string {
  switch (status) {
    case "ongoing":
      return "Đang ra";
    case "completed":
      return "Hoàn thành";
    case "hiatus":
      return "Tạm ngưng";
    default:
      return status;
  }
}
