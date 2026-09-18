"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import Breadcrumb from "@/components/hierarchy/Breadcrumb";
import TerritoryCard from "@/components/hierarchy/TerritoryCard";
import type { MapPin } from "@/components/hierarchy/TerritoryMap";
import {
  zones,
  states,
  getStatesInZone,
  getLGAsInState,
  getLGA,
  getState,
  getWardsInLGA,
  getPUsInWard,
  getFlagship,
  national,
} from "@/lib/data";
import { getStateCoords, ringPoint, RADIUS_LGA_DEG, RADIUS_WARD_DEG, RADIUS_PU_DEG } from "@/lib/geo";
import { seededCoveragePct } from "@/lib/seed";

const TerritoryMap = dynamic(() => import("@/components/hierarchy/TerritoryMap"), {
  ssr: false,
  loading: () => <div className="flex h-full items-center justify-center text-sm text-zinc-400">Loading map&hellip;</div>,
});

type Level = "national" | "zone" | "state" | "lga" | "ward";

type NavState = {
  level: Level;
  zoneId?: string;
  stateId?: string;
  lgaId?: string;
  wardId?: string;
};

export default function TerritoryPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center text-sm text-zinc-400">Loading&hellip;</div>}>
      <TerritoryPageInner />
    </Suspense>
  );
}

function TerritoryPageInner() {
  const [nav, setNav] = useState<NavState>({ level: "national" });
  const searchParams = useSearchParams();

  // Support deep-linking straight to an LGA, e.g. from the homepage's Kwara
  // LGA grid: /territory?lga=kwara__ilorin-west jumps directly to that LGA's
  // ward list instead of starting at National.
  useEffect(() => {
    const requestedLgaId = searchParams.get("lga");
    if (!requestedLgaId) return;
    const lga = getLGA(requestedLgaId);
    if (!lga) return;
    const state = getState(lga.stateId);
    if (!state || !state.zoneId) return;
    setNav({ level: "lga", zoneId: state.zoneId, stateId: state.id, lgaId: lga.id });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goNational = () => setNav({ level: "national" });
  const goZone = (zoneId: string) => setNav({ level: "zone", zoneId });
  const goState = (zoneId: string, stateId: string) => setNav({ level: "state", zoneId, stateId });
  const goLGA = (zoneId: string, stateId: string, lgaId: string) =>
    setNav({ level: "lga", zoneId, stateId, lgaId });
  const goWard = (zoneId: string, stateId: string, lgaId: string, wardId: string) =>
    setNav({ level: "ward", zoneId, stateId, lgaId, wardId });

  const crumbs = useMemo(() => {
    const c = [{ label: "National", onClick: goNational }];
    if (nav.zoneId) {
      const z = zones.find((z) => z.id === nav.zoneId)!;
      c.push({ label: z.name, onClick: () => goZone(nav.zoneId!) });
    }
    if (nav.stateId) {
      const s = states.find((s) => s.id === nav.stateId)!;
      c.push({ label: s.name, onClick: () => goState(nav.zoneId!, nav.stateId!) });
    }
    if (nav.lgaId) {
      const l = getLGA(nav.lgaId)!;
      c.push({ label: l.name, onClick: () => goLGA(nav.zoneId!, nav.stateId!, nav.lgaId!) });
    }
    if (nav.wardId) {
      const w = getWardsInLGA(nav.lgaId!).find((w) => w.id === nav.wardId)!;
      c.push({ label: w.name, onClick: () => goWard(nav.zoneId!, nav.stateId!, nav.lgaId!, nav.wardId!) });
    }
    return c;
  }, [nav]);

  // --- Build cards + map pins for the current level ---
  let title = "";
  let cards: { key: string; title: string; stats: string[]; warn?: boolean; onClick?: () => void }[] = [];
  let pins: MapPin[] = [];

  if (nav.level === "national") {
    title = `National — ${zones.length} zones, ${national.totalWards.toLocaleString()} wards, ${national.totalPollingUnits.toLocaleString()} polling units`;
    cards = zones.map((z) => {
      const zStates = getStatesInZone(z.id);
      const wardSum = zStates.reduce((a, s) => a + s.wardCount, 0);
      return {
        key: z.id,
        title: z.name,
        stats: [`${zStates.length} states`, `${wardSum.toLocaleString()} wards (est.)`],
        onClick: () => goZone(z.id),
      };
    });
    pins = zones.map((z) => {
      const zStates = getStatesInZone(z.id);
      const avg = zStates.reduce(
        (acc, s) => {
          const c = getStateCoords(s.name);
          return { lat: acc.lat + c.lat / zStates.length, lng: acc.lng + c.lng / zStates.length };
        },
        { lat: 0, lng: 0 }
      );
      return { id: z.id, position: avg, label: z.name, sublabel: `${zStates.length} states`, color: "#e85d2c", onClick: () => goZone(z.id) };
    });
  } else if (nav.level === "zone") {
    const z = zones.find((z) => z.id === nav.zoneId)!;
    const zStates = getStatesInZone(z.id);
    title = `${z.name} — ${zStates.length} states`;
    cards = zStates.map((s) => ({
      key: s.id,
      title: s.name,
      stats: [`${s.lgaCount} LGAs`, `${s.wardCount.toLocaleString()} wards (est.)`, `${s.puCount.toLocaleString()} PUs (est.)`],
      onClick: () => goState(z.id, s.id),
    }));
    pins = zStates.map((s) => ({
      id: s.id,
      position: getStateCoords(s.name),
      label: s.name,
      sublabel: `${s.lgaCount} LGAs`,
      color: "#2563eb",
      onClick: () => goState(z.id, s.id),
    }));
  } else if (nav.level === "state") {
    const s = states.find((s) => s.id === nav.stateId)!;
    const lgas = getLGAsInState(s.id);
    const center = getStateCoords(s.name);
    title = `${s.name} — ${lgas.length} LGAs`;
    cards = lgas.map((l) => {
      const cov = seededCoveragePct(l.id);
      return {
        key: l.id,
        title: l.name,
        stats: [
          l.hasRealWardData ? `${l.wardCount} wards · ${l.puCount} PUs (real INEC data)` : `${l.wardCount} wards (est.) · ${l.puCount.toLocaleString()} PUs (est.)`,
          `Agent coverage: ${cov}%`,
        ],
        warn: cov < 65,
        onClick: () => goLGA(nav.zoneId!, s.id, l.id),
      };
    });
    pins = lgas.map((l, i) => ({
      id: l.id,
      position: ringPoint(center, i, lgas.length, RADIUS_LGA_DEG),
      label: l.name,
      sublabel: l.hasRealWardData ? "Real ward data" : `${l.wardCount} wards (est.)`,
      color: l.hasRealWardData ? "#1b7a43" : "#7c3aed",
      onClick: () => goLGA(nav.zoneId!, s.id, l.id),
    }));
  } else if (nav.level === "lga") {
    const l = getLGA(nav.lgaId!)!;
    const flagship = getFlagship(l.id);
    const wards = getWardsInLGA(l.id);
    title = `${l.name} — ${l.hasRealWardData ? `${wards.length} wards (real INEC data)` : "ward-level data not yet loaded for this LGA"}`;
    if (l.hasRealWardData && flagship) {
      const center = flagship.center;
      cards = wards.map((w) => {
        const cov = seededCoveragePct(w.id);
        return {
          key: w.id,
          title: w.name,
          stats: [`${w.puCount} polling units`, `Agent coverage: ${cov}%`],
          warn: cov < 65,
          onClick: () => goWard(nav.zoneId!, nav.stateId!, l.id, w.id),
        };
      });
      pins = wards.map((w, i) => ({
        id: w.id,
        position: ringPoint(center, i, wards.length, RADIUS_WARD_DEG),
        label: w.name,
        sublabel: `${w.puCount} PUs`,
        color: "#1b7a43",
        onClick: () => goWard(nav.zoneId!, nav.stateId!, l.id, w.id),
      }));
    } else {
      cards = [
        {
          key: "pending",
          title: "Ward-level detail not yet built for this LGA",
          stats: [
            `${l.wardCount} wards / ${l.puCount.toLocaleString()} PUs estimated from national totals`,
            "Full drill-down is live for all 16 Kwara State LGAs, plus 5 more flagship LGAs nationwide — one per other geopolitical zone",
          ],
        },
      ];
    }
  } else if (nav.level === "ward") {
    const l = getLGA(nav.lgaId!)!;
    const flagship = getFlagship(l.id)!;
    const wards = getWardsInLGA(l.id);
    const w = wards.find((w) => w.id === nav.wardId)!;
    const pus = getPUsInWard(w.id);
    const center = ringPoint(flagship.center, wards.indexOf(w), wards.length, RADIUS_WARD_DEG);
    title = `${w.name} — ${pus.length} real polling units (INEC code ${w.code})`;
    cards = pus.map((pu) => ({
      key: pu.id,
      title: pu.name,
      stats: [`Code ${pu.code}`],
    }));
    pins = pus.map((pu, i) => ({
      id: pu.id,
      position: ringPoint(center, i, pus.length, RADIUS_PU_DEG),
      label: pu.name,
      sublabel: pu.code,
      color: "#0f766e",
    }));
  }

  return (
    <div className="flex h-screen flex-col bg-zinc-50 p-6">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-co-navy">Territory Navigator</h1>
          <p className="text-xs text-zinc-500">National &rarr; Zone &rarr; State &rarr; LGA &rarr; Ward &rarr; Polling Unit</p>
        </div>
        <a href="/" className="text-xs text-zinc-400 underline hover:text-co-navy">
          &larr; Back to home
        </a>
      </header>

      <Breadcrumb crumbs={crumbs} />

      <div className="mb-3 text-sm font-medium text-zinc-600">{title}</div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="order-2 min-h-0 overflow-y-auto lg:order-1 lg:col-span-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {cards.map((c) => (
              <TerritoryCard key={c.key} title={c.title} stats={c.stats} warn={c.warn} onClick={c.onClick} />
            ))}
          </div>
        </div>
        <div className="order-1 h-72 lg:order-2 lg:col-span-2 lg:h-auto">
          <TerritoryMap pins={pins} />
        </div>
      </div>
    </div>
  );
}
