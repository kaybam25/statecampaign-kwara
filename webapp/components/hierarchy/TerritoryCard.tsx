"use client";

// Tailwind needs literal class names to detect at build time — no dynamic
// `text-${accent}` interpolation. Map accepted accent keys to full classes.
const ACCENT_CLASSES: Record<string, string> = {
  "co-orange": "text-co-orange",
  "co-green": "text-co-green",
  "co-blue": "text-co-blue",
  "co-purple": "text-co-purple",
};

export default function TerritoryCard({
  title,
  stats,
  onClick,
  accent = "co-orange",
  warn,
}: {
  title: string;
  stats: string[];
  onClick?: () => void;
  accent?: string;
  warn?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={`group flex flex-col items-start rounded-xl border bg-white p-4 text-left shadow-sm transition ${
        onClick ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-md" : "cursor-default opacity-90"
      } ${warn ? "border-co-red/40" : "border-zinc-200"}`}
    >
      <div className="mb-1 flex w-full items-center justify-between gap-2">
        <span className="font-semibold text-co-navy leading-tight">{title}</span>
        {warn && (
          <span className="shrink-0 rounded-full bg-co-red/10 px-2 py-0.5 text-[10px] font-medium text-co-red">
            NEEDS AGENTS
          </span>
        )}
      </div>
      <div className="flex flex-col gap-0.5 text-xs text-zinc-500">
        {stats.map((s, i) => (
          <span key={i}>{s}</span>
        ))}
      </div>
      {onClick && (
        <span
          className={`mt-2 text-xs font-medium opacity-0 transition group-hover:opacity-100 ${
            ACCENT_CLASSES[accent] ?? ACCENT_CLASSES["co-orange"]
          }`}
        >
          Drill in &rarr;
        </span>
      )}
    </button>
  );
}
