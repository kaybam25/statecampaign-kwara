"use client";

export default function KpiTile({
  label,
  value,
  sublabel,
  tone = "navy",
}: {
  label: string;
  value: string;
  sublabel?: string;
  tone?: "navy" | "green" | "red" | "amber";
}) {
  const toneClass = {
    navy: "text-co-navy",
    green: "text-co-green",
    red: "text-co-red",
    amber: "text-co-amber",
  }[tone];

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <div className={`text-2xl font-bold tabular-nums ${toneClass}`}>{value}</div>
      <div className="text-xs font-medium text-zinc-500">{label}</div>
      {sublabel && <div className="mt-0.5 text-[11px] text-zinc-400">{sublabel}</div>}
    </div>
  );
}
