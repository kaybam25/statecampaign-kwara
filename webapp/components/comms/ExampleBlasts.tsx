"use client";

import { useState } from "react";
import { EXAMPLE_BLAST_AUDIENCES, KWARA_WARD_OPTIONS, resolveBlastMessage, type BlastAudienceId } from "@/lib/comms-data";

export type SentBlast = {
  id: string;
  audienceId: BlastAudienceId;
  audienceLabel: string;
  channelLabel: string;
  message: string;
  wardLabel?: string;
};

export default function ExampleBlasts({ onSend }: { onSend: (blast: SentBlast) => void }) {
  const [wardId, setWardId] = useState(KWARA_WARD_OPTIONS[0]?.id ?? "");
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());

  const ward = KWARA_WARD_OPTIONS.find((w) => w.id === wardId);

  function handleSend(audienceId: BlastAudienceId) {
    const audience = EXAMPLE_BLAST_AUDIENCES.find((a) => a.id === audienceId)!;
    const wardLabel = audience.id === "ward_supporters" ? ward?.label : undefined;
    onSend({
      id: `${audience.id}-${Date.now()}`,
      audienceId: audience.id,
      audienceLabel: audience.label,
      channelLabel: audience.channelLabel,
      message: resolveBlastMessage(audience, wardLabel),
      wardLabel,
    });
    setSentIds((s) => new Set(s).add(audience.id));
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <h3 className="mb-1 text-sm font-semibold text-co-navy">Example Simulated Blasts</h3>
      <p className="mb-3 text-[11px] text-zinc-400">
        Assumes the party holds a member/supporter voter list. Each card is a ready example for that audience — send it to add it to the queue below.
      </p>
      <div className="space-y-3">
        {EXAMPLE_BLAST_AUDIENCES.map((audience) => {
          const isWard = audience.id === "ward_supporters";
          const message = resolveBlastMessage(audience, isWard ? ward?.label : undefined);
          const sent = sentIds.has(audience.id);
          return (
            <div key={audience.id} className="rounded-lg border border-zinc-100 bg-zinc-50 p-3">
              <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold text-co-navy">{audience.label}</span>
                <span className="text-[10px] text-zinc-400">{audience.channelLabel}</span>
              </div>
              <p className="mb-2 text-[11px] text-zinc-500">{audience.description}</p>

              {isWard && (
                <select
                  value={wardId}
                  onChange={(e) => setWardId(e.target.value)}
                  className="mb-2 w-full rounded-lg border border-zinc-200 px-2 py-1.5 text-xs outline-none focus:border-co-teal"
                >
                  {KWARA_WARD_OPTIONS.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.lgaName} — {w.label}
                    </option>
                  ))}
                </select>
              )}

              {audience.subject && <div className="mb-1 text-[11px] font-semibold text-zinc-600">Subject: {audience.subject}</div>}
              <div className="mb-2 rounded-lg bg-white p-2.5 text-xs text-zinc-600">{message}</div>

              <button
                onClick={() => handleSend(audience.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  sent ? "bg-co-green/10 text-co-green" : "bg-co-teal text-white hover:opacity-90"
                }`}
              >
                {sent ? "Sent — send again" : "Send Example Blast"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
