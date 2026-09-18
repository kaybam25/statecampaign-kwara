// Real, sourced Kwara State governorship election results — replaces the
// nationwide SWING_STATES/TURNOUT_HISTORY data (lib/gotv-data.ts) for the
// Kwara-only Voter Intelligence module rescope.
//
// Sources (cross-checked across two independent outlets where possible):
// - 2023 LGA-by-LGA breakdown: Wikipedia "2023 Kwara State gubernatorial
//   election" (citing INEC), cross-verified against ThisDayLive's INEC
//   results report (https://www.thisdaylive.com/2023/03/19/kwara-governorship-election-results-as-announced-by-inec/)
//   for 12 of the 16 LGAs — every figure matched exactly between the two
//   sources. State-wide 2023 totals: APC 273,424 (59.38%), PDP 155,490
//   (33.77%), SDP 18,922 (4.11%), others 12,661 (2.75%), total valid
//   460,497, turnout 27.88% of 1,695,927 registered voters.
// - 2019 and 2015 state-level totals: Wikipedia's "2019 Kwara State
//   gubernatorial election" and "2015 Kwara State gubernatorial election"
//   articles (also INEC-sourced). LGA-level breakdowns for 2015/2019 were
//   not available from these sources, so the historical trend below is
//   state-level only — the LGA table is 2023-only, the most granular real
//   data available.
//
// dataSource: every figure here is a REAL reported election result, not
// demo/synthetic data — unlike the rest of this app's per-PU voter/canvass
// data, which is clearly synthetic. Nothing here should be treated as a
// live poll or a prediction; it is historical record.

export type KwaraLgaResult2023 = {
  lgaId: string; // matches KWARA_LGAS ids in lib/data.ts
  lgaName: string;
  apcVotes: number;
  pdpVotes: number;
  turnoutPct: number;
};

// All 16 LGAs, 2023 Kwara State governorship election (APC's AbdulRahman
// AbdulRazaq re-elected, defeating PDP's Shuaib Yaman Abdullahi in every
// LGA). SDP and other-party votes exist per LGA too (state total: SDP
// 18,922, others 12,661) but weren't consistently reported by LGA across
// both cross-checked sources, so only the two leading parties are shown
// per LGA to avoid presenting a partial/inconsistent "others" figure as
// complete.
export const KWARA_LGA_RESULTS_2023: KwaraLgaResult2023[] = [
  { lgaId: "kwara__asa", lgaName: "Asa", apcVotes: 14946, pdpVotes: 11183, turnoutPct: 33.05 },
  { lgaId: "kwara__baruten", lgaName: "Baruten", apcVotes: 28060, pdpVotes: 7987, turnoutPct: 25.83 },
  { lgaId: "kwara__edu", lgaName: "Edu", apcVotes: 22485, pdpVotes: 17378, turnoutPct: 38.33 },
  { lgaId: "kwara__ekiti", lgaName: "Ekiti", apcVotes: 6836, pdpVotes: 4273, turnoutPct: 26.92 },
  { lgaId: "kwara__ifelodun", lgaName: "Ifelodun", apcVotes: 17599, pdpVotes: 9085, turnoutPct: 22.56 },
  { lgaId: "kwara__ilorin-east", lgaName: "Ilorin East", apcVotes: 23925, pdpVotes: 14500, turnoutPct: 26.62 },
  { lgaId: "kwara__ilorin-south", lgaName: "Ilorin South", apcVotes: 20148, pdpVotes: 12096, turnoutPct: 22.81 },
  { lgaId: "kwara__ilorin-west", lgaName: "Ilorin West", apcVotes: 46468, pdpVotes: 32372, turnoutPct: 31.33 },
  { lgaId: "kwara__irepodun", lgaName: "Irepodun", apcVotes: 12860, pdpVotes: 7614, turnoutPct: 25.84 },
  { lgaId: "kwara__isin", lgaName: "Isin", apcVotes: 5274, pdpVotes: 3400, turnoutPct: 22.80 },
  { lgaId: "kwara__kaiama", lgaName: "Kaiama", apcVotes: 14431, pdpVotes: 6297, turnoutPct: 25.54 },
  { lgaId: "kwara__moro", lgaName: "Moro", apcVotes: 15161, pdpVotes: 6823, turnoutPct: 30.53 },
  { lgaId: "kwara__offa", lgaName: "Offa", apcVotes: 14696, pdpVotes: 6705, turnoutPct: 24.62 },
  { lgaId: "kwara__oke-ero", lgaName: "Oke-Ero", apcVotes: 7758, pdpVotes: 3768, turnoutPct: 27.18 },
  { lgaId: "kwara__oyun", lgaName: "Oyun", apcVotes: 8991, pdpVotes: 5465, turnoutPct: 26.81 },
  { lgaId: "kwara__patigi", lgaName: "Patigi", apcVotes: 13813, pdpVotes: 6544, turnoutPct: 32.19 },
];

export function apcMarginPct(r: KwaraLgaResult2023): number {
  const total = r.apcVotes + r.pdpVotes;
  return total ? ((r.apcVotes - r.pdpVotes) / total) * 100 : 0;
}

export type CompetitivenessTier = "Most Contested" | "Contested" | "Safe APC";

// Framing note: APC won all 16 LGAs in 2023, so this tags relative
// competitiveness (useful for prioritising GOTV/defensive effort), not a
// prediction that PDP could flip a "contested" LGA outright.
export function competitiveness(marginPct: number): CompetitivenessTier {
  if (marginPct < 20) return "Most Contested";
  if (marginPct < 40) return "Contested";
  return "Safe APC";
}

export type KwaraStateCycle = {
  year: 2015 | 2019 | 2023;
  turnoutPct: number;
  apcPct: number;
  pdpPct: number;
};

// State-wide totals across the last 3 governorship cycles — a real,
// verifiable declining-turnout trend (37.07% -> 33.67% -> 27.88%), used to
// anchor the rescoped Turnout Scenario Simulator.
export const KWARA_STATE_HISTORY: KwaraStateCycle[] = [
  { year: 2015, turnoutPct: 37.07, apcPct: 70.50, pdpPct: 27.46 },
  { year: 2019, turnoutPct: 33.67, apcPct: 73.12, pdpPct: 25.31 },
  { year: 2023, turnoutPct: 27.88, apcPct: 59.38, pdpPct: 33.77 },
];

export type TurnoutAnchor = { turnoutPct: number; apcPct: number; pdpPct: number; otherPct: number };

// Real historical anchors instead of a fabricated poll: "low" = the actual
// 2023 result (lowest turnout of the 3 cycles), "high" = the actual 2015
// result (highest turnout of the 3 cycles) — both real reported outcomes.
export const KWARA_TURNOUT_SCENARIO_LOW: TurnoutAnchor = { turnoutPct: 27.88, apcPct: 59.38, pdpPct: 33.77, otherPct: 6.85 };
export const KWARA_TURNOUT_SCENARIO_HIGH: TurnoutAnchor = { turnoutPct: 37.07, apcPct: 70.50, pdpPct: 27.46, otherPct: 2.04 };

export function interpolateKwaraTurnoutScenario(turnoutPct: number): TurnoutAnchor {
  const lo = KWARA_TURNOUT_SCENARIO_LOW;
  const hi = KWARA_TURNOUT_SCENARIO_HIGH;
  const t = Math.min(1, Math.max(0, (turnoutPct - lo.turnoutPct) / (hi.turnoutPct - lo.turnoutPct)));
  // Round to 2 decimals (matching the anchors' own precision, e.g. 59.38) —
  // rounding to 1 decimal here caused float-precision drift that made the
  // interpolation not exactly reproduce its own anchor values at t=0/t=1.
  const lerp = (a: number, b: number) => Math.round((a + (b - a) * t) * 100) / 100;
  const apcPct = lerp(lo.apcPct, hi.apcPct);
  const pdpPct = lerp(lo.pdpPct, hi.pdpPct);
  return { turnoutPct, apcPct, pdpPct, otherPct: Math.round((100 - apcPct - pdpPct) * 100) / 100 };
}
