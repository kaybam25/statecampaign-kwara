"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useCanvassStore } from "@/lib/store/canvass";
import {
  PARTY_MEMBERS,
  getPartyMember,
  estimatedRegisteredVotersForPU,
  clampBlockSize,
  MIN_BLOCK_SIZE,
  MAX_BLOCK_SIZE,
} from "@/lib/canvass-data";
import { simulateMemberBlock, autoFillBlock, isMemberProcessed } from "@/lib/canvass-group-sim";
import { getPU, getWard, getFlagship } from "@/lib/data";
import { BLOCK_SIZE_PRESETS, DEFAULT_BLOCK_SIZE, type CanvassContactStatus } from "@/lib/types";
import PhoneFrame from "@/components/mobilisation/PhoneFrame";
import { StepCard, PrimaryButton, Badge } from "@/components/mobilisation/StepCard";

const STATUS_LABEL: Record<CanvassContactStatus, string> = {
  not_contacted: "Not yet contacted",
  supportive: "Supportive",
  undecided: "Undecided",
  opposed: "Opposed",
  unreachable: "Unreachable",
};

const STATUS_TONE: Record<CanvassContactStatus, "green" | "amber" | "red" | "zinc"> = {
  not_contacted: "zinc",
  supportive: "green",
  undecided: "amber",
  opposed: "red",
  unreachable: "zinc",
};

export default function PartyMemberAppPage() {
  const [memberId, setMemberId] = useState(PARTY_MEMBERS[0].id);
  const member = getPartyMember(memberId)!;
  const pu = getPU(member.assignedPuId);
  const ward = getWard(member.wardId);
  const flagship = getFlagship(member.lgaId);

  const canvass = useCanvassStore();

  // Local, not-yet-generated block-size choice for this PU. Reset whenever
  // the presenter switches "Signed in as" — same fix as the existing
  // agent/canvasser pages apply to their own local form state.
  const [sizeChoice, setSizeChoice] = useState<number>(DEFAULT_BLOCK_SIZE);
  const [customSize, setCustomSize] = useState<string>("");
  useEffect(() => {
    setSizeChoice(DEFAULT_BLOCK_SIZE);
    setCustomSize("");
  }, [memberId]);

  const blocksForPu = useMemo(
    () => Object.values(canvass.blocks).filter((b) => b.puId === member.assignedPuId).sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [canvass.blocks, member.assignedPuId]
  );
  const myBlocks = blocksForPu.filter((b) => b.assignedMemberId === member.id);
  const myAssigned = myBlocks.filter((b) => b.status === "assigned");
  const myCompleted = myBlocks.filter((b) => b.status === "completed");
  const nextUnassigned = blocksForPu.find((b) => b.status === "unassigned");

  const remainingToSimulate = PARTY_MEMBERS.filter((m) => !isMemberProcessed(m.id)).length;

  const estimatedVoters = pu ? estimatedRegisteredVotersForPU(pu.id) : 0;

  const generateBlocks = () => {
    if (!pu) return;
    canvass.ensureBlocksForPU(pu.id, clampBlockSize(sizeChoice));
  };

  const claimNext = () => {
    if (!nextUnassigned) return;
    canvass.assignBlock(nextUnassigned.id, member.id, Date.now());
  };

  const handleBulkSimulate = () => {
    const now = Date.now();
    PARTY_MEMBERS.filter((m) => !isMemberProcessed(m.id))
      .slice(0, 25)
      .forEach((m, i) => simulateMemberBlock(m, now + i));
  };

  return (
    <div className="min-h-screen bg-zinc-50 p-6">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-co-navy">Party Member Canvassing App</h1>
          <p className="text-xs text-zinc-500">
            Pre-election canvassing — each member owns a fixed, non-overlapping block of voters within one polling unit. Demo data only; see the note below.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleBulkSimulate}
            disabled={remainingToSimulate === 0}
            title="Simulate the next batch of pilot party members claiming a block, canvassing it, and marking it complete"
            className="rounded-lg bg-co-green px-3 py-1.5 text-xs font-semibold text-white hover:bg-co-green/90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {remainingToSimulate === 0 ? `All ${PARTY_MEMBERS.length} Members Simulated` : `Simulate Pilot Roster (${Math.min(25, remainingToSimulate)})`}
          </button>
          {Object.keys(canvass.blocks).length > 0 && (
            <button
              onClick={canvass.reset}
              className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-500 hover:bg-zinc-50"
              title="Clear all canvass blocks, voters and assignments and start over"
            >
              Reset Canvassing
            </button>
          )}
          <Link href="/mobilisation/canvass-command" className="rounded-lg bg-co-navy px-3 py-1.5 text-xs font-semibold text-white hover:bg-co-navy/90">
            Canvassing Coverage &rarr;
          </Link>
          <Link href="/mobilisation/command" className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-500 hover:bg-zinc-50">
            Election Day Admin &rarr;
          </Link>
          <Link href="/modules/mobilisation" className="text-xs text-zinc-400 underline hover:text-co-navy">
            &larr; Mobilisation Hub
          </Link>
        </div>
      </header>

      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3">
        <label className="flex items-center gap-2 text-xs font-medium text-zinc-500">
          Signed in as:
          <select
            value={memberId}
            onChange={(e) => setMemberId(e.target.value)}
            className="rounded-lg border border-zinc-200 px-2 py-1.5 text-xs font-semibold text-co-navy outline-none focus:border-co-green"
          >
            {PARTY_MEMBERS.map((m) => {
              const f = getFlagship(m.lgaId);
              return (
                <option key={m.id} value={m.id}>
                  {m.name} — {f?.lgaName}
                </option>
              );
            })}
          </select>
        </label>
        <div className="text-[11px] text-zinc-400">
          {remainingToSimulate} of {PARTY_MEMBERS.length} pilot members not yet active
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[380px_1fr]">
        <PhoneFrame>
          <div className="p-3">
            <div className="mb-3 rounded-xl bg-co-green px-3 py-3 text-white">
              <div className="text-[10px] uppercase tracking-wide text-white/70">Your polling unit</div>
              <div className="text-sm font-bold">{pu?.name}</div>
              <div className="text-[11px] text-white/80">
                {ward?.name} &middot; {flagship?.lgaName}, {flagship?.stateName}
              </div>
              <div className="mt-1 text-[10px] text-white/70">
                ~{estimatedVoters.toLocaleString()} estimated registered voters (illustrative demo estimate — not a certified INEC count)
              </div>
            </div>

            {blocksForPu.length === 0 ? (
              <StepCard step={1} title="Cut this polling unit into canvass blocks">
                <p className="mb-2 text-[11px] text-zinc-500">Choose a target voters-per-member block size, or enter a custom size.</p>
                <div className="mb-2 flex gap-1.5">
                  {BLOCK_SIZE_PRESETS.map((p) => (
                    <button
                      key={p}
                      onClick={() => {
                        setSizeChoice(p);
                        setCustomSize("");
                      }}
                      className={`flex-1 rounded-lg border px-2 py-1.5 text-xs font-semibold ${
                        sizeChoice === p && customSize === "" ? "border-co-green bg-co-green/10 text-co-green" : "border-zinc-200 text-zinc-500"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <div className="mb-3 flex items-center gap-2">
                  <input
                    type="number"
                    min={MIN_BLOCK_SIZE}
                    max={MAX_BLOCK_SIZE}
                    placeholder={`Custom (${MIN_BLOCK_SIZE}-${MAX_BLOCK_SIZE})`}
                    value={customSize}
                    onChange={(e) => {
                      setCustomSize(e.target.value);
                      const n = parseInt(e.target.value, 10);
                      if (!Number.isNaN(n)) setSizeChoice(n);
                    }}
                    className="w-full rounded-lg border border-zinc-200 px-2 py-1.5 text-xs outline-none focus:border-co-green"
                  />
                </div>
                <PrimaryButton tone="green" onClick={generateBlocks}>
                  Generate blocks of {clampBlockSize(sizeChoice)} voters
                </PrimaryButton>
              </StepCard>
            ) : (
              <>
                <StepCard step={1} title="This polling unit's canvass blocks" done>
                  <div className="text-[11px] text-zinc-500">
                    Cut into <span className="font-semibold text-co-navy">{blocksForPu.length}</span> blocks of{" "}
                    <span className="font-semibold text-co-navy">{blocksForPu[0].targetSize}</span> voters each.{" "}
                    {blocksForPu.filter((b) => b.status === "unassigned").length} still unassigned.
                  </div>
                </StepCard>

                {myAssigned.length === 0 && myCompleted.length === 0 && (
                  <StepCard step={2} title="Claim a block">
                    {nextUnassigned ? (
                      <PrimaryButton tone="green" onClick={claimNext}>
                        Claim block {nextUnassigned.id.split("-").pop()} ({nextUnassigned.targetSize} voters)
                      </PrimaryButton>
                    ) : (
                      <p className="text-[11px] text-zinc-400">Every block in this polling unit is already assigned or completed.</p>
                    )}
                  </StepCard>
                )}

                {myAssigned.map((block) => (
                  <BlockWorkCard key={block.id} blockId={block.id} memberId={member.id} />
                ))}

                {myCompleted.map((block) => (
                  <CompletedBlockCard key={block.id} blockId={block.id} onRequestAnother={nextUnassigned ? claimNext : undefined} />
                ))}
              </>
            )}
          </div>
        </PhoneFrame>

        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <h3 className="mb-1 text-sm font-semibold text-co-navy">All canvass blocks in {pu?.name ?? "this PU"}</h3>
          <p className="mb-3 text-[11px] text-zinc-400">
            Every block is owned by at most one member at a time — this is the whole polling unit&apos;s cut, not just yours, so you can see the dedup guarantee directly: nobody else can claim a block once it&apos;s taken.
          </p>
          {blocksForPu.length === 0 ? (
            <p className="text-xs text-zinc-400">No blocks generated yet for this polling unit.</p>
          ) : (
            <div className="overflow-hidden rounded-lg border border-zinc-100">
              <table className="w-full text-xs">
                <thead className="bg-zinc-50 text-[10px] uppercase tracking-wide text-zinc-400">
                  <tr>
                    <th className="px-3 py-2 text-left">Block</th>
                    <th className="px-3 py-2 text-left">Size</th>
                    <th className="px-3 py-2 text-left">Status</th>
                    <th className="px-3 py-2 text-left">Assigned to</th>
                  </tr>
                </thead>
                <tbody>
                  {blocksForPu.map((b) => {
                    const owner = b.assignedMemberId ? getPartyMember(b.assignedMemberId) : undefined;
                    return (
                      <tr key={b.id} className={`border-t border-zinc-100 ${b.assignedMemberId === member.id ? "bg-co-green/5" : ""}`}>
                        <td className="px-3 py-2 font-mono text-co-navy">{b.id.split("-").pop()}</td>
                        <td className="px-3 py-2 text-zinc-500">{b.targetSize}</td>
                        <td className="px-3 py-2">
                          {b.status === "completed" ? (
                            <Badge tone="green">Completed</Badge>
                          ) : b.status === "assigned" ? (
                            <Badge tone="amber">In progress</Badge>
                          ) : (
                            <Badge tone="zinc">Unassigned</Badge>
                          )}
                        </td>
                        <td className="px-3 py-2 text-zinc-500">{owner ? owner.name : "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          <p className="mt-3 text-[11px] text-zinc-400">
            Illustrative sample voter names and estimated counts, not a real INEC voter register — no certified register has been obtained for this
            state. See the Pre-Election Canvassing Framework report, Section 4.1, for the lawful route to one (Electoral Act 2022 s.15).
          </p>
        </div>
      </div>
    </div>
  );
}

function BlockWorkCard({ blockId, memberId }: { blockId: string; memberId: string }) {
  const canvass = useCanvassStore();
  const block = canvass.blocks[blockId];

  useEffect(() => {
    canvass.ensureVotersForBlock(blockId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockId]);

  const voters = useMemo(
    () => Object.values(canvass.voters).filter((v) => v.blockId === blockId),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [canvass.voters, blockId]
  );
  const contactedCount = voters.filter((v) => v.contactStatus !== "not_contacted").length;
  const allContacted = voters.length > 0 && contactedCount === voters.length;

  if (!block) return null;

  return (
    <StepCard step={2} title={`Block ${blockId.split("-").pop()} — ${contactedCount}/${voters.length} contacted`}>
      <div className="mb-2 max-h-56 space-y-1 overflow-y-auto rounded-lg border border-zinc-100 p-1.5">
        {voters.map((v) => (
          <div key={v.id} className="flex items-center justify-between gap-1 rounded-lg bg-zinc-50 px-2 py-1">
            <span className="truncate text-[11px] text-co-navy">{v.name}</span>
            <select
              value={v.contactStatus}
              onChange={(e) => canvass.setVoterStatus(v.id, e.target.value as CanvassContactStatus, Date.now())}
              className={`rounded border px-1 py-0.5 text-[10px] font-medium outline-none ${
                v.contactStatus === "not_contacted" ? "border-zinc-200 text-zinc-400" : "border-zinc-200 text-co-navy"
              }`}
            >
              {(Object.keys(STATUS_LABEL) as CanvassContactStatus[]).map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
      <div className="flex gap-1.5">
        <button
          onClick={() => autoFillBlock(blockId, Date.now())}
          disabled={allContacted}
          className="flex-1 rounded-lg border border-co-teal/40 px-2 py-1.5 text-[11px] font-semibold text-co-teal disabled:cursor-not-allowed disabled:opacity-40"
        >
          Auto-fill remaining
        </button>
        <button
          onClick={() => canvass.returnBlockToPool(blockId, Date.now(), "manual")}
          className="flex-1 rounded-lg border border-zinc-200 px-2 py-1.5 text-[11px] font-semibold text-zinc-500"
        >
          Return to pool
        </button>
      </div>
      <div className="mt-1.5">
        <PrimaryButton tone="green" disabled={!allContacted} onClick={() => canvass.completeBlock(blockId, Date.now())}>
          Mark block complete
        </PrimaryButton>
      </div>
    </StepCard>
  );
}

function CompletedBlockCard({ blockId, onRequestAnother }: { blockId: string; onRequestAnother?: () => void }) {
  const canvass = useCanvassStore();
  const voters = useMemo(() => Object.values(canvass.voters).filter((v) => v.blockId === blockId), [canvass.voters, blockId]);
  const counts = voters.reduce<Record<CanvassContactStatus, number>>(
    (acc, v) => ({ ...acc, [v.contactStatus]: (acc[v.contactStatus] ?? 0) + 1 }),
    { not_contacted: 0, supportive: 0, undecided: 0, opposed: 0, unreachable: 0 }
  );

  return (
    <StepCard step={3} title={`Block ${blockId.split("-").pop()} — complete`} done>
      <div className="mb-2 flex flex-wrap gap-1.5">
        {(["supportive", "undecided", "opposed", "unreachable"] as CanvassContactStatus[]).map((s) => (
          <Badge key={s} tone={STATUS_TONE[s]}>
            {STATUS_LABEL[s]}: {counts[s]}
          </Badge>
        ))}
      </div>
      {onRequestAnother ? (
        <PrimaryButton tone="green" onClick={onRequestAnother}>
          Request another block
        </PrimaryButton>
      ) : (
        <p className="text-[11px] text-zinc-400">No further unassigned blocks left in this polling unit.</p>
      )}
    </StepCard>
  );
}
