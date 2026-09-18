"use client";

import { getWardsInLGA, getPUsInWard, getFlagship } from "@/lib/data";
import type { PUStatus } from "@/lib/types";

export default function ResultsCollationTable({ lgaId, puStatus }: { lgaId: string; puStatus: Record<string, PUStatus> }) {
  const wards = getWardsInLGA(lgaId);
  const flagship = getFlagship(lgaId);
  const rows = wards.map((w) => {
    const pus = getPUsInWard(w.id);
    const confirmed = pus.filter((pu) => puStatus[pu.id] === "agent_confirmed" || puStatus[pu.id] === "result_uploaded").length;
    const results = pus.filter((pu) => puStatus[pu.id] === "result_uploaded").length;
    const incidents = pus.filter((pu) => puStatus[pu.id] === "incident").length;
    return { ward: w, total: pus.length, confirmed, results, incidents };
  });

  const totals = rows.reduce(
    (acc, r) => ({
      total: acc.total + r.total,
      confirmed: acc.confirmed + r.confirmed,
      results: acc.results + r.results,
      incidents: acc.incidents + r.incidents,
    }),
    { total: 0, confirmed: 0, results: 0, incidents: 0 }
  );

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-co-navy">
          Results Collation — {flagship?.lgaName ?? lgaId} LGA (parallel to official INEC feed)
        </h3>
        <span className="text-xs text-zinc-400">Simulated data — for demo purposes only</span>
      </div>
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="border-b border-zinc-100 text-zinc-400">
            <th className="py-1.5 font-medium">Ward</th>
            <th className="py-1.5 font-medium text-right">PUs</th>
            <th className="py-1.5 font-medium text-right">Agents Confirmed</th>
            <th className="py-1.5 font-medium text-right">Results In</th>
            <th className="py-1.5 font-medium text-right">Incidents</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.ward.id} className="border-b border-zinc-50">
              <td className="py-1.5 text-zinc-700">{r.ward.name}</td>
              <td className="py-1.5 text-right tabular-nums text-zinc-500">{r.total}</td>
              <td className="py-1.5 text-right tabular-nums text-co-green">{r.confirmed}</td>
              <td className="py-1.5 text-right tabular-nums text-co-navy">{r.results}</td>
              <td className={`py-1.5 text-right tabular-nums ${r.incidents ? "text-co-red font-semibold" : "text-zinc-300"}`}>
                {r.incidents}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="font-semibold text-co-navy">
            <td className="py-1.5">{flagship?.lgaName ?? lgaId} LGA Total</td>
            <td className="py-1.5 text-right tabular-nums">{totals.total}</td>
            <td className="py-1.5 text-right tabular-nums text-co-green">{totals.confirmed}</td>
            <td className="py-1.5 text-right tabular-nums">{totals.results}</td>
            <td className="py-1.5 text-right tabular-nums text-co-red">{totals.incidents}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
