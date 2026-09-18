import type { FieldAgentProfile, MobilisationEvent } from "./types";
import { INCIDENT_CATEGORIES } from "./types";
import type { AgentState, GroupSimResult } from "./store/mobilisation";
import { getConstituentsForWard } from "./mobilisation-data";
import { seededInt } from "./seed";

// Deterministically simulates one field agent's or canvasser's full
// election-day flow, for the Admin Dashboard's "Do Group Agents" bulk-
// simulation button. Produces the exact same event shapes (and calls into
// the exact same AgentState fields) that a presenter clicking through the
// single-agent/canvasser demo pages by hand would produce — just generated
// in one deterministic batch instead of one click at a time. The
// single-agent/canvasser pages themselves are untouched by this file.
export function buildGroupSimResult(agent: FieldAgentProfile, simMinutesNow: number): GroupSimResult {
  const events: MobilisationEvent[] = [];

  if (agent.role === "polling_agent") {
    const checkInTs = simMinutesNow + seededInt(agent.id + "g-checkin", 0, 25);
    const gpsVerified = seededInt(agent.id + "g-gps", 0, 100) < 90;
    const distanceM = seededInt(agent.id + "g-dist", 5, gpsVerified ? 80 : 250);
    const officialsTs = checkInTs + seededInt(agent.id + "g-officials", 5, 20);
    const skipMaterials = seededInt(agent.id + "g-materials-skip", 0, 100) < 10;
    const materialsTs = officialsTs + seededInt(agent.id + "g-materials", 3, 25);
    const accreditationTs = materialsTs + seededInt(agent.id + "g-accred", 2, 10);
    const trainingTs = accreditationTs + seededInt(agent.id + "g-train", 10, 60);
    const collationTs = seededInt(agent.id + "g-collation", 480, 600);
    const accreditedCount = seededInt(agent.id + "g-acc-count", 220, 520);
    const votesCast = Math.round(accreditedCount * (seededInt(agent.id + "g-turnout", 70, 96) / 100));
    const photoAttached = seededInt(agent.id + "g-photo", 0, 100) < 92;

    events.push({ type: "checkin", agentId: agent.id, ts: checkInTs, gpsVerified, distanceM });
    events.push({ type: "officials_arrived", agentId: agent.id, ts: officialsTs });
    if (!skipMaterials) events.push({ type: "materials_arrived", agentId: agent.id, ts: materialsTs });
    events.push({ type: "accreditation_started", agentId: agent.id, ts: accreditationTs });
    events.push({ type: "training_verified", agentId: agent.id, ts: trainingTs, intervalMinutes: 120 });

    let incidents: AgentState["incidents"] = [];
    if (seededInt(agent.id + "g-incident", 0, 100) < 15) {
      const cat = INCIDENT_CATEGORIES[seededInt(agent.id + "g-incident-cat", 0, INCIDENT_CATEGORIES.length - 1)];
      const incidentTs = materialsTs + seededInt(agent.id + "g-incident-ts", 1, 15);
      const note = "Automated field report — flagged during bulk group simulation";
      incidents = [{ ts: incidentTs, category: cat.id, note }];
      events.push({ type: "incident_reported", agentId: agent.id, ts: incidentTs, category: cat.id, note });
    }

    events.push({ type: "collation_reported", agentId: agent.id, ts: collationTs, accreditedCount, votesCast, photoAttached });

    return {
      agentId: agent.id,
      patch: {
        checkIn: { ts: checkInTs, gpsVerified, distanceM },
        officialsArrivedTs: officialsTs,
        materialsArrivedTs: skipMaterials ? undefined : materialsTs,
        accreditationStartedTs: accreditationTs,
        trainingIntervalMinutes: 120,
        lastTrainingVerifiedTs: trainingTs,
        incidents,
        collation: { ts: collationTs, accreditedCount, votesCast, photoAttached },
      },
      events,
    };
  }

  // Canvasser: sends a morning awareness reminder plus an afternoon GOTV
  // push to their full canvassed-contact list, mirroring the two reminder
  // kinds a presenter would most naturally click through by hand.
  const contacts = getConstituentsForWard(agent.assignedWardId!, 6);
  const reminderTs1 = simMinutesNow + seededInt(agent.id + "g-remind1", 0, 30);
  const reminderTs2 = seededInt(agent.id + "g-remind2", 420, 500);
  const remindersSent: AgentState["remindersSent"] = [
    { ts: reminderTs1, channel: "whatsapp", kind: "voting_awareness", recipientCount: contacts.length },
    { ts: reminderTs2, channel: "sms", kind: "gotv_push", recipientCount: contacts.length },
  ];
  events.push({ type: "reminder_sent", agentId: agent.id, ts: reminderTs1, channel: "whatsapp", kind: "voting_awareness", recipientCount: contacts.length });
  events.push({ type: "reminder_sent", agentId: agent.id, ts: reminderTs2, channel: "sms", kind: "gotv_push", recipientCount: contacts.length });

  return {
    agentId: agent.id,
    patch: { remindersSent },
    events,
  };
}

// Has this agent already had any interaction recorded — from either the
// single-agent/canvasser demo pages OR a previous group batch? Used to pick
// the "next 25 unprocessed" agents so repeated clicks progress through the
// whole 75-agent roster instead of re-simulating the same agents.
export function isAgentProcessed(agent: FieldAgentProfile, agentState: Record<string, AgentState>): boolean {
  const s = agentState[agent.id];
  if (!s) return false;
  if (agent.role === "polling_agent") return !!s.checkIn;
  return s.remindersSent.length > 0;
}
