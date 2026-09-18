"use client";

import Link from "next/link";
import type { FlagshipLGA } from "@/lib/types";
import type { PUStatus } from "@/lib/types";

export default function CollationCard({
  flagship,
  puStatus,
  totalPUs,
  wardCount,
  incidentCount,
  onOpen,
}: {
  flagship: FlagshipLGA;
  puStatus: Record<string, PUStatus>;
  totalPUs: number;
  wardCount: number;
  incidentCount: number;
  onOpen: () => void;
}) {
  const confirmed = Object.values(puStatus).filter((s) => s === "agent_confirmed" || s === "result_uploaded").length;
  const results = Object.values(puStatus).filter((s) => s === "result_uploaded").length;
  const activationRate = totalPUs ? Math.round((confirmed / totalPUs) * 100) : 0;
  const collationRate = totalPUs ? Math.round((results / totalPUs) * 100) : 0;

  return (
    <button
      onClick={onOpen}
      className="flex flex-col items-start rounded-xl border border-zinc-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="mb-2 flex w-full items-center justify-between gap-2">
        <div>
          <div className="text-sm font-bold text-co-navy">{flagship.lgaName}</div>
          <div className="text-[11px] text-zinc-400">
            {flagship.stateName} State &middot; {wardCount} wards &middot; {totalPUs} PUs
          </div>
        </div>
        {incidentCount > 0 && (
          <span className="shrink-0 rounded-full bg-co-red/10 px-2 py-0.5 text-[10px] font-semibold text-co-red">{incidentCount} incident{incidentCount > 1 ? "s" : ""}</span>
        )}
      </div>

      <div className="mb-1 w-full">
        <div className="mb-0.5 flex items-center justify-between text-[11px] text-zinc-500">
          <span>Agent activation</span>
          <span className="font-semibold text-co-navy">{activationRate}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
          <div className="h-full rounded-full bg-co-green transition-all" style={{ width: `${activationRate}%` }} />
        </div>
      </div>

      <div className="mb-2 w-full">
        <div className="mb-0.5 flex items-center justify-between text-[11px] text-zinc-500">
          <span>Results collated</span>
          <span className="font-semibold text-co-navy">{collationRate}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
          <div className="h-full rounded-full bg-co-navy transition-all" style={{ width: `${collationRate}%` }} />
        </div>
      </div>

      <div className="mt-auto text-xs font-medium text-co-orange">Open LGA monitor &rarr;</div>
    </button>
  );
}
