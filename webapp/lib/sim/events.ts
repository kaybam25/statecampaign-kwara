import type { ElectionDayEvent, PollingUnit } from "@/lib/types";
import { seededRatio, seededInt } from "@/lib/seed";

// Builds a deterministic Election Day event script over a given LGA's real
// polling units. Deterministic on purpose: a rehearsal run must look
// identical to the live pitch run — no risk of a random, embarrassing
// outcome in front of the Chairman. Works for any of the 6 flagship LGAs
// (or a combined multi-LGA PU list, for the Command Center).
//
// Timeline runs 0-600 "simulated minutes" (roughly 6am-4pm compressed).
// Every event has a `ts` in that range. The store advances a simulated
// clock and applies events whose ts has passed.

export const SIM_TOTAL_MINUTES = 600;
export const DISINFO_ALERT_TS = 260;
export const DISINFO_RESOLVE_TS = DISINFO_ALERT_TS + 42; // < 45 min, matches the KPI target

const INCIDENT_NOTES: { severity: "low" | "medium" | "high"; note: string }[] = [
  { severity: "low", note: "Long queue reported at accreditation point — agent requesting extra materials." },
  { severity: "medium", note: "Smart card reader malfunction — agent has switched to backup unit." },
  { severity: "high", note: "Scuffle reported near polling unit entrance — security notified, agent safe." },
];

// Seed a distinct pseudo-random stream per LGA so 6 LGAs simulated together
// don't all spike/lull at the exact same simulated minute — salt every
// per-PU seed lookup with the LGA id.
export function buildEventScript(pus: PollingUnit[], lgaId: string = ""): ElectionDayEvent[] {
  const events: ElectionDayEvent[] = [];
  const salt = lgaId ? `${lgaId}::` : "";

  pus.forEach((pu) => {
    const r = seededRatio(salt + pu.id);
    // Agent check-ins ramp 6am-8am (minutes 0-120), ~85% of PUs covered.
    if (r < 0.85) {
      const ts = seededInt(salt + pu.id + "checkin", 0, 120);
      events.push({ type: "agent_checkin", puId: pu.id, ts });
    }
    // Turnout updates through the day (minutes 120-420), ~55% of PUs.
    if (r < 0.55) {
      const ts = seededInt(salt + pu.id + "turnout", 130, 420);
      const accredited = seededInt(salt + pu.id + "acc", 80, 420);
      events.push({ type: "turnout_update", puId: pu.id, accredited, ts });
    }
    // Result uploads accelerate after 2pm (minutes 480-600), ~68% of PUs.
    if (r < 0.68) {
      const ts = seededInt(salt + pu.id + "result", 480, 598);
      events.push({ type: "result_uploaded", puId: pu.id, ts });
    }
  });

  // Three scripted incidents, spread across different wards for visual spread.
  const incidentPUs = [pus[40 % pus.length], pus[Math.floor(pus.length / 2)], pus[Math.max(0, pus.length - 60) % pus.length]].filter(Boolean);
  incidentPUs.forEach((pu, i) => {
    events.push({
      type: "incident",
      puId: pu.id,
      severity: INCIDENT_NOTES[i % INCIDENT_NOTES.length].severity,
      note: INCIDENT_NOTES[i % INCIDENT_NOTES.length].note,
      ts: 150 + i * 110,
    });
  });

  events.sort((a, b) => a.ts - b.ts);
  return events;
}
