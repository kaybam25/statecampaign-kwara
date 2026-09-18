import type { FieldAgentProfile, ConstituentContact } from "./types";
import { REAL_DATA_LGAS, getWardsInLGA, getPUsInWard } from "./data";
import { seededInt } from "./seed";

// Sample field-agent roster for the Mobilisation Module demo: 2 polling
// agents + 1 canvasser/transport coordinator per LGA, across Kwara's 16
// LGAs (REAL_DATA_LGAS — the demo's live scope is Kwara-only, see the note
// on REAL_DATA_LGAS in lib/data.ts) — 48 field agents total. Each polling
// agent is deterministically bound to a distinct real PU within their LGA
// (2 PUs per LGA), and the canvasser to a distinct real ward.
// Names/phone numbers are illustrative demo people, not real individuals.
//
// Names are assigned via a bijective index permutation (index * multiplier
// mod pool-size, multiplier coprime with the pool size) rather than a hash,
// so every agent — and every canvassed contact below — gets a guaranteed
// unique name across the whole roster instead of a merely low-collision one.

const AGENT_FIRST_NAMES = [
  "Chidinma", "Aliyu", "Blessing", "Musa", "Ngozi", "Ibrahim", "Funke", "Emeka", "Hauwa", "Tunde",
  "Amaka", "Sani", "Folake", "Yakubu", "Ifeoma", "Abdullahi", "Toyin", "Chinedu", "Maryam", "Segun",
];
const AGENT_LAST_NAMES = [
  "Okafor", "Bello", "Eze", "Abubakar", "Adeyemi", "Yakubu", "Nwosu", "Suleiman", "Okoro", "Danjuma",
  "Adebayo", "Mohammed", "Chukwu", "Garba", "Okonkwo", "Sadiq", "Balogun", "Idris", "Nwankwo", "Usman",
];
const AGENT_NAME_TOTAL = AGENT_FIRST_NAMES.length * AGENT_LAST_NAMES.length; // 400
const AGENT_NAME_MULT = 41; // coprime with 400 — makes the index->name mapping bijective

function nameForAgentIndex(i: number): string {
  const perm = (i * AGENT_NAME_MULT) % AGENT_NAME_TOTAL;
  const f = AGENT_FIRST_NAMES[Math.floor(perm / AGENT_LAST_NAMES.length)];
  const l = AGENT_LAST_NAMES[perm % AGENT_LAST_NAMES.length];
  return `${f} ${l}`;
}

function phoneFor(seed: string) {
  const n = seededInt(seed + "phone", 7000000, 7999999);
  return `+234 80${seededInt(seed, 1, 9)} ${n.toString().slice(0, 3)} ${n.toString().slice(3)}`;
}

let agentNameIndex = 0;

export const FIELD_AGENTS: FieldAgentProfile[] = REAL_DATA_LGAS.flatMap((f) => {
  const wards = getWardsInLGA(f.lgaId);
  if (wards.length === 0) return [];
  const puA = getPUsInWard(wards[0].id)[0];
  const midWard = wards[Math.floor(wards.length / 2) % wards.length];
  const midWardPUs = getPUsInWard(midWard.id);
  const puB = midWardPUs[Math.min(2, midWardPUs.length - 1)];
  const canvasserWard = wards[Math.min(1, wards.length - 1)];

  const agents: FieldAgentProfile[] = [];
  if (puA) {
    const seed = `${f.lgaId}-agentA`;
    agents.push({ id: seed, name: nameForAgentIndex(agentNameIndex++), phone: phoneFor(seed), role: "polling_agent", lgaId: f.lgaId, assignedPuId: puA.id });
  }
  if (puB) {
    const seed = `${f.lgaId}-agentB`;
    agents.push({ id: seed, name: nameForAgentIndex(agentNameIndex++), phone: phoneFor(seed), role: "polling_agent", lgaId: f.lgaId, assignedPuId: puB.id });
  }
  const cSeed = `${f.lgaId}-canvasser`;
  agents.push({ id: cSeed, name: nameForAgentIndex(agentNameIndex++), phone: phoneFor(cSeed), role: "canvasser", lgaId: f.lgaId, assignedWardId: canvasserWard.id });

  return agents;
});

export function getAgent(id: string): FieldAgentProfile | undefined {
  return FIELD_AGENTS.find((a) => a.id === id);
}

export function getAgentsForLga(lgaId: string): FieldAgentProfile[] {
  return FIELD_AGENTS.filter((a) => a.lgaId === lgaId);
}

// --- Canvassed constituent contacts -----------------------------------------
// Each canvasser (one per LGA, 21 total) owns a reserved, non-overlapping
// block of the shared name-permutation space, so every canvassed contact
// across the ENTIRE demo — not just within one ward — has a unique name.

const CONSTITUENT_FIRST_NAMES = [
  "Grace", "Yusuf", "Chioma", "Ahmed", "Peace", "Kabir", "Joy", "Bashir", "Uche", "Zainab",
  "Ngozi", "Tijani", "Comfort", "Kelechi", "Ifeanyi", "Aisha", "Emmanuel", "Rahila", "Chinwe", "Lawal",
];
const CONSTITUENT_LAST_NAMES = [
  "Umeh", "Garba", "Nwachukwu", "Lawal", "Okoli", "Musa", "Ike", "Aliyu", "Adeleke", "Sule",
  "Okonkwo", "Danladi", "Nwafor", "Bala", "Chukwuemeka", "Yahaya", "Obi", "Muktar", "Nwadike", "Abdullahi",
];
const CONSTITUENT_NAME_TOTAL = CONSTITUENT_FIRST_NAMES.length * CONSTITUENT_LAST_NAMES.length; // 400
const CONSTITUENT_NAME_MULT = 91; // coprime with 400 (7 x 13)
const CONSTITUENT_BLOCK_SIZE = 12; // per-canvasser reserved slice (default count is 6, room to grow)

function nameForConstituentIndex(i: number): string {
  const perm = (i * CONSTITUENT_NAME_MULT) % CONSTITUENT_NAME_TOTAL;
  const f = CONSTITUENT_FIRST_NAMES[Math.floor(perm / CONSTITUENT_LAST_NAMES.length)];
  const l = CONSTITUENT_LAST_NAMES[perm % CONSTITUENT_LAST_NAMES.length];
  return `${f} ${l}`;
}

// wardId -> reserved starting index in the constituent name-permutation space.
// Built once, in FIELD_AGENTS order, so it's stable across reloads.
const CANVASSER_WARD_BLOCK: Map<string, number> = new Map();
FIELD_AGENTS.filter((a) => a.role === "canvasser").forEach((a, i) => {
  CANVASSER_WARD_BLOCK.set(a.assignedWardId!, i * CONSTITUENT_BLOCK_SIZE);
});

// Deterministic sample constituent list for a given canvasser (ward-level).
// Guaranteed unique names across the whole app (not just within this ward)
// via the reserved block above.
export function getConstituentsForWard(wardId: string, count = 6): ConstituentContact[] {
  const pus = getPUsInWard(wardId);
  const blockStart = CANVASSER_WARD_BLOCK.get(wardId) ?? seededInt(wardId, 0, CONSTITUENT_NAME_TOTAL / CONSTITUENT_BLOCK_SIZE - 1) * CONSTITUENT_BLOCK_SIZE;
  return Array.from({ length: count }).map((_, i) => {
    const seed = `${wardId}-constituent-${i}`;
    const name = nameForConstituentIndex(blockStart + (i % CONSTITUENT_BLOCK_SIZE));
    const pu = pus.length ? pus[seededInt(seed + "pu", 0, pus.length - 1)] : undefined;
    return {
      id: seed,
      name,
      puName: pu?.name ?? "Unassigned PU",
      needsTransport: seededInt(seed + "transport", 0, 100) < 35,
    };
  });
}
