"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useElectionDayStore } from "@/lib/store/electionDay";
import { KWARA_LGAS, getWardsInLGA } from "@/lib/data";
import { KWARA_STATE_BOUNDS } from "@/lib/geo";
import type { MapPin } from "@/components/hierarchy/TerritoryMap";
import KpiTile from "@/components/election-day/KpiTile";
import LiveIncidentFeed from "@/components/election-day/LiveIncidentFeed";
import CrisisBanner from "@/components/election-day/CrisisBanner";
import CollationCard from "@/components/election-day/CollationCard";

const TerritoryMap = dynamic(() => import("@/components/hierarchy/TerritoryMap"), {
  ssr: false,
  loading: () => <div className="flex h-full items-center justify-center text-sm text-zinc-400">Loading map&hellip;</div>,
});

export default function CommandCenterPage() {
  const store = useElectionDayStore();
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);

  useEffect(() => {
    // Only (re)initialize if nothing has been loaded yet — this lets the
    // presenter jump here after already starting the simulation on the
    // single-LGA Monitor page without losing progress.
    if (Object.keys(store.perLga).length === 0) store.init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function loop(ts: number) {
      if (lastTsRef.current == null) lastTsRef.current = ts;
      const delta = ts - lastTsRef.current;
      lastTsRef.current = ts;
      useElectionDayStore.getState().tick(delta);
      rafRef.current = requestAnimationFrame(loop);
    }
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const totals = KWARA_LGAS.reduce(
    (acc, f) => {
      const lga = store.perLga[f.lgaId];
      const totalPUs = lga?.totalPUs ?? 0;
      const statuses = Object.values(lga?.puStatus ?? {});
      const confirmed = statuses.filter((s) => s === "agent_confirmed" || s === "result_uploaded").length;
      const results = statuses.filter((s) => s === "result_uploaded").length;
      return {
        totalPUs: acc.totalPUs + totalPUs,
        confirmed: acc.confirmed + confirmed,
        results: acc.results + results,
      };
    },
    { totalPUs: 0, confirmed: 0, results: 0 }
  );
  const activationRate = totals.totalPUs ? Math.round((totals.confirmed / totals.totalPUs) * 100) : 0;
  const collationRate = totals.totalPUs ? Math.round((totals.results / totals.totalPUs) * 100) : 0;
  const totalWards = KWARA_LGAS.reduce((a, f) => a + getWardsInLGA(f.lgaId).length, 0);
  const turnoutSample = store.feed.filter((f) => f.kind === "turnout").length;

  const pins: MapPin[] = KWARA_LGAS.map((f) => {
    const lga = store.perLga[f.lgaId];
    const totalPUs = lga?.totalPUs ?? 0;
    const statuses = Object.values(lga?.puStatus ?? {});
    const confirmed = statuses.filter((s) => s === "agent_confirmed" || s === "result_uploaded").length;
    const results = statuses.filter((s) => s === "result_uploaded").length;
    const rate = totalPUs ? confirmed / totalPUs : 0;
    const color = rate > 0.7 ? "#1b7a43" : rate > 0.35 ? "#f59e0b" : "#dc2626";
    return {
      id: f.lgaId,
      position: f.center,
      label: f.lgaName,
      sublabel: `${confirmed}/${totalPUs} agents confirmed · ${results} results in`,
      color,
    };
  });

  const elapsedClock = formatClock(store.simMinutes);

  return (
    <div className="flex h-screen flex-col bg-zinc-50 p-6">
      <header className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-co-navy">Kwara State Command Center</h1>
          <p className="text-xs text-zinc-500">
            All 16 Kwara LGAs live at once &middot; {totalWards} wards &middot; {totals.totalPUs.toLocaleString()} polling units monitored
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link href="/election-day" className="rounded-lg bg-white border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-co-navy hover:bg-zinc-50">
            Single-LGA Monitor
          </Link>
          <a href="/" className="text-xs text-zinc-400 underline hover:text-co-navy">
            &larr; Back to home
          </a>
        </div>
      </header>

      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3">
        <div className="text-sm font-semibold text-co-navy tabular-nums">Election Day clock: {elapsedClock}</div>
        <div className="flex gap-2">
          {!store.running && !store.finished && (
            <button onClick={() => store.start()} className="rounded-lg bg-co-orange px-3 py-1.5 text-xs font-semibold text-white hover:bg-co-orange/90">
              {store.simMinutes === 0 ? "Start Simulation" : "Resume"}
            </button>
          )}
          {store.running && (
            <button onClick={() => store.pause()} className="rounded-lg bg-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-300">
              Pause
            </button>
          )}
          <button onClick={() => store.reset()} className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-500 hover:bg-zinc-50">
            Reset
          </button>
        </div>
        <div className="ml-auto flex items-center gap-1 text-xs">
          <span className="mr-1 text-zinc-400">Speed:</span>
          {[1, 5, 20].map((s) => (
            <button
              key={s}
              onClick={() => store.setSpeed(s as 1 | 5 | 20)}
              className={`rounded px-2 py-1 font-semibold ${
                store.speed === s ? "bg-co-navy text-white" : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
        {store.finished && <div className="text-xs font-semibold text-co-green">Collation complete across all 16 Kwara LGAs — see Reports for the full scorecard.</div>}
      </div>

      <CrisisBanner alert={store.disinfoAlert} simMinutes={store.simMinutes} />

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <KpiTile label="Agent Activation (Kwara)" value={`${activationRate}%`} sublabel={`${totals.confirmed}/${totals.totalPUs} PUs · target 90%+`} tone={activationRate >= 90 ? "green" : "amber"} />
        <KpiTile label="Results Collated (Kwara)" value={`${collationRate}%`} sublabel={`${totals.results}/${totals.totalPUs} PUs reported`} tone="navy" />
        <KpiTile label="Open Incidents" value={String(store.incidents.length)} sublabel="Across all 16 LGAs" tone={store.incidents.length > 0 ? "red" : "green"} />
        <KpiTile label="Turnout Updates" value={String(turnoutSample)} sublabel="Live accreditation reports, statewide" tone="navy" />
        <KpiTile
          label="Crisis Response"
          value={store.disinfoAlert ? (store.disinfoAlert.resolved ? "Resolved" : "Active") : "None"}
          sublabel={store.disinfoAlert ? "Target: <45 min" : "No incidents flagged"}
          tone={store.disinfoAlert && !store.disinfoAlert.resolved ? "red" : "green"}
        />
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="lg:col-span-2 flex h-64 flex-col lg:h-auto">
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
            Kwara State — 16 of 16 LGAs monitored
          </div>
          <div className="min-h-0 flex-1">
            <TerritoryMap pins={pins} maxBounds={KWARA_STATE_BOUNDS} regionLabel="Kwara State" />
          </div>
        </div>
        <div className="lg:col-span-1 h-64 lg:h-auto">
          <LiveIncidentFeed items={store.feed} />
        </div>
        <div className="lg:col-span-2 min-h-0 overflow-y-auto">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {KWARA_LGAS.map((f) => {
              const lga = store.perLga[f.lgaId];
              const incidentCount = store.incidents.filter((i) => i.lgaId === f.lgaId).length;
              return (
                <CollationCard
                  key={f.lgaId}
                  flagship={f}
                  puStatus={lga?.puStatus ?? {}}
                  totalPUs={lga?.totalPUs ?? 0}
                  wardCount={getWardsInLGA(f.lgaId).length}
                  incidentCount={incidentCount}
                  onOpen={() => (window.location.href = `/election-day?lga=${f.lgaId}`)}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatClock(simMinutes: number) {
  const startHour = 6;
  const totalMin = startHour * 60 + simMinutes;
  const h = Math.floor(totalMin / 60) % 24;
  const m = Math.floor(totalMin % 60);
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}
