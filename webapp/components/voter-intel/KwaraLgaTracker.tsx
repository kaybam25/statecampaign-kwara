import { KWARA_LGA_RESULTS_2023, KWARA_STATE_HISTORY, apcMarginPct, competitiveness, type CompetitivenessTier } from "@/lib/kwara-election-data";

const TIER_STYLE: Record<CompetitivenessTier, string> = {
  "Most Contested": "bg-red-100 text-red-600",
  Contested: "bg-amber-100 text-amber-700",
  "Safe APC": "bg-co-green/10 text-co-green",
};

function tierBadge(tier: CompetitivenessTier) {
  return <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${TIER_STYLE[tier]}`}>{tier}</span>;
}

const rows = KWARA_LGA_RESULTS_2023.map((r) => {
  const margin = apcMarginPct(r);
  return { ...r, margin, tier: competitiveness(margin) };
}).sort((a, b) => a.margin - b.margin);

export default function KwaraLgaTracker() {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-1">
        <h3 className="text-sm font-semibold text-co-navy">Kwara State LGA Tracker — 2023 Governorship Results</h3>
        <span className="text-[10px] text-zinc-400">Source: INEC-declared results, via Wikipedia &amp; ThisDayLive (cross-checked)</span>
      </div>
      <p className="mb-3 text-xs text-zinc-500">
        All 16 LGAs, sorted most-contested first by APC/PDP vote margin. APC won every LGA in 2023 — "Most Contested" flags where PDP ran closest,
        i.e. where a defensive GOTV push matters most; it isn't a prediction that these LGAs could flip.
      </p>

      <div className="mb-4 grid grid-cols-3 gap-2 rounded-lg bg-zinc-50 p-2 text-center text-[11px]">
        {KWARA_STATE_HISTORY.map((c) => (
          <div key={c.year}>
            <div className="font-semibold text-co-navy">{c.year}</div>
            <div className="text-zinc-500">
              APC {c.apcPct}% · PDP {c.pdpPct}%
            </div>
            <div className="text-zinc-400">{c.turnoutPct}% turnout</div>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-xs">
          <thead>
            <tr className="border-b border-zinc-200 text-[10px] uppercase tracking-wide text-zinc-400">
              <th className="py-2 pr-3">LGA</th>
              <th className="px-3 py-2">APC Votes</th>
              <th className="px-3 py-2">PDP Votes</th>
              <th className="px-3 py-2">APC Margin</th>
              <th className="px-3 py-2">Turnout</th>
              <th className="py-2 pl-3 text-right">Priority</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.lgaId} className="border-b border-zinc-100 last:border-0">
                <td className="py-2 pr-3 font-semibold text-co-navy">{r.lgaName}</td>
                <td className="px-3 py-2 tabular-nums text-zinc-600">{r.apcVotes.toLocaleString()}</td>
                <td className="px-3 py-2 tabular-nums text-zinc-600">{r.pdpVotes.toLocaleString()}</td>
                <td className="px-3 py-2 tabular-nums text-zinc-600">+{r.margin.toFixed(1)} pts</td>
                <td className="px-3 py-2 tabular-nums text-zinc-600">{r.turnoutPct}%</td>
                <td className="py-2 pl-3 text-right">{tierBadge(r.tier)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[10px] text-zinc-400">
        LGA rows show the two leading parties only (SDP and other candidates also polled in every LGA — state-wide: SDP 18,922 / 4.11%, others
        12,661 / 2.75% — but weren't consistently reported by LGA across both cross-checked sources).
      </p>
    </div>
  );
}
