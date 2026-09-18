// Bulk simulation helpers for the Canvass Assignment pilot roster (Session 2).
// Mirrors lib/mobilisation-group-sim.ts's role: produce the same end state a
// presenter clicking through the party-member app by hand would produce,
// just batched — reusing the store's own actions (ensureBlocksForPU,
// assignBlock, ensureVotersForBlock, setVoterStatus, completeBlock) rather
// than duplicating any generation/assignment logic. Because assignBlock only
// ever succeeds on a currently-unassigned block, running this across many
// members who happen to share a home PU still can't hand two members the
// same block — the dedup guarantee holds under bulk simulation exactly as it
// does under manual clicking.

import type { CanvassContactStatus, PartyMemberProfile } from "./types";
import { DEFAULT_BLOCK_SIZE } from "./types";
import { seededInt } from "./seed";
import { useCanvassStore } from "./store/canvass";

// Illustrative contact-outcome distribution for simulated voters — not
// modelling any real sentiment data, just varied enough that a coverage
// dashboard (Session 3) has something other than a flat number to show.
function seededContactStatus(seed: string): CanvassContactStatus {
  const r = seededInt(seed, 0, 99);
  if (r < 55) return "supportive";
  if (r < 75) return "undecided";
  if (r < 90) return "opposed";
  return "unreachable";
}

// Has this member already claimed (or completed) any block? Used to skip
// members a presenter has already interacted with by hand, so repeated
// clicks of "Simulate remaining pilot roster" progress through the roster
// instead of re-simulating the same people.
export function isMemberProcessed(memberId: string): boolean {
  return Object.values(useCanvassStore.getState().blocks).some((b) => b.assignedMemberId === memberId);
}

// Resolves every not-yet-contacted voter in one block to a seeded status.
// Used both by the bulk pilot simulation and by the single-member page's
// own "Auto-fill remaining" convenience action (clicking through 30-75
// voters one at a time during a live pitch isn't realistic — a presenter
// hand-updates a couple to show the mechanic, then auto-fills the rest).
export function autoFillBlock(blockId: string, tsNow: number): void {
  const store = useCanvassStore.getState();
  store.ensureVotersForBlock(blockId);
  const pending = Object.values(useCanvassStore.getState().voters).filter(
    (v) => v.blockId === blockId && v.contactStatus === "not_contacted"
  );
  pending.forEach((v, i) => {
    store.setVoterStatus(v.id, seededContactStatus(`${blockId}-fill-${i}-${tsNow}`), tsNow + i);
  });
}

// Simulates one party member fully working one block of their home PU:
// cuts that PU's blocks at the default size if nobody has touched it yet
// (idempotent — a no-op if blocks already exist), claims the next
// unassigned block, resolves every voter, and marks it complete. Returns
// false if the member's PU has no unassigned block left (fully covered by
// other members already).
export function simulateMemberBlock(member: PartyMemberProfile, tsNow: number): boolean {
  if (!member.assignedPuId) return false;
  const store = useCanvassStore.getState();
  store.ensureBlocksForPU(member.assignedPuId, DEFAULT_BLOCK_SIZE);

  const blocksForPu = Object.values(useCanvassStore.getState().blocks).filter((b) => b.puId === member.assignedPuId);
  const target = blocksForPu.find((b) => b.status === "unassigned");
  if (!target) return false;

  if (!store.assignBlock(target.id, member.id, tsNow)) return false;

  autoFillBlock(target.id, tsNow + 1);
  store.completeBlock(target.id, tsNow + 2);
  return true;
}
