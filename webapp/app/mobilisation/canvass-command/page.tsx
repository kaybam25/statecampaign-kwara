"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useCanvassStore } from "@/lib/store/canvass";
import { summarizeCoverage, estimatedFullCoverageBlockCount, PARTY_MEMBERS } from "@/lib/canvass-data";
import { REAL_DATA_LGAS, getWardsInLGA, getPUsInWard, getFlagship } from "@/lib/data";
import { KWARA_STATE_BOUNDS } from "@/lib/geo";
import { DEFAULT_BLOCK_SIZE, type WardPriorityTier } from "@/lib/types";
import type { MapPin } from "@/components/hierarchy/TerritoryMap";
import KpiTile from "@/components/election-day/KpiTile";
import { Badge } from "@/components/mobilisation/StepCard";

const TerritoryMap = dynamic(() => import("@/components/hierarchy/TerritoryMap"), {
  ssr: false,
  loading: () => <div className="flex h-full items-center justify-center text-sm text-zinc-400">Loading map&hellip;</div>,
});

// Not-started / in-progress / mostly-complete — deliberately grey rather
// than red for "not started yet", since an untouched ward this early in a
// multi-week canvass isn't an incident the way an Election Day gap is.
const NOT_STARTED_COLOR = "#a1a1aa";
const IN_PROGRESS_COLOR = "#f59e0b";
const MOSTLY_DONE_COLOR = "#1b7a43";

const PRIORITY_LABEL: Record<WardPriorityTier, string> = { 1: "P1", 2: "P2", 3: "P3" };
const PRIORITY_TONE: Record<WardPriorityTier, "red" | "amber" | "zinc"> = { 1: "red", 2: "amber", 3: "zinc" };

function nextTier(current: WardPriorityTier | undefined): WardPriorityTier | null {
  if (current === undefined) return 1;
  if (current === 1) return 2;
  if (current === 2) return 3;
  return null; // 3 -> unset
}

export default function CanvassCommandPage() {
  const canvass = useCanvassStore();
  const allBlocks = useMemo(() => Object.values(canvass.blocks), [canvass.blocks]);

  // Real PU ids per LGA/ward, computed once — this is the app's actual
  // INEC-sourced structure, not anything canvassing-specific.
  const puIdsByLga = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const f of REAL_DATA_LGAS) {
      map[f.lgaId] = getWardsInLGA(f.lgaId).flatMap((w) => getPUsInWard(w.id).map((p) => p.id));
    }
    return map;
  }, []);
  const totalPUsInScope = useMemo(() => Object.values(puIdsByLga).reduce((a, ids) => a + ids.length, 0), [puIdsByLga]);

  const [selectedLgaId, setSelectedLgaId] = useState(REAL_DATA_LGAS[0].lgaId);
  const [sortByPriority, setSortByPriority] = useState(false);

  // ---- Pilot-wide summary (across all 16 Kwara pilot LGAs/wards) ----
  const overall = summarizeCoverage(allBlocks, Object.values(puIdsByLga).flat());
  const overallCompletionPct = overall.totalBlocks ? Math.round((overall.completedBlocks / overall.totalBlocks) * 100) : 0;
  const activeMembers = new Set(allBlocks.filter((b) => b.assignedMemberId).map((b) => b.assignedMemberId)).size;

  // ---- Per-LGA map pins ----
  const pins: MapPin[] = REAL_DATA_LGAS.map((f) => {
    const lgaBlocks = allBlocks.filter((b) => b.lgaId === f.lgaId);
    const summary = summarizeCoverage(lgaBlocks, puIdsByLga[f.lgaId] ?? []);
    const rate = summary.totalBlocks ? summary.completedBlocks / summary.totalBlocks : 0;
    const color = summary.totalBlocks === 0 ? NOT_STARTED_COLOR : rate >= 0.5 ? MOSTLY_DONE_COLOR : IN_PROGRESS_COLOR;
    return {
      id: f.lgaId,
      position: f.center,
      label: f.lgaName,
      sublabel:
        summary.totalBlocks === 0
          ? "Canvassing not started"
          : `${summary.completedBlocks}/${summary.totalBlocks} blocks complete · ${summary.totalPUsCovered}/${summary.totalPUs} PUs touched`,
      color,
      onClick: () => setSelectedLgaId(f.lgaId),
    };
  });

  // ---- Ward-level table for the selected LGA ----
  const wardRows = useMemo(() => {
    const wards = getWardsInLGA(selectedLgaId);
    const rows = wards.map((w) => {
      const wardPUIds = getPUsInWard(w.id).map((p) => p.id);
      const wardBlocks = allBlocks.filter((b) => b.wardId === w.id);
      const summary = summarizeCoverage(wardBlocks, wardPUIds);
      const fullTarget = estimatedFullCoverageBlockCount(wardPUIds, DEFAULT_BLOCK_SIZE);
      const priority = canvass.wardPriority[w.id];
      return { ward: w, summary, fullTarget, priority };
    });
    if (!sortByPriority) return rows;
    return [...rows].sort((a, b) => (a.priority ?? 4) - (b.priority ?? 4));
  }, [selectedLgaId, allBlocks, canvass.wardPriority, sortByPriority]);

  const selectedFlagship = getFlagship(selectedLgaId);

  return (
    <div className="min-h-screen bg-zinc-50 p-6">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-co-navy">Canvassing Coverage — Command Center</h1>
          <p className="text-xs text-zinc-500">
            Pre-election canvass progress across all {REAL_DATA_LGAS.length} Kwara State LGAs — geography and polling-unit counts are
            real INEC data; coverage figures reflect only the polling units a coordinator has actually opened.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/mobilisation/party-member" className="rounded-lg bg-co-green px-3 py-1.5 text-xs font-semibold text-white hover:bg-co-green/90">
            Party Member App &rarr;
          </Link>
          <Link href="/mobilisation/command" className="rounded-lg bg-co-navy px-3 py-1.5 text-xs font-semibold text-white hover:bg-co-navy/90">
            Election Day Admin &rarr;
          </Link>
          <Link href="/modules/mobilisation" className="text-xs text-zinc-400 underline hover:text-co-navy">
            &larr; Mobilisation Hub
          </Link>
        </div>
      </header>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <KpiTile label="Blocks Generated" value={overall.totalBlocks.toLocaleString()} sublabel="Across all opened polling units" tone="navy" />
        <KpiTile
          label="Blocks Completed"
          value={`${overallCompletionPct}%`}
          sublabel={`${overall.completedBlocks}/${overall.totalBlocks} blocks`}
          tone={overallCompletionPct >= 50 ? "green" : "amber"}
        />
        <KpiTile
          label="PUs Touched"
          value={`${overall.totalPUsCovered}/${totalPUsInScope.toLocaleString()}`}
          sublabel="Pilot scope only — see caption"
          tone="navy"
        />
        <KpiTile label="Active Pilot Members" value={`${activeMembers}/${PARTY_MEMBERS.length}`} sublabel="Claimed at least one block" tone="navy" />
        <KpiTile
          label="Unassigned Blocks"
          value={overall.unassignedBlocks.toLocaleString()}
          sublabel="Generated but not yet claimed"
          tone={overall.unassignedBlocks > 0 ? "amber" : "green"}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_420px]">
        <div className="h-[420px] overflow-hidden rounded-xl border border-zinc-200 bg-white">
          <TerritoryMap pins={pins} maxBounds={KWARA_STATE_BOUNDS} regionLabel="Kwara State" />
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">Legend</div>
          <div className="space-y-1.5 text-[11px] text-zinc-600">
            <LegendRow color={NOT_STARTED_COLOR} label="Canvassing not started" />
            <LegendRow color={IN_PROGRESS_COLOR} label="Blocks generated, under 50% complete" />
            <LegendRow color={MOSTLY_DONE_COLOR} label="50%+ of generated blocks complete" />
          </div>
          <p className="mt-3 text-[11px] text-zinc-400">
            Click any LGA pin to load its wards below. Coverage is measured against blocks a coordinator has generated, not the full theoretical
            state total — see the Pre-Election Canvassing Framework report, Section 7, for why full-state coverage is phased rather than immediate.
          </p>
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 px-4 py-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Wards in</span>
            <select
              value={selectedLgaId}
              onChange={(e) => setSelectedLgaId(e.target.value)}
              className="rounded-lg border border-zinc-200 px-2 py-1 text-xs font-semibold text-co-navy outline-none focus:border-co-green"
            >
              {REAL_DATA_LGAS.map((f) => (
                <option key={f.lgaId} value={f.lgaId}>
                  {f.lgaName}, {f.stateName}
                </option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-1.5 text-[11px] text-zinc-500">
            <input type="checkbox" checked={sortByPriority} onChange={(e) => setSortByPriority(e.target.checked)} />
            Sort by priority
          </label>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-zinc-50 text-[10px] uppercase tracking-wide text-zinc-400">
              <tr>
                <th className="px-3 py-2 text-left">Ward</th>
                <th className="px-3 py-2 text-left">PUs Touched</th>
                <th className="px-3 py-2 text-left">Blocks (Completed/Assigned/Unassigned)</th>
                <th className="px-3 py-2 text-left">% of Full-Ward Target*</th>
                <th className="px-3 py-2 text-left">Priority</th>
              </tr>
            </thead>
            <tbody>
              {wardRows.map(({ ward, summary, fullTarget, priority }) => {
                const pctOfTarget = fullTarget ? Math.round((summary.totalBlocks / fullTarget) * 100) : 0;
                return (
                  <tr key={ward.id} className="border-t border-zinc-100">
                    <td className="px-3 py-2 font-medium text-co-navy">{ward.name}</td>
                    <td className="px-3 py-2 text-zinc-500">
                      {summary.totalPUsCovered}/{summary.totalPUs}
                    </td>
                    <td className="px-3 py-2 text-zinc-500">
                      {summary.completedBlocks}/{summary.assignedBlocks}/{summary.unassignedBlocks}
                    </td>
                    <td className="px-3 py-2 text-zinc-500">
                      {summary.totalBlocks} of ~{fullTarget} ({pctOfTarget}%)
                    </td>
                    <td className="px-3 py-2">
                      <button
                        onClick={() => canvass.setWardPriority(ward.id, nextTier(priority))}
                        title="Click to cycle: unset -> P1 -> P2 -> P3 -> unset"
                      >
                        {priority ? <Badge tone={PRIORITY_TONE[priority]}>{PRIORITY_LABEL[priority]}</Badge> : <Badge tone="zinc">Unset</Badge>}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="border-t border-zinc-100 px-4 py-2 text-[11px] text-zinc-400">
          *Full-ward target is illustrative — the block count this ward would need at the default {DEFAULT_BLOCK_SIZE}-voter size if every polling
          unit were fully cut, based on the same seeded per-PU voter estimate used throughout this demo (not a certified count). Priority tiers are
          set here by a coordinator, not derived from any swing/turnout model — {selectedFlagship?.stateName ?? "this state"} has no ward-level
          scoring data in this build.
        </p>
      </div>
    </div>
  );
}

function LegendRow({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </div>
  );
}
