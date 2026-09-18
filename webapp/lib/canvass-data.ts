// Canvass Assignment & Deduplication Engine — data layer (Session 1).
//
// Generates configurable-size, non-overlapping canvass blocks and
// illustrative synthetic voter names laid over REAL INEC polling-unit
// geography (Kwara's 16 LGAs / 193 wards / 2,886 PUs, already loaded in
// lib/data.ts). See lib/types.ts's "Canvass Assignment" section for the
// data-provenance note: nothing generated here is a real voter — this
// stands in for a certified register the campaign has not yet obtained
// (Electoral Act 2022 s.15 is the lawful route to one).
//
// Design choice: with ~588 estimated voters/PU x 2,886 PUs (~1.7M
// illustrative voters), nothing here is eagerly generated. Blocks and
// voters are computed deterministically on demand from a PU/block id, the
// same "seeded, not stored" pattern lib/seed.ts already uses for coverage
// percentages — so the same id always produces the same demo data across
// reloads and between rehearsal and a live pitch, without ever holding
// millions of records in memory.

import type {
  CanvassBlock,
  CanvassVoter,
  CanvassDataSource,
  PartyMemberProfile,
} from "./types";
import { DEFAULT_BLOCK_SIZE } from "./types";
import { getPU, getPUsInWard, getWard, getWardsInLGA, REAL_DATA_LGAS } from "./data";
import { seededInt, hashString } from "./seed";
import { FIELD_AGENTS } from "./mobilisation-data";

// ---------------------------------------------------------------------------
// Block-size configuration
// ---------------------------------------------------------------------------

// Presets (30/50/75) live in lib/types.ts alongside DEFAULT_BLOCK_SIZE since
// the UI needs them too. Custom sizes are accepted outside the presets, but
// clamped to a sane range: below MIN a "block" stops being a meaningful
// canvassing unit, above MAX it stops being achievable by one member and
// starts silently reintroducing the overlap problem this engine exists to
// prevent.
export const MIN_BLOCK_SIZE = 10;
export const MAX_BLOCK_SIZE = 300;

export function clampBlockSize(size: number): number {
  if (!Number.isFinite(size) || size <= 0) return DEFAULT_BLOCK_SIZE;
  return Math.max(MIN_BLOCK_SIZE, Math.min(MAX_BLOCK_SIZE, Math.round(size)));
}

// ---------------------------------------------------------------------------
// Illustrative per-PU voter counts
// ---------------------------------------------------------------------------

// NOT a real registered-voter count — no certified register is loaded (see
// module header). Deterministically seeded per PU so a given PU always
// shows the same illustrative total, in a range consistent with the
// state-wide averages computed from real 2023 INEC register totals in the
// project report (~530-590 voters/PU across Kwara and Ogun).
export function estimatedRegisteredVotersForPU(puId: string): number {
  return seededInt(`${puId}-est-voters`, 350, 900);
}

// ---------------------------------------------------------------------------
// Block generation
// ---------------------------------------------------------------------------

function blockCount(estimatedVoters: number, targetSize: number): number {
  return Math.max(1, Math.ceil(estimatedVoters / targetSize));
}

// Blocks for a single PU. Block ids are `${puId}-B${n}` — globally unique
// because INEC's own PU codes (e.g. "23-01-01-001") already are, so no
// separate global counter or registry is needed to avoid collisions.
export function generateBlocksForPU(
  puId: string,
  targetSize: number = DEFAULT_BLOCK_SIZE,
  dataSource: CanvassDataSource = "demo_synthetic"
): CanvassBlock[] {
  const pu = getPU(puId);
  if (!pu) return [];
  const ward = getWard(pu.wardId);
  const size = clampBlockSize(targetSize);
  const estimated = estimatedRegisteredVotersForPU(puId);
  const n = blockCount(estimated, size);

  return Array.from({ length: n }).map((_, i) => ({
    id: `${puId}-B${i + 1}`,
    puId,
    wardId: pu.wardId,
    lgaId: ward?.lgaId ?? "",
    targetSize: size,
    status: "unassigned" as const,
    dataSource,
  }));
}

export function generateBlocksForWard(
  wardId: string,
  targetSize: number = DEFAULT_BLOCK_SIZE,
  dataSource: CanvassDataSource = "demo_synthetic"
): CanvassBlock[] {
  return getPUsInWard(wardId).flatMap((pu) => generateBlocksForPU(pu.id, targetSize, dataSource));
}

export function generateBlocksForLGA(
  lgaId: string,
  targetSize: number = DEFAULT_BLOCK_SIZE,
  dataSource: CanvassDataSource = "demo_synthetic"
): CanvassBlock[] {
  return getWardsInLGA(lgaId).flatMap((w) => generateBlocksForWard(w.id, targetSize, dataSource));
}

// ---------------------------------------------------------------------------
// Synthetic voter names, generated lazily per block
// ---------------------------------------------------------------------------
// A larger, dedicated name pool (30 x 30 = 900 combinations) from the
// agent/constituent pools elsewhere in the app, so the three rosters read as
// visually distinct groups when shown side by side. Uniqueness is
// guaranteed WITHIN a block (via an index permutation over the pool, same
// technique as lib/mobilisation-data.ts) up to the pool size; a custom
// block size beyond 900 falls back to a numbered suffix rather than
// silently repeating a bare name.

const VOTER_FIRST_NAMES = [
  "Abiodun", "Halima", "Chukwudi", "Rukayat", "Damilare", "Fatima", "Obinna", "Aduke", "Suleman", "Nkechi",
  "Wasiu", "Adaeze", "Ismail", "Temitope", "Chiamaka", "Nurudeen", "Onyinye", "Kazeem", "Ejiro", "Umar",
  "Titilayo", "Chinyere", "Rasheed", "Bukola", "Onyekachi", "Fausat", "Uzoma", "Habeeb", "Adaobi", "Sikiru",
];
const VOTER_LAST_NAMES = [
  "Afolabi", "Mustapha", "Nnamdi", "Salawu", "Ogunleye", "Abiola", "Iwuchukwu", "Yusuff", "Chukwuma", "Lasisi",
  "Nnaji", "Adisa", "Ogundipe", "Bakare", "Anyanwu", "Shittu", "Nweke", "Adegoke", "Umeadi", "Rabiu",
  "Ojo", "Nwabueze", "Aderibigbe", "Momoh", "Ikechukwu", "Fashola", "Onuoha", "Gambo", "Ejike", "Alabi",
];
const VOTER_NAME_TOTAL = VOTER_FIRST_NAMES.length * VOTER_LAST_NAMES.length; // 900
const VOTER_NAME_MULT = 233; // coprime with 900

function nameForVoterIndex(i: number): string {
  const perm = (i * VOTER_NAME_MULT) % VOTER_NAME_TOTAL;
  const f = VOTER_FIRST_NAMES[Math.floor(perm / VOTER_LAST_NAMES.length)];
  const l = VOTER_LAST_NAMES[perm % VOTER_LAST_NAMES.length];
  return `${f} ${l}`;
}

// Deterministic per-block starting offset into the permutation space, so
// two different blocks are unlikely to open on the same name but a given
// block always regenerates identically.
function blockNameOffset(blockId: string): number {
  return hashString(blockId) % VOTER_NAME_TOTAL;
}

export function getVotersForBlock(block: Pick<CanvassBlock, "id" | "targetSize" | "dataSource">): CanvassVoter[] {
  const offset = blockNameOffset(block.id);
  return Array.from({ length: block.targetSize }).map((_, i) => {
    const base = nameForVoterIndex(offset + i);
    // Beyond the 900-name pool (only reachable with a large custom block
    // size), disambiguate with a numbered suffix instead of repeating a name.
    const name = i >= VOTER_NAME_TOTAL ? `${base} (${i + 1})` : base;
    return {
      id: `${block.id}-V${i + 1}`,
      blockId: block.id,
      name,
      contactStatus: "not_contacted" as const,
    };
  });
}

// ---------------------------------------------------------------------------
// Party member roster (canvassers who own blocks)
// ---------------------------------------------------------------------------
// Illustrative sample roster, generated lazily per ward — not eagerly
// materialized for all 193 Kwara wards, since a real deployment's actual
// membership roll is campaign-provided, not demo-generated. Names are
// seeded-hash based (not permutation-guaranteed-unique like the smaller
// agent/constituent rosters) since a full-state party-member roster is
// potentially thousands of people — collisions are rare with a 900-name
// pool and acceptable for illustrative purposes at that scale.

const MEMBER_FIRST_NAMES = [
  "Kayode", "Amina", "Chukwuemeka", "Zainab", "Oluwaseun", "Maimuna", "Ikenna", "Hadiza", "Babatunde", "Ronke",
  "Chidi", "Salamatu", "Ayodeji", "Rashida", "Nonso", "Khadija", "Feyisayo", "Jamilu", "Adanna", "Sadiya",
];
const MEMBER_LAST_NAMES = [
  "Fagbenle", "Suleiman", "Okeke", "Abdulkadir", "Ogunbiyi", "Tanko", "Anozie", "Bawa", "Ojedokun", "Idowu",
  "Nwokocha", "Shehu", "Fatunbi", "Auwal", "Ndukwe", "Isyaku", "Ajala", "Kabir", "Ihenacho", "Namadi",
];

function nameForMemberSeed(seed: string): string {
  const f = MEMBER_FIRST_NAMES[hashString(seed + "f") % MEMBER_FIRST_NAMES.length];
  const l = MEMBER_LAST_NAMES[hashString(seed + "l") % MEMBER_LAST_NAMES.length];
  return `${f} ${l}`;
}

function phoneForMember(seed: string): string {
  const n = seededInt(seed + "phone", 7000000, 7999999);
  return `+234 80${seededInt(seed, 1, 9)} ${n.toString().slice(0, 3)} ${n.toString().slice(3)}`;
}

// Each member gets a fixed home PU within the ward (i-th member -> i-th PU,
// wrapping if the ward has fewer PUs than requested members — which, in a
// small ward, is itself a useful demo case: two different members legitimately
// share a PU but always work distinct blocks within it, never the same one).
export function getPartyMembersForWard(wardId: string, count = 4): PartyMemberProfile[] {
  const ward = getWard(wardId);
  const pus = getPUsInWard(wardId);
  return Array.from({ length: count }).map((_, i) => {
    const seed = `${wardId}-member-${i}`;
    const pu = pus.length ? pus[i % pus.length] : undefined;
    return {
      id: seed,
      name: nameForMemberSeed(seed),
      phone: phoneForMember(seed),
      role: "party_member" as const,
      lgaId: ward?.lgaId ?? "",
      wardId,
      assignedPuId: pu?.id ?? "",
    };
  });
}

// ---------------------------------------------------------------------------
// Pilot roster for the demo (Session 2)
// ---------------------------------------------------------------------------
// Reuses the same 16 wards already hosting a canvasser in mobilisation-data.ts
// (one per Kwara LGA) so the new party-member roster sits alongside the
// existing Mobilisation roster at a comparable, presenter-friendly scale
// (48 members, matching FIELD_AGENTS' 48) rather than eagerly generating
// members for all 193 Kwara wards. A real
// deployment's actual membership roll would be campaign-provided, not
// demo-generated — see the report's Section 6/7 phasing discussion for why
// full-state coverage needs many more members than a demo roster shows.
export const CANVASS_PILOT_WARD_IDS: string[] = FIELD_AGENTS.filter((a) => a.role === "canvasser").map(
  (a) => a.assignedWardId!
);

export const PARTY_MEMBERS: PartyMemberProfile[] = CANVASS_PILOT_WARD_IDS.flatMap((wardId) =>
  getPartyMembersForWard(wardId, 3)
);

export function getPartyMember(id: string): PartyMemberProfile | undefined {
  return PARTY_MEMBERS.find((m) => m.id === id);
}

// ---------------------------------------------------------------------------
// Coverage summary — a small pure helper Session 3's dashboard will reuse.
// ---------------------------------------------------------------------------

export type CoverageSummary = {
  totalBlocks: number;
  assignedBlocks: number;
  completedBlocks: number;
  unassignedBlocks: number;
  totalPUsCovered: number; // distinct PUs with >=1 non-unassigned block
  totalPUs: number;
};

export function summarizeCoverage(blocks: CanvassBlock[], allPuIdsInScope: string[]): CoverageSummary {
  const puWithActivity = new Set(blocks.filter((b) => b.status !== "unassigned").map((b) => b.puId));
  return {
    totalBlocks: blocks.length,
    assignedBlocks: blocks.filter((b) => b.status === "assigned").length,
    completedBlocks: blocks.filter((b) => b.status === "completed").length,
    unassignedBlocks: blocks.filter((b) => b.status === "unassigned").length,
    totalPUsCovered: puWithActivity.size,
    totalPUs: allPuIdsInScope.length,
  };
}

// How many blocks a FULL cut of this scope (every PU, not just the ones a
// coordinator has actually generated blocks for yet) would require at a
// given size — the same "why phasing is necessary" arithmetic as the
// project report's Section 7 table, computed live for whatever scope the
// Command Center is currently viewing (a ward, an LGA, or the whole
// pilot). Purely illustrative, same estimated-voters caveat as everywhere
// else in this file.
export function estimatedFullCoverageBlockCount(puIds: string[], targetSize: number = DEFAULT_BLOCK_SIZE): number {
  const size = clampBlockSize(targetSize);
  return puIds.reduce((sum, puId) => sum + blockCount(estimatedRegisteredVotersForPU(puId), size), 0);
}

// REAL_DATA_LGAS is re-exported here purely so the verification script (and
// later, a "generate for whole state" admin action) can enumerate scope
// without importing lib/data.ts directly for that one purpose.
export { REAL_DATA_LGAS };
