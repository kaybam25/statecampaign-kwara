"use client";

import { useMemo, useState } from "react";
import ModuleShell from "@/components/shared/ModuleShell";
import { KWARA_LGAS, getWardsInLGA } from "@/lib/data";
import { seededInt } from "@/lib/seed";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import KwaraLgaTracker from "@/components/voter-intel/KwaraLgaTracker";
import TurnoutSimulator from "@/components/voter-intel/TurnoutSimulator";
import InfluencerMap from "@/components/voter-intel/InfluencerMap";

const sentiment = [
  { platform: "WhatsApp", score: 9.5 },
  { platform: "Facebook", score: 8.2 },
  { platform: "Twitter/X", score: 7.8 },
  { platform: "TikTok", score: 7.1 },
  { platform: "Instagram", score: 6.3 },
];

export default function VoterIntelPage() {
  const [wardLgaId, setWardLgaId] = useState(KWARA_LGAS.find((f) => f.lgaId === "kwara__ilorin-west")?.lgaId ?? KWARA_LGAS[0].lgaId);
  const swingWards = useMemo(
    () =>
      getWardsInLGA(wardLgaId)
        .map((w) => ({ name: w.name.split("/")[0], swingScore: seededInt(w.id + "swing", 30, 95) }))
        .sort((a, b) => b.swingScore - a.swingScore),
    [wardLgaId]
  );
  const wardLgaName = KWARA_LGAS.find((f) => f.lgaId === wardLgaId)?.lgaName ?? "";

  return (
    <ModuleShell
      title="Voter Intelligence &amp; Analytics"
      subtitle="Kwara State LGA and ward-level tracking, turnout scenarios, and sentiment — real 2023 governorship-election data where available."
      color="#7c3aed"
    >
      <div className="mb-4">
        <KwaraLgaTracker />
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-co-navy">Swing Ward Identifier</h3>
            <select
              value={wardLgaId}
              onChange={(e) => setWardLgaId(e.target.value)}
              className="rounded-lg border border-zinc-200 px-2 py-1 text-xs font-semibold text-co-navy outline-none focus:border-co-purple"
            >
              {KWARA_LGAS.map((f) => (
                <option key={f.lgaId} value={f.lgaId}>
                  {f.lgaName}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            {swingWards.map((w) => (
              <div key={w.name} className="flex items-center gap-3">
                <span className="w-40 shrink-0 truncate text-xs text-zinc-600">{w.name}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-100">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${w.swingScore}%`, backgroundColor: w.swingScore > 70 ? "#dc2626" : w.swingScore > 50 ? "#f59e0b" : "#1b7a43" }}
                  />
                </div>
                <span className="w-8 shrink-0 text-right text-xs font-semibold tabular-nums text-co-navy">{w.swingScore}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[10px] text-zinc-400">
            Illustrative ward-level swing score within Kwara → {wardLgaName} — INEC does not publish ward-level results, so this is a seeded
            demo estimate (deterministic, not random each load), complementing the real LGA-level 2023 results in the tracker above. Pick any of
            Kwara's 16 LGAs to see its wards.
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <h3 className="mb-3 text-sm font-semibold text-co-navy">Social Media Political Influence Score (/10)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={sentiment}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="platform" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="score" fill="#7c3aed" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mb-4">
        <TurnoutSimulator />
      </div>

      <div>
        <InfluencerMap />
      </div>

      <p className="mt-6 text-xs text-zinc-400">
        Ethnicity &amp; Religion Balance Monitor and Opposition Intelligence Module (publicly-sourced) remain scoped for
        a future build pass — see CampaignOS Strategy Report, Module 5.
      </p>
    </ModuleShell>
  );
}
