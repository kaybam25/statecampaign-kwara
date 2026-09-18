"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useElectionDayStore } from "@/lib/store/electionDay";
import { KWARA_LGAS, getWardsInLGA, getPUsInWard, getFlagship } from "@/lib/data";
import { ringPoint, RADIUS_WARD_DEG } from "@/lib/geo";
import type { MapPin } from "@/components/hierarchy/TerritoryMap";
import KpiTile from "@/components/election-day/KpiTile";
import LiveIncidentFeed from "@/components/election-day/LiveIncidentFeed";
import CrisisBanner from "@/components/election-day/CrisisBanner";
import ResultsCollationTable from "@/components/election-day/ResultsCollationTable";

const TerritoryMap = dynamic(() => import("@/components/hierarchy/TerritoryMap"), {
  ssr: false,
  loading: () => <div className="flex h-full items-center justify-center text-sm text-zinc-400">Loading map&hellip;</div>,
});

export default function ElectionDayPage() {
  const store = useElectionDayStore();
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);
  // Client-only query-param read (avoids the useSearchParams/Suspense
  // requirement — this demo has no SSR needs for a single ?lga= deep link).
  const [lgaId, setLgaId] = useState(KWARA_LGAS.find((f) => f.lgaId === "kwara__ilorin-west")?.lgaId ?? KWARA_LGAS[0].lgaId);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const requested = new URLSearchParams(window.location.search).get("lga");
      if (requested && KWARA_LGAS.some((f) => f.lgaId === requested)) {
        setLgaId(requested);
      }
    }
    // Only (re)initialize if nothing has been loaded yet — this lets the
    // presenter arrive here from the Command Center (or vice versa)
    // mid-simulation without losing progress.
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

  const flagship = getFlagship(lgaId)!;
  const lga = store.perLga[lgaId];
  const wards = getWardsInLGA(lgaId);
  const totalPUs = lga?.totalPUs ?? 0;
  const puStatus = lga?.puStatus ?? {};
  const confirmedCount = Object.values(puStatus).filter((s) => s === "agent_confirmed" || s === "result_uploaded").length;
  const resultCount = Object.values(puStatus).filter((s) => s === "result_uploaded").length;
  const lgaIncidents = store.incidents.filter((i) => i.lgaId === lgaId);
  const openIncidents = lgaIncidents.length;
  const activationRate = totalPUs ? Math.round((confirmedCount / totalPUs) * 100) : 0;
  const collationRate = totalPUs ? Math.round((resultCount / totalPUs) * 100) : 0;
  const turnoutSample = store.feed.filter((f) => f.kind === "turnout" && f.lgaId === lgaId).length;
  const lgaFeed = store.feed.filter((f) => f.kind === "alert" || f.kind === "alert_resolved" || ("lgaId" in f && f.lgaId === lgaId));

  const pins: MapPin[] = wards.map((w, i) => {
    const pus = getPUsInWard(w.id);
    const confirmed = pus.filter((pu) => puStatus[pu.id] === "agent_confirmed" || puStatus[pu.id] === "result_uploaded").length;
    const results = pus.filter((pu) => puStatus[pu.id] === "result_uploaded").length;
    const rate = pus.length ? confirmed / pus.length : 0;
    const color = rate > 0.7 ? "#1b7a43" : rate > 0.35 ? "#f59e0b" : "#dc2626";
    return {
      id: w.id,
      position: ringPoint(flagship.center, i, wards.length, RADIUS_WARD_DEG),
      label: w.name,
      sublabel: `${confirmed}/${pus.length} agents confirmed · ${results} results in`,
      color,
    };
  });

  const elapsedClock = formatClock(store.simMinutes);

  return (
    <div className="flex h-screen flex-col bg-zinc-50 p-6">
      <header className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-co-navy">Election Day Operations Center — Single-LGA Monitor</h1>
          <p className="text-xs text-zinc-500">
            Live monitoring — {flagship.lgaName} LGA, {flagship.stateName} State, {wards.length} wards, {totalPUs} polling units &middot; any of Kwara&rsquo;s 16 LGAs
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link href="/command-center" className="rounded-lg bg-co-navy px-3 py-1.5 text-xs font-semibold text-white hover:bg-co-navy/90">
            Open Command Center &rarr;
          </Link>
          <a href="/" className="text-xs text-zinc-400 underline hover:text-co-navy">
            &larr; Back to home
          </a>
        </div>
      </header>

      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3">
        <label className="flex items-center gap-2 text-xs font-medium text-zinc-500">
          Monitoring:
          <select
            value={lgaId}
            onChange={(e) => setLgaId(e.target.value)}
            className="rounded-lg border border-zinc-200 px-2 py-1.5 text-xs font-semibold text-co-navy outline-none focus:border-co-orange"
          >
            {KWARA_LGAS.map((f) => (
              <option key={f.lgaId} value={f.lgaId}>
                {f.lgaName}
              </option>
            ))}
          </select>
        </label>
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
        {store.finished && <div className="text-xs font-semibold text-co-green">Collation complete — see Reports for the full scorecard.</div>}
      </div>

      <CrisisBanner alert={store.disinfoAlert} simMinutes={store.simMinutes} />

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <KpiTile label="PU Agent Activation" value={`${activationRate}%`} sublabel={`${confirmedCount}/${totalPUs} PUs · target 90%+`} tone={activationRate >= 90 ? "green" : "amber"} />
        <KpiTile label="Results Collated" value={`${collationRate}%`} sublabel={`${resultCount}/${totalPUs} PUs reported`} tone="navy" />
        <KpiTile label="Open Incidents" value={String(openIncidents)} sublabel={`Logged in ${flagship.lgaName}`} tone={openIncidents > 0 ? "red" : "green"} />
        <KpiTile label="Turnout Updates" value={String(turnoutSample)} sublabel="Live accreditation reports" tone="navy" />
        <KpiTile
          label="Crisis Response"
          value={store.disinfoAlert ? (store.disinfoAlert.resolved ? "Resolved" : "Active") : "None"}
          sublabel={store.disinfoAlert ? "Target: <45 min" : "No incidents flagged"}
          tone={store.disinfoAlert && !store.disinfoAlert.resolved ? "red" : "green"}
        />
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="lg:col-span-2 h-64 lg:h-auto">
          <TerritoryMap pins={pins} />
        </div>
        <div className="lg:col-span-1 h-64 lg:h-auto">
          <LiveIncidentFeed items={lgaFeed} />
        </div>
        <div className="lg:col-span-2 min-h-0 overflow-y-auto">
          <ResultsCollationTable lgaId={lgaId} puStatus={puStatus} />
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
