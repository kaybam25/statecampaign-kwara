// Sourced from Nigeria_Presidential_Elections_GOTV_Report.pdf (INEC official
// results 2015/2019/2023 + SBM Intelligence Voter Sentiment Tracker, June
// 2026) and CampaignOS_Strategy_Report_v2.pdf Section 8 ("Nigerian Political
// Data Intelligence", p.14). Both documents already live in the project
// folder — see PROJECT.md "Background this builds on." Figures below are
// transcribed as published in those two documents, not independently
// re-verified beyond what those reports already cite.

export type SwingState = {
  name: string;
  votersM: number;
  y2015: string;
  y2019: string;
  y2023: string;
  status2027: string;
  gotvStars: number; // 1-5, per GOTV report's "GOTV Value" rating
};

// All 12 key states + FCT identified in the GOTV report (pp.8-9) as the
// states that determine presidential outcomes. Every row carries the same
// data depth regardless of which party currently favours it — from
// Borno (APC-safe) through Anambra (NDC-safe) — per the project's standing
// convention of keeping APC/opposition analysis equally rigorous.
export const SWING_STATES: SwingState[] = [
  { name: "Lagos", votersM: 4.5, y2015: "APC", y2019: "APC", y2023: "LP (narrow)", status2027: "Swing — highest prize", gotvStars: 5 },
  { name: "Kano", votersM: 4.2, y2015: "APC", y2019: "APC", y2023: "NNPP", status2027: "Swing — NW anchor", gotvStars: 5 },
  { name: "Kaduna", votersM: 3.5, y2015: "APC", y2019: "APC", y2023: "PDP (narrow)", status2027: "Swing — 3-way", gotvStars: 5 },
  { name: "Katsina", votersM: 3.5, y2015: "APC", y2019: "APC", y2023: "PDP (narrow)", status2027: "Swing", gotvStars: 4 },
  { name: "Rivers", votersM: 2.9, y2015: "PDP", y2019: "PDP", y2023: "Split (3-way)", status2027: "APC defection, contested", gotvStars: 4 },
  { name: "Oyo", votersM: 2.8, y2015: "APC", y2019: "APC", y2023: "APC", status2027: "SW — APC must hold", gotvStars: 4 },
  { name: "Delta", votersM: 2.5, y2015: "PDP", y2019: "PDP", y2023: "LP", status2027: "NDC target", gotvStars: 4 },
  { name: "Sokoto", votersM: 2.4, y2015: "APC", y2019: "PDP", y2023: "PDP", status2027: "NW — swing to opp.", gotvStars: 3 },
  { name: "Borno", votersM: 2.3, y2015: "APC", y2019: "APC", y2023: "APC", status2027: "APC safe", gotvStars: 2 },
  { name: "Adamawa", votersM: 2.2, y2015: "APC", y2019: "PDP", y2023: "PDP", status2027: "Swing — Atiku home", gotvStars: 3 },
  { name: "Anambra", votersM: 2.1, y2015: "APC", y2019: "APC", y2023: "LP sweep", status2027: "NDC safe", gotvStars: 3 },
  { name: "FCT", votersM: 1.6, y2015: "PDP", y2019: "PDP", y2023: "LP (Obi)", status2027: "Contested — urban vote", gotvStars: 4 },
];

export type PvcGapRow = { state: string; pvcPossessionPct: number; actualVotedPct: number };

// Strategy Report p.14, "PVC Possession vs Actual Voting (Selected States)".
export const PVC_GAP: PvcGapRow[] = [
  { state: "Lagos", pvcPossessionPct: 84, actualVotedPct: 58 },
  { state: "Kano", pvcPossessionPct: 78, actualVotedPct: 52 },
  { state: "Rivers", pvcPossessionPct: 81, actualVotedPct: 61 },
  { state: "Ogun", pvcPossessionPct: 78, actualVotedPct: 54 },
  { state: "FCT", pvcPossessionPct: 71, actualVotedPct: 70 },
  { state: "Kaduna", pvcPossessionPct: 73, actualVotedPct: 50 },
];

export type VoterConcern = { concern: string; pct: number };

// Strategy Report p.14, "Top Voter Concerns — Nigeria 2025".
export const VOTER_CONCERNS: VoterConcern[] = [
  { concern: "Security & Insurgency", pct: 91 },
  { concern: "Economic Hardship", pct: 88 },
  { concern: "Corruption", pct: 87 },
  { concern: "Unemployment", pct: 84 },
  { concern: "Fuel Price", pct: 79 },
  { concern: "Power Supply", pct: 72 },
  { concern: "Education Quality", pct: 68 },
  { concern: "Healthcare Access", pct: 65 },
];

// Historical national turnout (INEC-declared) — GOTV report Fig. 2 / national
// overview table. Anchors the Turnout Scenario Simulator's realistic range.
export const TURNOUT_HISTORY = [
  { year: 2011, turnoutPct: 53.7 },
  { year: 2015, turnoutPct: 41.6 },
  { year: 2019, turnoutPct: 32.5 },
  { year: 2023, turnoutPct: 26.2 },
];

export type TurnoutAnchor = { turnoutPct: number; apcPct: number; ndcPct: number; otherPct: number };

// GOTV report Fig. 7, "Voting Intention: Low vs High Turnout" (SBM Voter
// Sentiment Tracker, June 2026, N=829) — two voting-intention scenarios, not
// a full turnout curve. The simulator below interpolates illustratively
// between them across the historical turnout range (2023's 26.2% floor to
// 2011's 53.7% ceiling). This is a scenario illustration for discussion, not
// a poll result in its own right — labelled as such in the UI.
export const TURNOUT_SCENARIO_LOW: TurnoutAnchor = { turnoutPct: 26.2, apcPct: 18, ndcPct: 32, otherPct: 50 };
export const TURNOUT_SCENARIO_HIGH: TurnoutAnchor = { turnoutPct: 53.7, apcPct: 10, ndcPct: 65, otherPct: 25 };

export function interpolateTurnoutScenario(turnoutPct: number): TurnoutAnchor {
  const lo = TURNOUT_SCENARIO_LOW;
  const hi = TURNOUT_SCENARIO_HIGH;
  const t = Math.min(1, Math.max(0, (turnoutPct - lo.turnoutPct) / (hi.turnoutPct - lo.turnoutPct)));
  const lerp = (a: number, b: number) => Math.round(a + (b - a) * t);
  return {
    turnoutPct,
    apcPct: lerp(lo.apcPct, hi.apcPct),
    ndcPct: lerp(lo.ndcPct, hi.ndcPct),
    otherPct: lerp(lo.otherPct, hi.otherPct),
  };
}
