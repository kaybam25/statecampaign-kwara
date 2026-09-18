"use client";

import type { ReactNode } from "react";

export function StepCard({
  step,
  title,
  done,
  children,
}: {
  step: number;
  title: string;
  done?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={`mb-2 rounded-xl border p-3 ${done ? "border-co-green/30 bg-co-green/5" : "border-zinc-200 bg-white"}`}>
      <div className="mb-2 flex items-center gap-2">
        <span
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${
            done ? "bg-co-green" : "bg-co-orange"
          }`}
        >
          {done ? "✓" : step}
        </span>
        <span className="text-xs font-semibold text-co-navy">{title}</span>
      </div>
      {children}
    </div>
  );
}

export function Badge({ tone, children }: { tone: "green" | "amber" | "red" | "zinc"; children: ReactNode }) {
  const cls = {
    green: "bg-co-green/10 text-co-green",
    amber: "bg-co-amber/10 text-co-amber",
    red: "bg-co-red/10 text-co-red",
    zinc: "bg-zinc-100 text-zinc-500",
  }[tone];
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${cls}`}>{children}</span>;
}

export function PrimaryButton({
  onClick,
  disabled,
  children,
  tone = "orange",
}: {
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
  tone?: "orange" | "navy" | "red" | "green";
}) {
  const cls = {
    orange: "bg-co-orange hover:bg-co-orange/90",
    navy: "bg-co-navy hover:bg-co-navy/90",
    red: "bg-co-red hover:bg-co-red/90",
    green: "bg-co-green hover:bg-co-green/90",
  }[tone];
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full rounded-lg px-3 py-2 text-xs font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-40 ${cls}`}
    >
      {children}
    </button>
  );
}

export function formatSimClock(simMinutes: number) {
  const startHour = 6;
  const totalMin = startHour * 60 + simMinutes;
  const h = Math.floor(totalMin / 60) % 24;
  const m = Math.floor(totalMin % 60);
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}
