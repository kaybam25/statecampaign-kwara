import { create } from "zustand";
import type { ElectionDayEvent, PUStatus } from "@/lib/types";
import { buildEventScript, SIM_TOTAL_MINUTES, DISINFO_ALERT_TS, DISINFO_RESOLVE_TS } from "@/lib/sim/events";
import { KWARA_LGAS, getWardsInLGA, getPUsInWard } from "@/lib/data";

// The Election Day store runs ONE shared simulated election day across all
// 16 Kwara State LGAs at once (each with its own deterministic, independently
// seeded event script). This lets the presenter switch freely between the
// single-LGA Monitor view and the Kwara-wide Command Center mid-simulation
// without restarting anything — it's the same election day, different
// zoom level. (Re-scoped from Lagos's 20 LGAs to Kwara's 16 for the Kwara
// PDP-hierarchy pitch.)

export type Incident = {
  id: string;
  lgaId: string;
  puId: string;
  severity: "low" | "medium" | "high";
  note: string;
  ts: number;
};

export type DisinfoAlert = {
  headline: string;
  startTs: number;
  resolveTs: number;
  resolved: boolean;
};

export type FeedItem =
  | { kind: "checkin"; lgaId: string; puId: string; ts: number }
  | { kind: "turnout"; lgaId: string; puId: string; accredited: number; ts: number }
  | { kind: "result"; lgaId: string; puId: string; ts: number }
  | { kind: "incident"; lgaId: string; puId: string; severity: string; note: string; ts: number }
  | { kind: "alert"; headline: string; ts: number }
  | { kind: "alert_resolved"; headline: string; ts: number };

type Speed = 1 | 5 | 20;

export type LgaSimState = {
  script: ElectionDayEvent[];
  cursor: number;
  puStatus: Record<string, PUStatus>;
  totalPUs: number;
};

type ElectionDayState = {
  perLga: Record<string, LgaSimState>;
  simMinutes: number;
  running: boolean;
  finished: boolean;
  speed: Speed;
  incidents: Incident[];
  disinfoAlert: DisinfoAlert | null;
  feed: FeedItem[];

  init: () => void;
  start: () => void;
  pause: () => void;
  reset: () => void;
  setSpeed: (s: Speed) => void;
  tick: (deltaMs: number) => void;
};

const MINUTES_PER_SECOND_AT_1X = 5; // full 600-min day plays out in ~120s at 1x

function buildInitialPerLga(): Record<string, LgaSimState> {
  const out: Record<string, LgaSimState> = {};
  for (const f of KWARA_LGAS) {
    const pus = getWardsInLGA(f.lgaId).flatMap((w) => getPUsInWard(w.id));
    out[f.lgaId] = {
      script: buildEventScript(pus, f.lgaId),
      cursor: 0,
      puStatus: {},
      totalPUs: pus.length,
    };
  }
  return out;
}

export const useElectionDayStore = create<ElectionDayState>((set, get) => ({
  perLga: {},
  simMinutes: 0,
  running: false,
  finished: false,
  speed: 1,
  incidents: [],
  disinfoAlert: null,
  feed: [],

  init: () => {
    set({
      perLga: buildInitialPerLga(),
      simMinutes: 0,
      running: false,
      finished: false,
      incidents: [],
      disinfoAlert: null,
      feed: [],
    });
  },

  start: () => set({ running: true }),
  pause: () => set({ running: false }),
  setSpeed: (s) => set({ speed: s }),

  reset: () => {
    get().init();
  },

  tick: (deltaMs: number) => {
    const state = get();
    if (!state.running || state.finished) return;

    const deltaMinutes = (deltaMs / 1000) * MINUTES_PER_SECOND_AT_1X * state.speed;
    const simMinutes = Math.min(state.simMinutes + deltaMinutes, SIM_TOTAL_MINUTES);

    const nextPerLga: Record<string, typeof state.perLga[string]> = {};
    const incidents = [...state.incidents];
    const feedAdditions: FeedItem[] = [];
    let allCaughtUp = true;

    for (const [lgaId, lga] of Object.entries(state.perLga)) {
      let cursor = lga.cursor;
      const puStatus = { ...lga.puStatus };
      while (cursor < lga.script.length && lga.script[cursor].ts <= simMinutes) {
        const ev = lga.script[cursor];
        switch (ev.type) {
          case "agent_checkin":
            if (!puStatus[ev.puId] || puStatus[ev.puId] === "not_started") {
              puStatus[ev.puId] = "agent_confirmed";
            }
            feedAdditions.push({ kind: "checkin", lgaId, puId: ev.puId, ts: ev.ts });
            break;
          case "turnout_update":
            feedAdditions.push({ kind: "turnout", lgaId, puId: ev.puId, accredited: ev.accredited, ts: ev.ts });
            break;
          case "result_uploaded":
            puStatus[ev.puId] = "result_uploaded";
            feedAdditions.push({ kind: "result", lgaId, puId: ev.puId, ts: ev.ts });
            break;
          case "incident":
            puStatus[ev.puId] = "incident";
            incidents.push({ id: `${lgaId}-${ev.puId}-${ev.ts}`, lgaId, puId: ev.puId, severity: ev.severity, note: ev.note, ts: ev.ts });
            feedAdditions.push({ kind: "incident", lgaId, puId: ev.puId, severity: ev.severity, note: ev.note, ts: ev.ts });
            break;
        }
        cursor++;
      }
      if (cursor < lga.script.length) allCaughtUp = false;
      nextPerLga[lgaId] = { ...lga, cursor, puStatus };
    }

    // Single national disinformation alert, shared across the whole
    // Command Center — the sharpest single moment in the pitch: ties
    // directly to the <45 min Crisis Response Time KPI.
    let disinfoAlert = state.disinfoAlert;
    if (!disinfoAlert && simMinutes >= DISINFO_ALERT_TS) {
      disinfoAlert = {
        headline: "Viral WhatsApp forward falsely claims early results have been announced in three states simultaneously",
        startTs: DISINFO_ALERT_TS,
        resolveTs: DISINFO_RESOLVE_TS,
        resolved: false,
      };
      feedAdditions.push({ kind: "alert", headline: disinfoAlert.headline, ts: DISINFO_ALERT_TS });
    }
    if (disinfoAlert && !disinfoAlert.resolved && simMinutes >= disinfoAlert.resolveTs) {
      disinfoAlert = { ...disinfoAlert, resolved: true };
      feedAdditions.push({ kind: "alert_resolved", headline: disinfoAlert.headline, ts: disinfoAlert.resolveTs });
    }

    const finished = allCaughtUp && simMinutes >= SIM_TOTAL_MINUTES;

    set({
      simMinutes,
      perLga: nextPerLga,
      incidents,
      disinfoAlert,
      feed: feedAdditions.length ? [...feedAdditions.reverse(), ...state.feed].slice(0, 300) : state.feed,
      finished,
      running: finished ? false : state.running,
    });
  },
}));

export { DISINFO_ALERT_TS, DISINFO_RESOLVE_TS, SIM_TOTAL_MINUTES };
