import { create } from "zustand";
import type { CanvassBlock, CanvassVoter, CanvassEvent, CanvassContactStatus, CanvassDataSource, WardPriorityTier } from "@/lib/types";
import { generateBlocksForPU, generateBlocksForWard, getVotersForBlock, clampBlockSize } from "@/lib/canvass-data";
import { DEFAULT_BLOCK_SIZE } from "@/lib/types";

// Canvass Assignment & Deduplication Engine — store (Session 1).
//
// Deliberately a separate store from useMobilisationStore/useElectionDayStore
// (different concern: multi-week pre-election canvassing vs. Election Day's
// single-day field ops) but follows the same conventions: a flat
// Record<id, ...> for live state, an append-only `events` feed, and no
// direct mutation outside the store's own actions.
//
// Blocks/voters are loaded LAZILY per PU/ward (via ensureBlocksForPU /
// ensureBlocksForWard) rather than pre-generated for the whole state at
// init, since a full Kwara state-wide generation is ~35,000 blocks at the
// 50-voter default — fine to hold in memory, but unnecessary until a
// coordinator is actually looking at that ward. This mirrors how a real
// deployment would load a certified register: per constituency, not all at
// once.
//
// THE CORE GUARANTEE this store exists to enforce: a block can only move
// unassigned -> assigned via assignBlock, and assignBlock is a no-op unless
// the block is currently unassigned. There is no code path that assigns an
// already-assigned block to a second member — the same "cut once, hand out
// once" principle as the report's turf-cutting section, enforced at the
// data layer rather than by UI discipline or manual coordination.

type CanvassStore = {
  blocks: Record<string, CanvassBlock>;
  voters: Record<string, CanvassVoter>;
  events: CanvassEvent[];

  // Lazy generation — idempotent (a PU/ward already loaded is a no-op).
  ensureBlocksForPU: (puId: string, targetSize?: number, dataSource?: CanvassDataSource) => void;
  ensureBlocksForWard: (wardId: string, targetSize?: number, dataSource?: CanvassDataSource) => void;

  // Explicit resize: replaces a PU's blocks with a fresh cut at a new target
  // size. Refuses (no-op) if any existing block for that PU is already
  // assigned or completed, so a coordinator can't silently blow away
  // in-progress canvassing by changing the block-size preset later.
  regenerateBlocksForPU: (puId: string, targetSize: number, dataSource?: CanvassDataSource) => boolean;

  ensureVotersForBlock: (blockId: string) => void;

  assignBlock: (blockId: string, memberId: string, ts: number) => boolean;
  returnBlockToPool: (blockId: string, ts: number, reason?: "attrition" | "manual") => boolean;
  completeBlock: (blockId: string, ts: number) => boolean;

  setVoterStatus: (voterId: string, status: CanvassContactStatus, ts: number) => void;

  // Coordinator-set ward priority (Session 3, Command Center) — see the
  // WardPriorityTier doc comment in lib/types.ts for why this is manual
  // input, not a computed score. Passing null clears a ward's tier.
  wardPriority: Record<string, WardPriorityTier>;
  setWardPriority: (wardId: string, tier: WardPriorityTier | null) => void;

  reset: () => void;
};

export const useCanvassStore = create<CanvassStore>((set, get) => ({
  blocks: {},
  voters: {},
  events: [],
  wardPriority: {},

  ensureBlocksForPU: (puId, targetSize = DEFAULT_BLOCK_SIZE, dataSource = "demo_synthetic") => {
    const already = Object.values(get().blocks).some((b) => b.puId === puId);
    if (already) return;
    const fresh = generateBlocksForPU(puId, targetSize, dataSource);
    set((s) => ({
      blocks: { ...s.blocks, ...Object.fromEntries(fresh.map((b) => [b.id, b])) },
    }));
  },

  ensureBlocksForWard: (wardId, targetSize = DEFAULT_BLOCK_SIZE, dataSource = "demo_synthetic") => {
    const already = Object.values(get().blocks).some((b) => b.wardId === wardId);
    if (already) return;
    const fresh = generateBlocksForWard(wardId, targetSize, dataSource);
    set((s) => ({
      blocks: { ...s.blocks, ...Object.fromEntries(fresh.map((b) => [b.id, b])) },
    }));
  },

  regenerateBlocksForPU: (puId, targetSize, dataSource = "demo_synthetic") => {
    const existing = Object.values(get().blocks).filter((b) => b.puId === puId);
    const hasInProgress = existing.some((b) => b.status !== "unassigned");
    if (hasInProgress) return false;

    const size = clampBlockSize(targetSize);
    const fresh = generateBlocksForPU(puId, size, dataSource);
    set((s) => {
      const blocks = { ...s.blocks };
      for (const b of existing) delete blocks[b.id];
      for (const b of fresh) blocks[b.id] = b;
      return { blocks };
    });
    return true;
  },

  ensureVotersForBlock: (blockId) => {
    const block = get().blocks[blockId];
    if (!block) return;
    const already = Object.keys(get().voters).some((id) => id.startsWith(`${blockId}-V`));
    if (already) return;
    const fresh = getVotersForBlock(block);
    set((s) => ({
      voters: { ...s.voters, ...Object.fromEntries(fresh.map((v) => [v.id, v])) },
    }));
  },

  assignBlock: (blockId, memberId, ts) => {
    const block = get().blocks[blockId];
    if (!block || block.status !== "unassigned") return false;
    set((s) => ({
      blocks: { ...s.blocks, [blockId]: { ...block, status: "assigned", assignedMemberId: memberId } },
      events: [{ type: "block_assigned", blockId, memberId, ts }, ...s.events],
    }));
    return true;
  },

  returnBlockToPool: (blockId, ts, reason = "manual") => {
    const block = get().blocks[blockId];
    if (!block || block.status !== "assigned") return false;
    set((s) => ({
      blocks: { ...s.blocks, [blockId]: { ...block, status: "unassigned", assignedMemberId: undefined } },
      events: [{ type: "block_returned_to_pool", blockId, ts, reason }, ...s.events],
    }));
    return true;
  },

  completeBlock: (blockId, ts) => {
    const block = get().blocks[blockId];
    if (!block || block.status !== "assigned" || !block.assignedMemberId) return false;
    set((s) => ({
      blocks: { ...s.blocks, [blockId]: { ...block, status: "completed" } },
      events: [{ type: "block_completed", blockId, memberId: block.assignedMemberId!, ts }, ...s.events],
    }));
    return true;
  },

  setVoterStatus: (voterId, status, ts) => {
    const voter = get().voters[voterId];
    if (!voter) return;
    set((s) => ({
      voters: { ...s.voters, [voterId]: { ...voter, contactStatus: status } },
      events: [{ type: "voter_status_updated", voterId, blockId: voter.blockId, status, ts }, ...s.events],
    }));
  },

  setWardPriority: (wardId, tier) =>
    set((s) => {
      const wardPriority = { ...s.wardPriority };
      if (tier === null) delete wardPriority[wardId];
      else wardPriority[wardId] = tier;
      return { wardPriority };
    }),

  reset: () => set({ blocks: {}, voters: {}, events: [], wardPriority: {} }),
}));
