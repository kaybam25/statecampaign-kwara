// CampaignOS demo v2 — core data model.
// v2 generalizes v1's Ikeja-only "flagship LGA" concept to 6 flagship LGAs,
// one per geopolitical zone, so the Election Day Operations Center can run
// either as a single-LGA monitor or as a multi-LGA Command Center view.

export type Zone = {
  id: string;
  name: string;
  states: string[]; // real state names in this zone
};

export type StateEntity = {
  id: string;
  name: string;
  zoneId: string | null;
  lgaCount: number;
  wardCount: number;
  puCount: number;
  wardCountEstimated: boolean;
};

export type LGA = {
  id: string; // `${stateId}__${slugifiedName}`
  name: string;
  stateId: string;
  hasRealWardData: boolean; // true for the 6 flagship LGAs
  wardCount: number;
  puCount: number;
};

export type Ward = {
  id: string; // `${lgaSlug}__ward-01` etc (only populated for flagship LGAs)
  name: string;
  lgaId: string;
  code: string; // INEC-derived ward code prefix, e.g. "24-11-01"
  puCount: number;
};

export type PollingUnit = {
  id: string; // INEC-derived PU code, e.g. "24-11-01-001"
  code: string;
  name: string;
  wardId: string;
  // Election Day simulation state (populated at runtime, not in seed data)
  status?: PUStatus;
  registeredVoters?: number;
  accreditedCount?: number;
  votesCast?: number;
};

export type PUStatus =
  | "not_started"
  | "agent_confirmed"
  | "voting_live"
  | "result_uploaded"
  | "incident";

export type NationalTotals = {
  registeredVoters: number;
  totalWards: number;
  totalPollingUnits: number;
  totalLGAs: number;
  electivePositions: number;
};

export type ElectionDayEvent =
  | { type: "agent_checkin"; puId: string; ts: number }
  | { type: "turnout_update"; puId: string; accredited: number; ts: number }
  | { type: "result_uploaded"; puId: string; ts: number }
  | { type: "incident"; puId: string; severity: "low" | "medium" | "high"; note: string; ts: number }
  | { type: "disinformation_alert"; headline: string; ts: number };

// A flagship LGA: one per geopolitical zone, with real sourced INEC ward
// and polling-unit data (matching the depth first proven on Lagos → Ikeja).
export type FlagshipLGA = {
  lgaId: string; // matches LGA.id in lgas.json
  zoneId: string;
  stateName: string;
  lgaName: string;
  filePrefix: string; // data file prefix, e.g. "jos-north"
  center: { lat: number; lng: number }; // approximate LGA-seat coordinates, for map centering only
};

// --- Mobilisation Module (Phase 3) ---
// Field agents (polling agents) work a single PU. Canvassers/transport
// coordinators work a ward's constituent list. Both are "field roles" —
// distinct from the LGA-wide Election Day simulation, this module is a
// presenter-driven, per-agent walkthrough (mobile-frame UI) plus an
// admin-side roll-up dashboard, sharing the same simulated election-day
// clock (`useElectionDayStore().simMinutes`) so training due-times and
// check-in timestamps stay consistent with the rest of the demo.

export type MobilisationRole = "polling_agent" | "canvasser";

// Minutes, in simulated election-day time — 4 fixed choices, default 120.
export type TrainingIntervalMinutes = 30 | 60 | 120 | 240;

export const TRAINING_INTERVAL_OPTIONS: TrainingIntervalMinutes[] = [30, 60, 120, 240];
export const DEFAULT_TRAINING_INTERVAL: TrainingIntervalMinutes = 120;

// Exactly 5 reportable incident categories, per spec — kept short and
// mutually distinct so a stressed agent can pick one in a few seconds.
export type IncidentCategory =
  | "security_violence"
  | "vote_buying"
  | "equipment_materials_failure"
  | "materials_delay"
  | "other_irregularity";

export const INCIDENT_CATEGORIES: { id: IncidentCategory; label: string; severity: "low" | "medium" | "high" }[] = [
  { id: "security_violence", label: "Security threat / violence", severity: "high" },
  { id: "vote_buying", label: "Vote buying / inducement", severity: "medium" },
  { id: "equipment_materials_failure", label: "BVAS / equipment failure", severity: "medium" },
  { id: "materials_delay", label: "INEC materials delayed / short", severity: "high" },
  { id: "other_irregularity", label: "Other process irregularity", severity: "low" },
];

export type ReminderChannel = "whatsapp" | "sms";
export type ReminderKind = "voting_awareness" | "transport_logistics" | "gotv_push";

export type FieldAgentProfile = {
  id: string;
  name: string;
  phone: string; // masked demo number
  role: MobilisationRole;
  lgaId: string;
  assignedPuId?: string; // polling_agent
  assignedWardId?: string; // canvasser / transport coordinator
};

// Static "constituent" contact used by the canvasser reminder flow —
// illustrative sample data, not real voters.
export type ConstituentContact = {
  id: string;
  name: string;
  puName: string;
  needsTransport: boolean;
};

export type MobilisationEvent =
  | { type: "checkin"; agentId: string; ts: number; gpsVerified: boolean; distanceM: number }
  | { type: "officials_arrived"; agentId: string; ts: number }
  | { type: "materials_arrived"; agentId: string; ts: number }
  | { type: "accreditation_started"; agentId: string; ts: number }
  | { type: "training_verified"; agentId: string; ts: number; intervalMinutes: TrainingIntervalMinutes }
  | { type: "incident_reported"; agentId: string; ts: number; category: IncidentCategory; note: string }
  | { type: "collation_reported"; agentId: string; ts: number; accreditedCount: number; votesCast: number; photoAttached: boolean }
  | { type: "reminder_sent"; agentId: string; ts: number; channel: ReminderChannel; kind: ReminderKind; recipientCount: number };

// --- Canvass Assignment & Deduplication Engine (pre-election canvassing) ---
// A new field role, distinct from polling_agent/canvasser: a party_member is
// responsible for a single, fixed, non-overlapping "block" of voters within
// one polling unit, tracked to completion before election day (rather than
// a one-day Election Day duty, or a ward-wide reminder blast).
//
// IMPORTANT — data provenance: every CanvassBlock/CanvassVoter this demo
// generates is synthetic, illustrative sample data laid over REAL INEC
// PU/ward geography. No certified voter register has been obtained from
// INEC for either state (Electoral Act 2022 s.15 is the lawful route to
// one). `dataSource` exists specifically so the UI can always show which
// kind of data a screen is displaying, and must never default silently to
// "certified_register".

export type CanvassDataSource = "demo_synthetic" | "certified_register";

// Block size is fully configurable, not fixed: 30/50/75 are just the
// one-tap presets a ward coordinator sees in the UI (Session 2) — any
// positive integer is accepted as a custom size (validated within
// MIN_BLOCK_SIZE..MAX_BLOCK_SIZE, see lib/canvass-data.ts).
export const BLOCK_SIZE_PRESETS = [30, 50, 75] as const;
export const DEFAULT_BLOCK_SIZE = 50;

export type CanvassBlockStatus = "unassigned" | "assigned" | "completed";

export type CanvassBlock = {
  id: string; // `${puId}-B${n}`, e.g. "23-01-01-001-B1" — globally unique (PU codes are INEC-unique)
  puId: string;
  wardId: string;
  lgaId: string;
  targetSize: number; // configurable block size actually used to cut this block
  status: CanvassBlockStatus;
  assignedMemberId?: string;
  dataSource: CanvassDataSource;
};

export type CanvassContactStatus =
  | "not_contacted"
  | "supportive"
  | "undecided"
  | "opposed"
  | "unreachable";

export type CanvassVoter = {
  id: string; // `${blockId}-V${n}`
  blockId: string;
  name: string; // synthetic demo name when dataSource is "demo_synthetic"
  contactStatus: CanvassContactStatus;
};

// A registered party member available to canvass — distinct from
// FieldAgentProfile (Election Day roles) even though the shape is similar,
// since a party member is scoped to canvassing, not polling-day duty.
export type PartyMemberProfile = {
  id: string;
  name: string;
  phone: string; // masked demo number
  role: "party_member";
  lgaId: string;
  wardId: string; // home ward — where this member is expected to canvass
  assignedPuId: string; // the specific polling unit this member canvasses (Session 2)
};

export type CanvassEvent =
  | { type: "block_assigned"; blockId: string; memberId: string; ts: number }
  | { type: "block_returned_to_pool"; blockId: string; ts: number; reason: "attrition" | "manual" }
  | { type: "block_completed"; blockId: string; memberId: string; ts: number }
  | { type: "voter_status_updated"; voterId: string; blockId: string; status: CanvassContactStatus; ts: number };

// Ward-priority tagging (Session 3, Command Center). Deliberately NOT
// derived from any swing/turnout model — lib/gotv-data.ts's swing-state
// tracker is state-level only (12 states + FCT) and Kwara isn't even one of
// those 12, so there is no real ward-level scoring data to compute this
// from for either Kwara or Ogun. A tier is instead set directly by a ward
// coordinator in the Command Center UI, standing in for the campaign's own
// judgement (competitiveness, organizational readiness, etc.) — the report's
// Section 7 recommendation was to obtain this FROM the campaign, not invent
// it. 1 = canvass first.
export type WardPriorityTier = 1 | 2 | 3;
