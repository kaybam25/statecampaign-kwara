"use client";

import type { DisinfoAlert } from "@/lib/store/electionDay";

export default function CrisisBanner({ alert, simMinutes }: { alert: DisinfoAlert | null; simMinutes: number }) {
  if (!alert) return null;

  const elapsedSimMin = Math.max(0, simMinutes - alert.startTs);
  const remainingSimMin = Math.max(0, alert.resolveTs - simMinutes);

  if (alert.resolved) {
    return (
      <div className="mb-4 flex items-center gap-3 rounded-xl border border-co-green/30 bg-co-green/5 px-4 py-3">
        <span className="text-lg">✓</span>
        <div className="text-sm">
          <span className="font-semibold text-co-green">Crisis resolved.</span>{" "}
          <span className="text-zinc-600">
            Counter-narrative published in {Math.round(alert.resolveTs - alert.startTs)} simulated minutes — inside the &lt;45 min target.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4 flex items-center gap-3 rounded-xl border border-co-red/40 bg-co-red/5 px-4 py-3 animate-pulse">
      <span className="text-lg">⚠</span>
      <div className="flex-1 text-sm">
        <span className="font-semibold text-co-red">Disinformation Alert:</span>{" "}
        <span className="text-zinc-700">{alert.headline}</span>
      </div>
      <div className="shrink-0 rounded-lg bg-co-red px-3 py-1 text-xs font-bold text-white tabular-nums">
        {Math.round(remainingSimMin)} min to response target
      </div>
    </div>
  );
}
