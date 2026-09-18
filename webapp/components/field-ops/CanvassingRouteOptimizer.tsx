"use client";

import { useMemo, useState } from "react";
import { REAL_DATA_LGAS, getWardsInLGA, getPUsInWard } from "@/lib/data";
import { seededInt } from "@/lib/seed";

// Ranks a ward's polling units by an illustrative canvass-priority score —
// a blend of "estimated undecided voters" and "PVC holders who didn't vote
// last time" (both seeded per PU, since the demo has no real per-voter
// data). This mirrors the PVC Registration Gap Chart's honesty framing in
// Voter Intelligence: real PU names and structure, illustrative scores.

function priorityScore(puId: string) {
  const undecidedPct = seededInt(puId + "undecided", 8, 42);
  const nonVotingPvcPct = seededInt(puId + "nonvoting", 5, 38);
  const score = Math.round(undecidedPct * 0.6 + nonVotingPvcPct * 0.4);
  return { undecidedPct, nonVotingPvcPct, score };
}

export default function CanvassingRouteOptimizer() {
  const [lgaId, setLgaId] = useState(REAL_DATA_LGAS[0].lgaId);
  const wards = getWardsInLGA(lgaId);
  const [wardId, setWardId] = useState(wards[0]?.id ?? "");

  const currentWards = getWardsInLGA(lgaId);
  const effectiveWardId = currentWards.some((w) => w.id === wardId) ? wardId : currentWards[0]?.id ?? "";

  const route = useMemo(() => {
    const pus = getPUsInWard(effectiveWardId);
    return pus
      .map((pu) => ({ pu, ...priorityScore(pu.id) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);
  }, [effectiveWardId]);

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-co-navy">Canvassing Route Optimiser</h3>
        <div className="flex gap-2">
          <select
            value={lgaId}
            onChange={(e) => {
              setLgaId(e.target.value);
              setWardId(getWardsInLGA(e.target.value)[0]?.id ?? "");
            }}
            className="rounded-lg border border-zinc-200 px-2 py-1 text-xs outline-none focus:border-co-orange"
          >
            {REAL_DATA_LGAS.map((f) => (
              <option key={f.lgaId} value={f.lgaId}>
                {f.stateName} — {f.lgaName}
              </option>
            ))}
          </select>
          <select
            value={effectiveWardId}
            onChange={(e) => setWardId(e.target.value)}
            className="rounded-lg border border-zinc-200 px-2 py-1 text-xs outline-none focus:border-co-orange"
          >
            {currentWards.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <p className="mb-3 text-xs text-zinc-500">
        Top 8 polling units in this ward, ranked by estimated undecided voters + PVC holders who didn&apos;t vote last
        cycle — the suggested door-knock order for today&apos;s canvassers.
      </p>
      <div className="space-y-1.5">
        {route.map((r, idx) => (
          <div key={r.pu.id} className="flex items-center gap-3 rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-co-orange text-[11px] font-bold text-white">
              {idx + 1}
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-medium text-co-navy">{r.pu.name}</div>
              <div className="text-[10px] text-zinc-400">
                {r.undecidedPct}% undecided &middot; {r.nonVotingPvcPct}% PVC non-voters last cycle
              </div>
            </div>
            <div className="w-16 shrink-0 text-right">
              <div className="text-xs font-bold text-co-navy">{r.score}</div>
              <div className="text-[9px] uppercase tracking-wide text-zinc-400">priority</div>
            </div>
          </div>
        ))}
        {route.length === 0 && <p className="text-xs text-zinc-400">No polling units found for this ward.</p>}
      </div>
    </div>
  );
}
