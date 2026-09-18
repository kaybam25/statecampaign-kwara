import type { Zone, StateEntity, LGA, Ward, PollingUnit, NationalTotals, FlagshipLGA } from "./types";
import { FLAGSHIP_CENTERS, KWARA_LGA_CENTERS } from "./geo";

import zonesRaw from "@/data/zones.json";
import statesRaw from "@/data/states.json";
import lgasRaw from "@/data/lgas.json";
import nationalRaw from "@/data/national.json";

// 5 non-Kwara flagship LGAs, one per other geopolitical zone — real, sourced
// INEC ward + polling-unit data, carried over from the earlier build.
import josNorthWardsRaw from "@/data/jos-north-wards.json";
import josNorthPUsRaw from "@/data/jos-north-polling-units.json";
import yolaNorthWardsRaw from "@/data/yola-north-wards.json";
import yolaNorthPUsRaw from "@/data/yola-north-polling-units.json";
import kanoMunicipalWardsRaw from "@/data/kano-municipal-wards.json";
import kanoMunicipalPUsRaw from "@/data/kano-municipal-polling-units.json";
import onitshaSouthWardsRaw from "@/data/onitsha-south-wards.json";
import onitshaSouthPUsRaw from "@/data/onitsha-south-polling-units.json";
import portHarcourtWardsRaw from "@/data/port-harcourt-wards.json";
import portHarcourtPUsRaw from "@/data/port-harcourt-polling-units.json";

// All 16 Kwara State LGAs — full real INEC ward + polling-unit coverage,
// sourced the same way as the flagship LGAs above (mykeels/inec-polling-units,
// states/23-kwara). Built for the Kwara State PDP demo.
import asaWardsRaw from "@/data/asa-wards.json";
import asaPUsRaw from "@/data/asa-polling-units.json";
import barutenWardsRaw from "@/data/baruten-wards.json";
import barutenPUsRaw from "@/data/baruten-polling-units.json";
import eduWardsRaw from "@/data/edu-wards.json";
import eduPUsRaw from "@/data/edu-polling-units.json";
import kwaraEkitiWardsRaw from "@/data/kwara-ekiti-wards.json";
import kwaraEkitiPUsRaw from "@/data/kwara-ekiti-polling-units.json";
import ifelodunWardsRaw from "@/data/ifelodun-wards.json";
import ifelodunPUsRaw from "@/data/ifelodun-polling-units.json";
import ilorinEastWardsRaw from "@/data/ilorin-east-wards.json";
import ilorinEastPUsRaw from "@/data/ilorin-east-polling-units.json";
import ilorinSouthWardsRaw from "@/data/ilorin-south-wards.json";
import ilorinSouthPUsRaw from "@/data/ilorin-south-polling-units.json";
import ilorinWestWardsRaw from "@/data/ilorin-west-wards.json";
import ilorinWestPUsRaw from "@/data/ilorin-west-polling-units.json";
import irepodunWardsRaw from "@/data/irepodun-wards.json";
import irepodunPUsRaw from "@/data/irepodun-polling-units.json";
import isinWardsRaw from "@/data/isin-wards.json";
import isinPUsRaw from "@/data/isin-polling-units.json";
import kaiamaWardsRaw from "@/data/kaiama-wards.json";
import kaiamaPUsRaw from "@/data/kaiama-polling-units.json";
import moroWardsRaw from "@/data/moro-wards.json";
import moroPUsRaw from "@/data/moro-polling-units.json";
import offaWardsRaw from "@/data/offa-wards.json";
import offaPUsRaw from "@/data/offa-polling-units.json";
import okeEroWardsRaw from "@/data/oke-ero-wards.json";
import okeEroPUsRaw from "@/data/oke-ero-polling-units.json";
import oyunWardsRaw from "@/data/oyun-wards.json";
import oyunPUsRaw from "@/data/oyun-polling-units.json";
import patigiWardsRaw from "@/data/patigi-wards.json";
import patigiPUsRaw from "@/data/patigi-polling-units.json";

export const zones = zonesRaw as Zone[];
export const states = statesRaw as StateEntity[];
export const lgas = lgasRaw as LGA[];
export const national = nationalRaw as NationalTotals;

// Kwara State-specific totals for the homepage header, replacing the
// national figures for this state-scoped demo. Real, sourced figures:
// - registeredVoters: 1,695,927 — INEC's final register for the 2023 Kwara
//   State gubernatorial election.
// - totalWards / totalPollingUnits / totalLGAs: the real, sourced Kwara
//   INEC ward/PU dataset already used throughout this app — 193 wards,
//   2,886 polling units, 16 LGAs.
// - electivePositions: 34 — every position Kwara State voters elect:
//   1 Governor + 3 Senate seats (Kwara Central/North/South) + 6 House of
//   Representatives federal constituencies + 24 State House of Assembly
//   seats. (Deputy Governor runs on the Governor's ticket, not a separate
//   election.)
const kwaraStateEntity = states.find((s) => s.id === "kwara")!;
export const kwaraTotals: NationalTotals = {
  registeredVoters: 1_695_927,
  totalWards: kwaraStateEntity.wardCount,
  totalPollingUnits: kwaraStateEntity.puCount,
  totalLGAs: kwaraStateEntity.lgaCount,
  electivePositions: 34,
};

// --- Data provenance notes (be upfront about what's real vs estimated) ---
// - Zones, states, national totals: real (INEC published figures).
// - LGA names: sourced from a public Nigeria states/LGA reference dataset; a
//   small number of entries beyond the LGAs with real ward data below may
//   not perfectly match the official 774-LGA INEC list — a known
//   community-dataset quality gap, not something we've audited state-by-state.
// - Ward/PU counts per state and per LGA (outside the LGAs below): estimated
//   proportionally from national/state totals, NOT authoritative per-LGA
//   INEC figures.
// - Kwara State is fully real, all 16 LGAs: real ward names, real polling
//   unit names and INEC-derived codes (state/LGA/ward/unit delimitation,
//   e.g. Offa's "23-13-01-001"), sourced from INEC's live polling-unit
//   portal via the mykeels/inec-polling-units dataset. 16 LGAs, 193 wards,
//   2,886 polling units.
// - Beyond Kwara, 5 additional flagship LGAs carried over from the earlier
//   build, one per other geopolitical zone, same real-data rigor:
//     North East    — Adamawa  → Yola North        (11 wards, 377 PUs)
//     North West    — Kano     → Kano Municipal    (13 wards, 629 PUs)
//     South East    — Anambra  → Onitsha South     (17 wards, 321 PUs)
//     South South   — Rivers   → Port Harcourt     (20 wards, 961 PUs)
//     North Central — Plateau  → Jos North         (14 wards, 913 PUs)
//   (Plateau is North Central, the same zone as Kwara — both are real, this
//   is simply two real-data states sharing a zone in Territory Navigator.)

// The 5 non-Kwara flagship LGAs, one per other geopolitical zone.
export const FLAGSHIP_LGAS: FlagshipLGA[] = [
  { lgaId: "plateau__jos-north", zoneId: "nc", stateName: "Plateau", lgaName: "Jos North", filePrefix: "jos-north", center: FLAGSHIP_CENTERS["plateau__jos-north"] },
  { lgaId: "adamawa__yola-north", zoneId: "ne", stateName: "Adamawa", lgaName: "Yola North", filePrefix: "yola-north", center: FLAGSHIP_CENTERS["adamawa__yola-north"] },
  { lgaId: "kano__kano-municipal", zoneId: "nw", stateName: "Kano", lgaName: "Kano Municipal", filePrefix: "kano-municipal", center: FLAGSHIP_CENTERS["kano__kano-municipal"] },
  { lgaId: "anambra__onitsha-south", zoneId: "se", stateName: "Anambra", lgaName: "Onitsha South", filePrefix: "onitsha-south", center: FLAGSHIP_CENTERS["anambra__onitsha-south"] },
  { lgaId: "rivers__port-harcourt", zoneId: "ss", stateName: "Rivers", lgaName: "Port Harcourt", filePrefix: "port-harcourt", center: FLAGSHIP_CENTERS["rivers__port-harcourt"] },
];

// All 16 Kwara State LGAs, full real ward/PU coverage.
export const KWARA_LGAS: FlagshipLGA[] = [
  { lgaId: "kwara__asa", zoneId: "nc", stateName: "Kwara", lgaName: "Asa", filePrefix: "asa", center: KWARA_LGA_CENTERS["kwara__asa"] },
  { lgaId: "kwara__baruten", zoneId: "nc", stateName: "Kwara", lgaName: "Baruten", filePrefix: "baruten", center: KWARA_LGA_CENTERS["kwara__baruten"] },
  { lgaId: "kwara__edu", zoneId: "nc", stateName: "Kwara", lgaName: "Edu", filePrefix: "edu", center: KWARA_LGA_CENTERS["kwara__edu"] },
  { lgaId: "kwara__ekiti", zoneId: "nc", stateName: "Kwara", lgaName: "Ekiti", filePrefix: "kwara-ekiti", center: KWARA_LGA_CENTERS["kwara__ekiti"] },
  { lgaId: "kwara__ifelodun", zoneId: "nc", stateName: "Kwara", lgaName: "Ifelodun", filePrefix: "ifelodun", center: KWARA_LGA_CENTERS["kwara__ifelodun"] },
  { lgaId: "kwara__ilorin-east", zoneId: "nc", stateName: "Kwara", lgaName: "Ilorin East", filePrefix: "ilorin-east", center: KWARA_LGA_CENTERS["kwara__ilorin-east"] },
  { lgaId: "kwara__ilorin-south", zoneId: "nc", stateName: "Kwara", lgaName: "Ilorin South", filePrefix: "ilorin-south", center: KWARA_LGA_CENTERS["kwara__ilorin-south"] },
  { lgaId: "kwara__ilorin-west", zoneId: "nc", stateName: "Kwara", lgaName: "Ilorin West", filePrefix: "ilorin-west", center: KWARA_LGA_CENTERS["kwara__ilorin-west"] },
  { lgaId: "kwara__irepodun", zoneId: "nc", stateName: "Kwara", lgaName: "Irepodun", filePrefix: "irepodun", center: KWARA_LGA_CENTERS["kwara__irepodun"] },
  { lgaId: "kwara__isin", zoneId: "nc", stateName: "Kwara", lgaName: "Isin", filePrefix: "isin", center: KWARA_LGA_CENTERS["kwara__isin"] },
  { lgaId: "kwara__kaiama", zoneId: "nc", stateName: "Kwara", lgaName: "Kaiama", filePrefix: "kaiama", center: KWARA_LGA_CENTERS["kwara__kaiama"] },
  { lgaId: "kwara__moro", zoneId: "nc", stateName: "Kwara", lgaName: "Moro", filePrefix: "moro", center: KWARA_LGA_CENTERS["kwara__moro"] },
  { lgaId: "kwara__offa", zoneId: "nc", stateName: "Kwara", lgaName: "Offa", filePrefix: "offa", center: KWARA_LGA_CENTERS["kwara__offa"] },
  { lgaId: "kwara__oke-ero", zoneId: "nc", stateName: "Kwara", lgaName: "Oke-Ero", filePrefix: "oke-ero", center: KWARA_LGA_CENTERS["kwara__oke-ero"] },
  { lgaId: "kwara__oyun", zoneId: "nc", stateName: "Kwara", lgaName: "Oyun", filePrefix: "oyun", center: KWARA_LGA_CENTERS["kwara__oyun"] },
  { lgaId: "kwara__patigi", zoneId: "nc", stateName: "Kwara", lgaName: "Patigi", filePrefix: "patigi", center: KWARA_LGA_CENTERS["kwara__patigi"] },
];

// The live, in-simulation scope for every module (Mobilisation roster,
// Voter Intelligence, Communications audience picker, Field Operations,
// canvassing): Kwara's 16 LGAs only, per the Kwara-only demo rescope.
// FLAGSHIP_LGAS (defined above) still has real ward/PU data loaded and
// Territory Navigator can still drill into those 5 LGAs on request (its
// getWardsInLGA/getPUsInWard lookups read WARDS_BY_LGA/PUS_BY_LGA directly,
// not this array) — they're just no longer part of any module's live
// roster/audience/tracker. The name REAL_DATA_LGAS is kept for backward
// compatibility with existing imports across the codebase rather than
// renaming every call site.
export const REAL_DATA_LGAS: FlagshipLGA[] = [...KWARA_LGAS];

const WARDS_BY_LGA: Record<string, Ward[]> = {
  "plateau__jos-north": josNorthWardsRaw as Ward[],
  "adamawa__yola-north": yolaNorthWardsRaw as Ward[],
  "kano__kano-municipal": kanoMunicipalWardsRaw as Ward[],
  "anambra__onitsha-south": onitshaSouthWardsRaw as Ward[],
  "rivers__port-harcourt": portHarcourtWardsRaw as Ward[],
  "kwara__asa": asaWardsRaw as Ward[],
  "kwara__baruten": barutenWardsRaw as Ward[],
  "kwara__edu": eduWardsRaw as Ward[],
  "kwara__ekiti": kwaraEkitiWardsRaw as Ward[],
  "kwara__ifelodun": ifelodunWardsRaw as Ward[],
  "kwara__ilorin-east": ilorinEastWardsRaw as Ward[],
  "kwara__ilorin-south": ilorinSouthWardsRaw as Ward[],
  "kwara__ilorin-west": ilorinWestWardsRaw as Ward[],
  "kwara__irepodun": irepodunWardsRaw as Ward[],
  "kwara__isin": isinWardsRaw as Ward[],
  "kwara__kaiama": kaiamaWardsRaw as Ward[],
  "kwara__moro": moroWardsRaw as Ward[],
  "kwara__offa": offaWardsRaw as Ward[],
  "kwara__oke-ero": okeEroWardsRaw as Ward[],
  "kwara__oyun": oyunWardsRaw as Ward[],
  "kwara__patigi": patigiWardsRaw as Ward[],
};

const PUS_BY_LGA: Record<string, PollingUnit[]> = {
  "plateau__jos-north": josNorthPUsRaw as PollingUnit[],
  "adamawa__yola-north": yolaNorthPUsRaw as PollingUnit[],
  "kano__kano-municipal": kanoMunicipalPUsRaw as PollingUnit[],
  "anambra__onitsha-south": onitshaSouthPUsRaw as PollingUnit[],
  "rivers__port-harcourt": portHarcourtPUsRaw as PollingUnit[],
  "kwara__asa": asaPUsRaw as PollingUnit[],
  "kwara__baruten": barutenPUsRaw as PollingUnit[],
  "kwara__edu": eduPUsRaw as PollingUnit[],
  "kwara__ekiti": kwaraEkitiPUsRaw as PollingUnit[],
  "kwara__ifelodun": ifelodunPUsRaw as PollingUnit[],
  "kwara__ilorin-east": ilorinEastPUsRaw as PollingUnit[],
  "kwara__ilorin-south": ilorinSouthPUsRaw as PollingUnit[],
  "kwara__ilorin-west": ilorinWestPUsRaw as PollingUnit[],
  "kwara__irepodun": irepodunPUsRaw as PollingUnit[],
  "kwara__isin": isinPUsRaw as PollingUnit[],
  "kwara__kaiama": kaiamaPUsRaw as PollingUnit[],
  "kwara__moro": moroPUsRaw as PollingUnit[],
  "kwara__offa": offaPUsRaw as PollingUnit[],
  "kwara__oke-ero": okeEroPUsRaw as PollingUnit[],
  "kwara__oyun": oyunPUsRaw as PollingUnit[],
  "kwara__patigi": patigiPUsRaw as PollingUnit[],
};

// Flat arrays across the 5 non-Kwara flagship LGAs — used by lookups scoped
// to just those 5 (kept for backward-compat naming from the earlier build).
export const allFlagshipWards: Ward[] = FLAGSHIP_LGAS.flatMap((f) => WARDS_BY_LGA[f.lgaId]);
export const allFlagshipPUs: PollingUnit[] = FLAGSHIP_LGAS.flatMap((f) => PUS_BY_LGA[f.lgaId]);

// All 21 LGAs with real, sourced ward/PU data (16 Kwara + 5 flagship) —
// kept separate from REAL_DATA_LGAS (which is now Kwara-only, the modules'
// live scope) specifically so id-resolution helpers like getPUsInWard below
// can still resolve a flagship-LGA ward/PU id correctly. Territory
// Navigator's getWardsInLGA doesn't need this (callers pass lgaId
// directly), but getPUsInWard has to derive the LGA from a ward id's file
// prefix, and needs the full 21-LGA list to do that for flagship wards too.
const ALL_SOURCED_LGAS: FlagshipLGA[] = [...KWARA_LGAS, ...FLAGSHIP_LGAS];

export const allRealDataWards: Ward[] = ALL_SOURCED_LGAS.flatMap((f) => WARDS_BY_LGA[f.lgaId]);
export const allRealDataPUs: PollingUnit[] = ALL_SOURCED_LGAS.flatMap((f) => PUS_BY_LGA[f.lgaId]);

export function getZone(id: string) {
  return zones.find((z) => z.id === id);
}

export function getState(id: string) {
  return states.find((s) => s.id === id);
}

export function getStatesInZone(zoneId: string) {
  return states.filter((s) => s.zoneId === zoneId);
}

export function getLGA(id: string) {
  return lgas.find((l) => l.id === id);
}

export function getLGAsInState(stateId: string) {
  return lgas.filter((l) => l.stateId === stateId);
}

export function isFlagshipLGA(lgaId: string): boolean {
  return Object.prototype.hasOwnProperty.call(WARDS_BY_LGA, lgaId);
}

export function getFlagship(lgaId: string): FlagshipLGA | undefined {
  return REAL_DATA_LGAS.find((f) => f.lgaId === lgaId);
}

export function getWardsInLGA(lgaId: string): Ward[] {
  return WARDS_BY_LGA[lgaId] ?? []; // no real/generated ward-level data for LGAs outside the 21 above
}

export function getPUsInWard(wardId: string): PollingUnit[] {
  // wardId prefix (before "__ward-") tells us which LGA's PU list to search.
  // Resolved against ALL_SOURCED_LGAS (not the Kwara-only REAL_DATA_LGAS)
  // so this still works for the 5 flagship LGAs' wards in Territory
  // Navigator, even though no module's live scope includes them anymore.
  const lgaId = ALL_SOURCED_LGAS.find((f) => wardId.startsWith(f.filePrefix + "__"))?.lgaId;
  const pool = lgaId ? PUS_BY_LGA[lgaId] : allRealDataPUs;
  return pool.filter((pu) => pu.wardId === wardId);
}

const puById = new Map(allRealDataPUs.map((pu) => [pu.id, pu]));
const wardById = new Map(allRealDataWards.map((w) => [w.id, w]));

export function getPU(id: string) {
  return puById.get(id);
}

export function getWard(id: string) {
  return wardById.get(id);
}

export const KWARA_STATE_ID = "kwara";
