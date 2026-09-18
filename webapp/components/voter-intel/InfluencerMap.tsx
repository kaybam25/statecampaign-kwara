"use client";

import { useState } from "react";
import { REAL_DATA_LGAS } from "@/lib/data";
import { getLeadersForLga, LEADER_CATEGORY_LABEL } from "@/lib/community-leaders";

const STATUS_STYLE: Record<string, string> = {
  Endorsed: "bg-co-green/10 text-co-green",
  Undecided: "bg-amber-100 text-amber-700",
  "Not yet approached": "bg-zinc-100 text-zinc-500",
};

export default function InfluencerMap() {
  const [lgaId, setLgaId] = useState(REAL_DATA_LGAS[0].lgaId);
  const leaders = getLeadersForLga(lgaId);
  const flagship = REAL_DATA_LGAS.find((f) => f.lgaId === lgaId)!;

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-co-navy">Influencer &amp; Gatekeeper Map</h3>
        <select
          value={lgaId}
          onChange={(e) => setLgaId(e.target.value)}
          className="rounded-lg border border-zinc-200 px-2 py-1 text-xs outline-none focus:border-co-purple"
        >
          {REAL_DATA_LGAS.map((f) => (
            <option key={f.lgaId} value={f.lgaId}>
              {f.stateName} — {f.lgaName}
            </option>
          ))}
        </select>
      </div>
      <p className="mb-3 text-xs text-zinc-500">
        Sample gatekeeper roster for {flagship.stateName} — {flagship.lgaName}, rated by reach and endorsement status.
        Illustrative sample entries, not real individuals.
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {leaders.map((l) => (
          <div key={l.id} className="rounded-lg border border-zinc-100 bg-zinc-50 p-3">
            <div className="mb-1 flex items-center justify-between gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-co-purple">
                {LEADER_CATEGORY_LABEL[l.category]}
              </span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${STATUS_STYLE[l.endorsementStatus]}`}>
                {l.endorsementStatus}
              </span>
            </div>
            <div className="mb-2 text-xs font-medium text-co-navy">{l.title}</div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-200">
                <div className="h-full rounded-full bg-co-purple" style={{ width: `${l.reachScore}%` }} />
              </div>
              <span className="text-[10px] font-semibold tabular-nums text-zinc-500">{l.reachScore} reach</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
