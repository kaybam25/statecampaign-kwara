"use client";

import { ROLE_SEGMENTS, GEO_OPTIONS } from "@/lib/comms-data";

function fmt(n: number) {
  return n >= 1000 ? `${(n / 1000).toLocaleString(undefined, { maximumFractionDigits: 0 })}K` : n.toString();
}

export default function AudienceSelector({
  selectedRoles,
  toggleRole,
  geoId,
  setGeoId,
}: {
  selectedRoles: string[];
  toggleRole: (id: string) => void;
  geoId: string;
  setGeoId: (id: string) => void;
}) {
  const geo = GEO_OPTIONS.find((g) => g.id === geoId) ?? GEO_OPTIONS[0];

  const total = selectedRoles.reduce((sum, id) => {
    if (id === "agents") return sum + geo.agentCount;
    const seg = ROLE_SEGMENTS.find((s) => s.id === id);
    return sum + (seg?.count ?? 0);
  }, 0);

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <h3 className="mb-3 text-sm font-semibold text-co-navy">Segmented Audience Selector</h3>
      <div className="mb-3">
        <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-zinc-400">Geography</label>
        <select
          value={geoId}
          onChange={(e) => setGeoId(e.target.value)}
          className="w-full rounded-lg border border-zinc-200 px-2 py-1.5 text-xs outline-none focus:border-co-teal"
        >
          {GEO_OPTIONS.map((g) => (
            <option key={g.id} value={g.id}>
              {g.label} &middot; {g.wardCount} wards
            </option>
          ))}
        </select>
      </div>
      <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-zinc-400">Segments</label>
      <div className="space-y-1.5">
        {ROLE_SEGMENTS.map((seg) => {
          const count = seg.id === "agents" ? geo.agentCount : seg.count;
          const active = selectedRoles.includes(seg.id);
          return (
            <button
              key={seg.id}
              type="button"
              onClick={() => toggleRole(seg.id)}
              className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-xs transition ${
                active ? "border-co-teal bg-co-teal/5" : "border-zinc-200 hover:bg-zinc-50"
              }`}
            >
              <span>
                <span className="font-medium text-co-navy">{seg.label}</span>
                <span className="ml-1.5 text-[10px] text-zinc-400">{seg.note}</span>
              </span>
              <span className="shrink-0 font-bold tabular-nums text-co-teal">{fmt(count)}</span>
            </button>
          );
        })}
      </div>
      <div className="mt-3 rounded-lg bg-co-teal/5 px-3 py-2 text-center">
        <span className="text-lg font-bold tabular-nums text-co-teal">{fmt(total)}</span>
        <span className="ml-1.5 text-xs text-zinc-500">estimated audience</span>
      </div>
    </div>
  );
}
