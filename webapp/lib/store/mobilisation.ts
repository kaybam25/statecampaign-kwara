import { create } from "zustand";
import type {
  MobilisationEvent,
  IncidentCategory,
  ReminderChannel,
  ReminderKind,
  TrainingIntervalMinutes,
} from "@/lib/types";
import { DEFAULT_TRAINING_INTERVAL } from "@/lib/types";
import { FIELD_AGENTS } from "@/lib/mobilisation-data";

// Mobilisation Module state. Deliberately a separate store from
// useElectionDayStore (different concern: per-agent field workflow vs.
// LGA-wide PU simulation) but reads the SAME simulated clock — callers pass
// `simMinutes` from useElectionDayStore into every action here so agent
// timestamps, training due-times, and the Election Day clock never drift
// apart even though this store doesn't tick on its own.

export type AgentState = {
  checkIn?: { ts: number; gpsVerified: boolean; distanceM: number };
  officialsArrivedTs?: number;
  materialsArrivedTs?: number;
  accreditationStartedTs?: number;
  trainingIntervalMinutes: TrainingIntervalMinutes;
  lastTrainingVerifiedTs: number;
  incidents: { ts: number; category: IncidentCategory; note: string }[];
  collation?: { ts: number; accreditedCount: number; votesCast: number; photoAttached: boolean };
  remindersSent: { ts: number; channel: ReminderChannel; kind: ReminderKind; recipientCount: number }[];
};

function blankAgentState(): AgentState {
  return {
    trainingIntervalMinutes: DEFAULT_TRAINING_INTERVAL,
    lastTrainingVerifiedTs: 0,
    incidents: [],
    remindersSent: [],
  };
}

// A pre-computed simulation result for one agent/canvasser, produced by
// lib/mobilisation-group-sim.ts for the Admin Dashboard's "Do Group Agents"
// bulk-simulation button. `patch` is applied on top of that agent's existing
// (blank) state and `events` are appended to the shared feed — same shape
// the single-agent/canvasser pages produce one click at a time.
export type GroupSimResult = {
  agentId: string;
  patch: Partial<AgentState>;
  events: MobilisationEvent[];
};

type MobilisationStore = {
  agentState: Record<string, AgentState>;
  events: MobilisationEvent[];

  init: () => void;
  checkIn: (agentId: string, ts: number, gpsVerified: boolean, distanceM: number) => void;
  setTrainingInterval: (agentId: string, minutes: TrainingIntervalMinutes) => void;
  verifyTraining: (agentId: string, ts: number) => void;
  reportOfficialsArrived: (agentId: string, ts: number) => void;
  reportMaterialsArrived: (agentId: string, ts: number) => void;
  startAccreditation: (agentId: string, ts: number) => void;
  reportIncident: (agentId: string, ts: number, category: IncidentCategory, note: string) => void;
  submitCollation: (agentId: string, ts: number, accreditedCount: number, votesCast: number, photoAttached: boolean) => void;
  sendReminder: (agentId: string, ts: number, channel: ReminderChannel, kind: ReminderKind, recipientCount: number) => void;
  runGroupBatch: (results: GroupSimResult[]) => void;
};

function ensure(agentState: Record<string, AgentState>, agentId: string): AgentState {
  return agentState[agentId] ?? blankAgentState();
}

export const useMobilisationStore = create<MobilisationStore>((set) => ({
  agentState: Object.fromEntries(FIELD_AGENTS.map((a) => [a.id, blankAgentState()])),
  events: [],

  init: () =>
    set({
      agentState: Object.fromEntries(FIELD_AGENTS.map((a) => [a.id, blankAgentState()])),
      events: [],
    }),

  checkIn: (agentId, ts, gpsVerified, distanceM) =>
    set((s) => ({
      agentState: { ...s.agentState, [agentId]: { ...ensure(s.agentState, agentId), checkIn: { ts, gpsVerified, distanceM } } },
      events: [{ type: "checkin", agentId, ts, gpsVerified, distanceM }, ...s.events],
    })),

  setTrainingInterval: (agentId, minutes) =>
    set((s) => ({
      agentState: { ...s.agentState, [agentId]: { ...ensure(s.agentState, agentId), trainingIntervalMinutes: minutes } },
    })),

  verifyTraining: (agentId, ts) =>
    set((s) => {
      const a = ensure(s.agentState, agentId);
      return {
        agentState: { ...s.agentState, [agentId]: { ...a, lastTrainingVerifiedTs: ts } },
        events: [{ type: "training_verified", agentId, ts, intervalMinutes: a.trainingIntervalMinutes }, ...s.events],
      };
    }),

  reportOfficialsArrived: (agentId, ts) =>
    set((s) => ({
      agentState: { ...s.agentState, [agentId]: { ...ensure(s.agentState, agentId), officialsArrivedTs: ts } },
      events: [{ type: "officials_arrived", agentId, ts }, ...s.events],
    })),

  reportMaterialsArrived: (agentId, ts) =>
    set((s) => ({
      agentState: { ...s.agentState, [agentId]: { ...ensure(s.agentState, agentId), materialsArrivedTs: ts } },
      events: [{ type: "materials_arrived", agentId, ts }, ...s.events],
    })),

  startAccreditation: (agentId, ts) =>
    set((s) => ({
      agentState: { ...s.agentState, [agentId]: { ...ensure(s.agentState, agentId), accreditationStartedTs: ts } },
      events: [{ type: "accreditation_started", agentId, ts }, ...s.events],
    })),

  reportIncident: (agentId, ts, category, note) =>
    set((s) => {
      const a = ensure(s.agentState, agentId);
      return {
        agentState: { ...s.agentState, [agentId]: { ...a, incidents: [...a.incidents, { ts, category, note }] } },
        events: [{ type: "incident_reported", agentId, ts, category, note }, ...s.events],
      };
    }),

  submitCollation: (agentId, ts, accreditedCount, votesCast, photoAttached) =>
    set((s) => ({
      agentState: {
        ...s.agentState,
        [agentId]: { ...ensure(s.agentState, agentId), collation: { ts, accreditedCount, votesCast, photoAttached } },
      },
      events: [{ type: "collation_reported", agentId, ts, accreditedCount, votesCast, photoAttached }, ...s.events],
    })),

  sendReminder: (agentId, ts, channel, kind, recipientCount) =>
    set((s) => {
      const a = ensure(s.agentState, agentId);
      return {
        agentState: { ...s.agentState, [agentId]: { ...a, remindersSent: [...a.remindersSent, { ts, channel, kind, recipientCount }] } },
        events: [{ type: "reminder_sent", agentId, ts, channel, kind, recipientCount }, ...s.events],
      };
    }),

  runGroupBatch: (results) =>
    set((s) => {
      const agentState = { ...s.agentState };
      const newEvents: MobilisationEvent[] = [];
      for (const r of results) {
        agentState[r.agentId] = { ...ensure(agentState, r.agentId), ...r.patch };
        newEvents.push(...r.events);
      }
      // Newest-first, same ordering convention as every other action above.
      return { agentState, events: [...newEvents.reverse(), ...s.events] };
    }),
}));

// Training compliance helper — overdue if simMinutes has passed the agent's
// last-verified time plus their configured interval.
export function isTrainingOverdue(a: AgentState, simMinutes: number): boolean {
  return simMinutes - a.lastTrainingVerifiedTs >= a.trainingIntervalMinutes;
}

export function nextTrainingDue(a: AgentState): number {
  return a.lastTrainingVerifiedTs + a.trainingIntervalMinutes;
}
