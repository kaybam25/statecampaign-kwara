"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useElectionDayStore } from "@/lib/store/electionDay";
import { useMobilisationStore, isTrainingOverdue, nextTrainingDue } from "@/lib/store/mobilisation";
import { FIELD_AGENTS } from "@/lib/mobilisation-data";
import { buildGroupSimResult, isAgentProcessed } from "@/lib/mobilisation-group-sim";
import { getPU, getWard, getFlagship, REAL_DATA_LGAS } from "@/lib/data";
import { INCIDENT_CATEGORIES } from "@/lib/types";
import KpiTile from "@/components/election-day/KpiTile";
import { Badge, formatSimClock } from "@/components/mobilisation/StepCard";

export default function MobilisationCommandPage() {
  const edStore = useElectionDayStore();
  const mStore = useMobilisationStore();
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);

  useEffect(() => {
    if (Object.keys(edStore.perLga).length === 0) edStore.init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function loop(ts: number) {
      if (lastTsRef.current == null) lastTsRef.current = ts;
      const delta = ts - lastTsRef.current;
      lastTsRef.current = ts;
      useElectionDayStore.getState().tick(delta);
      rafRef.current = requestAnimationFrame(loop);
    }
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const simMinutes = edStore.simMinutes;
  const pollingAgents = FIELD_AGENTS.filter((a) => a.role === "polling_agent");
  const canvassers = FIELD_AGENTS.filter((a) => a.role === "canvasser");

  const checkedIn = pollingAgents.filter((a) => mStore.agentState[a.id]?.checkIn).length;
  const checkInRate = pollingAgents.length ? Math.round((checkedIn / pollingAgents.length) * 100) : 0;

  const compliant = FIELD_AGENTS.filter((a) => {
    const s = mStore.agentState[a.id];
    return s && !isTrainingOverdue(s, simMinutes);
  }).length;
  const complianceRate = FIELD_AGENTS.length ? Math.round((compliant / FIELD_AGENTS.length) * 100) : 0;

  const openIncidents = FIELD_AGENTS.reduce((n, a) => n + (mStore.agentState[a.id]?.incidents.length ?? 0), 0);
  const materialsDelays = pollingAgents.filter((a) => {
    const s = mStore.agentState[a.id];
    return s?.officialsArrivedTs && !s.materialsArrivedTs;
  }).length;
  const remindersSent = canvassers.reduce((n, a) => n + (mStore.agentState[a.id]?.remindersSent.reduce((m, r) => m + r.recipientCount, 0) ?? 0), 0);

  const processedCount = FIELD_AGENTS.filter((a) => isAgentProcessed(a, mStore.agentState)).length;
  const remainingCount = FIELD_AGENTS.length - processedCount;

  const handleGroupBatch = () => {
    const unprocessed = FIELD_AGENTS.filter((a) => !isAgentProcessed(a, mStore.agentState));
    const batch = unprocessed.slice(0, 25);
    if (batch.length === 0) return;
    const results = batch.map((a) => buildGroupSimResult(a, simMinutes));
    mStore.runGroupBatch(results);
  };

  return (
    <div className="min-h-screen bg-zinc-50 p-6">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-co-navy">Mobilisation Admin Dashboard</h1>
          <p className="text-xs text-zinc-500">Live roll-up of every field agent &amp; canvasser across all 16 Kwara State LGAs — shares the same simulated Election Day clock.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm font-semibold text-co-navy tabular-nums">Clock: {formatSimClock(simMinutes)}</div>
          <button
            onClick={handleGroupBatch}
            disabled={remainingCount === 0}
            title="Simulate the next batch of agents/canvassers completing their full election-day flow at once, with reports and tracking rolling straight into this dashboard"
            className="rounded-lg bg-co-green px-3 py-1.5 text-xs font-semibold text-white hover:bg-co-green/90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {remainingCount === 0 ? `All ${FIELD_AGENTS.length} Agents Simulated` : `Do Group Agents (${Math.min(25, remainingCount)})`}
          </button>
          {processedCount > 0 && (
            <button
              onClick={() => mStore.init()}
              className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-500 hover:bg-zinc-50"
              title="Clear all agent/canvasser activity (including group-simulated batches) and start the roster over"
            >
              Reset Roster
            </button>
          )}
          <Link href="/mobilisation/agent" className="rounded-lg bg-co-orange px-3 py-1.5 text-xs font-semibold text-white hover:bg-co-orange/90">
            Agent App &rarr;
          </Link>
          <Link href="/mobilisation/canvasser" className="rounded-lg bg-co-teal px-3 py-1.5 text-xs font-semibold text-white hover:bg-co-teal/90">
            Canvasser App &rarr;
          </Link>
          <Link href="/modules/mobilisation" className="text-xs text-zinc-400 underline hover:text-co-navy">
            &larr; Mobilisation Hub
          </Link>
        </div>
      </header>

      <div className="mb-3 text-[11px] text-zinc-400">
        {processedCount} of {FIELD_AGENTS.length} field agents/canvassers have reported activity
        {remainingCount > 0 ? ` — click "Do Group Agents" to simulate the next ${Math.min(25, remainingCount)} at once.` : "."}
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <KpiTile label="Agent Check-in Rate" value={`${checkInRate}%`} sublabel={`${checkedIn}/${pollingAgents.length} polling agents`} tone={checkInRate >= 80 ? "green" : "amber"} />
        <KpiTile label="PU Presence Compliance" value={`${complianceRate}%`} sublabel={`${compliant}/${FIELD_AGENTS.length} agents current`} tone={complianceRate >= 80 ? "green" : "red"} />
        <KpiTile label="Open Incidents" value={String(openIncidents)} sublabel="Across all field roles" tone={openIncidents > 0 ? "red" : "green"} />
        <KpiTile label="Materials Delay Flags" value={String(materialsDelays)} sublabel="Officials on-site, no materials" tone={materialsDelays > 0 ? "red" : "green"} />
        <KpiTile label="Reminders Sent" value={String(remindersSent)} sublabel="Constituents reached, all channels" tone="navy" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
          <div className="border-b border-zinc-100 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">Field Roster</div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-zinc-50 text-[10px] uppercase tracking-wide text-zinc-400">
                <tr>
                  <th className="px-3 py-2 text-left">Agent</th>
                  <th className="px-3 py-2 text-left">Role</th>
                  <th className="px-3 py-2 text-left">LGA</th>
                  <th className="px-3 py-2 text-left">Assignment</th>
                  <th className="px-3 py-2 text-left">Check-in</th>
                  <th className="px-3 py-2 text-left">Officials / Materials</th>
                  <th className="px-3 py-2 text-left">PU Presence</th>
                  <th className="px-3 py-2 text-left">Incidents</th>
                </tr>
              </thead>
              <tbody>
                {FIELD_AGENTS.map((a) => {
                  const s = mStore.agentState[a.id];
                  const f = getFlagship(a.lgaId);
                  const assignment = a.role === "polling_agent" ? getPU(a.assignedPuId!)?.name : getWard(a.assignedWardId!)?.name;
                  const overdue = s ? isTrainingOverdue(s, simMinutes) : false;
                  return (
                    <tr key={a.id} className="border-t border-zinc-100">
                      <td className="px-3 py-2 font-medium text-co-navy">{a.name}</td>
                      <td className="px-3 py-2 text-zinc-500">{a.role === "polling_agent" ? "Polling Agent" : "Canvasser"}</td>
                      <td className="px-3 py-2 text-zinc-500">{f?.lgaName}</td>
                      <td className="px-3 py-2 text-zinc-500">{assignment}</td>
                      <td className="px-3 py-2">
                        {s?.checkIn ? (
                          <Badge tone={s.checkIn.gpsVerified ? "green" : "amber"}>{formatSimClock(s.checkIn.ts)}</Badge>
                        ) : (
                          <Badge tone="zinc">Not checked in</Badge>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        {a.role !== "polling_agent" ? (
                          <span className="text-zinc-300">—</span>
                        ) : s?.officialsArrivedTs && s?.materialsArrivedTs ? (
                          <Badge tone="green">Both arrived</Badge>
                        ) : s?.officialsArrivedTs ? (
                          <Badge tone="red">Materials delayed</Badge>
                        ) : (
                          <Badge tone="zinc">Pending</Badge>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        {s ? (
                          <Badge tone={overdue ? "red" : "green"}>{overdue ? "Overdue" : `OK · due ${formatSimClock(nextTrainingDue(s))}`}</Badge>
                        ) : (
                          <Badge tone="zinc">—</Badge>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        {s?.incidents.length ? <Badge tone="red">{s.incidents.length}</Badge> : <Badge tone="zinc">0</Badge>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex h-full flex-col rounded-xl border border-zinc-200 bg-white">
          <div className="border-b border-zinc-100 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">Mobilisation Live Feed</div>
          <div className="max-h-[520px] flex-1 space-y-1.5 overflow-y-auto px-4 py-2">
            {mStore.events.length === 0 && <div className="py-8 text-center text-xs text-zinc-400">No field activity yet — open the Agent or Canvasser app.</div>}
            {mStore.events.slice(0, 60).map((ev, i) => (
              <FeedLine key={i} ev={ev} />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-zinc-200 bg-white p-4">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">All 16 Kwara State LGAs covered</h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
          {REAL_DATA_LGAS.map((f) => (
            <div key={f.lgaId} className="rounded-lg border border-zinc-100 bg-zinc-50 px-2 py-1.5 text-[11px] text-co-navy">
              {f.lgaName}, {f.stateName}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FeedLine({ ev }: { ev: import("@/lib/types").MobilisationEvent }) {
  const agent = FIELD_AGENTS.find((a) => a.id === ev.agentId);
  const name = agent?.name ?? ev.agentId;
  let text = "";
  let tone = "text-co-navy";
  switch (ev.type) {
    case "checkin":
      text = `${name} checked in ${ev.gpsVerified ? "(GPS verified)" : "(GPS flagged)"} — ${ev.distanceM}m from PU`;
      tone = ev.gpsVerified ? "text-co-green" : "text-co-amber";
      break;
    case "officials_arrived":
      text = `${name} reported INEC officials on-site`;
      tone = "text-co-blue";
      break;
    case "materials_arrived":
      text = `${name} reported election materials on-site`;
      tone = "text-co-green";
      break;
    case "accreditation_started":
      text = `${name} reported accreditation started`;
      tone = "text-co-navy font-semibold";
      break;
    case "training_verified":
      text = `${name} confirmed PU presence (interval ${ev.intervalMinutes}min)`;
      tone = "text-co-navy";
      break;
    case "incident_reported":
      text = `${name}: [${INCIDENT_CATEGORIES.find((c) => c.id === ev.category)?.label}] ${ev.note}`;
      tone = "text-co-red";
      break;
    case "collation_reported":
      text = `${name} submitted final collation — ${ev.accreditedCount} accredited, ${ev.votesCast} votes${ev.photoAttached ? ", photo attached" : ""}`;
      tone = "text-co-green font-semibold";
      break;
    case "reminder_sent":
      text = `${name} sent ${ev.kind.replace("_", " ")} via ${ev.channel} to ${ev.recipientCount} contacts`;
      tone = "text-co-teal";
      break;
  }
  return (
    <div className={`text-[11px] leading-snug ${tone}`}>
      <span className="mr-1.5 font-mono text-[10px] text-zinc-400">{formatSimClock(ev.ts)}</span>
      {text}
    </div>
  );
}
