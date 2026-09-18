"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useElectionDayStore } from "@/lib/store/electionDay";
import { useMobilisationStore, isTrainingOverdue, nextTrainingDue } from "@/lib/store/mobilisation";
import { FIELD_AGENTS } from "@/lib/mobilisation-data";
import { getPU, getWard, getFlagship } from "@/lib/data";
import { simulateGpsCheckIn } from "@/lib/geo";
import { INCIDENT_CATEGORIES, TRAINING_INTERVAL_OPTIONS, type IncidentCategory, type TrainingIntervalMinutes } from "@/lib/types";
import PhoneFrame from "@/components/mobilisation/PhoneFrame";
import { StepCard, Badge, PrimaryButton, formatSimClock } from "@/components/mobilisation/StepCard";

const POLLING_AGENTS = FIELD_AGENTS.filter((a) => a.role === "polling_agent");

const INTERVAL_LABEL: Record<TrainingIntervalMinutes, string> = {
  30: "Every 30 min",
  60: "Every 1 hr",
  120: "Every 2 hrs (default)",
  240: "Every 4 hrs",
};

export default function AgentAppPage() {
  const [agentId, setAgentId] = useState(POLLING_AGENTS[0].id);
  const agent = POLLING_AGENTS.find((a) => a.id === agentId)!;
  const pu = getPU(agent.assignedPuId!);
  const ward = pu ? getWard(pu.wardId) : undefined;
  const flagship = getFlagship(agent.lgaId);

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
  const state = mStore.agentState[agentId];
  const overdue = state ? isTrainingOverdue(state, simMinutes) : false;
  const dueAt = state ? nextTrainingDue(state) : 0;

  const [category, setCategory] = useState<IncidentCategory>(INCIDENT_CATEGORIES[0].id);
  const [note, setNote] = useState("");
  const [accredited, setAccredited] = useState("");
  const [votes, setVotes] = useState("");
  const [photo, setPhoto] = useState(false);

  // These four fields are unsubmitted local form state, not agent state from
  // the store — without this they'd silently carry over whatever the
  // previously-selected agent had typed/toggled when the presenter switches
  // "Signed in as" to demo a different agent.
  useEffect(() => {
    setCategory(INCIDENT_CATEGORIES[0].id);
    setNote("");
    setAccredited("");
    setVotes("");
    setPhoto(false);
  }, [agentId]);

  if (!state) return null;

  const bothMaterialsIn = !!state.officialsArrivedTs && !!state.materialsArrivedTs;

  return (
    <div className="min-h-screen bg-zinc-50 p-6">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-co-navy">Field Agent App — Polling Agent View</h1>
          <p className="text-xs text-zinc-500">Simulated phone screen. GPS, PU presence prompts, and reports are all locally simulated — nothing is sent live.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/mobilisation/command" className="rounded-lg bg-co-navy px-3 py-1.5 text-xs font-semibold text-white hover:bg-co-navy/90">
            Open Admin Dashboard &rarr;
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
            value={agentId}
            onChange={(e) => setAgentId(e.target.value)}
            className="rounded-lg border border-zinc-200 px-2 py-1.5 text-xs font-semibold text-co-navy outline-none focus:border-co-orange"
          >
            {POLLING_AGENTS.map((a) => {
              const f = getFlagship(a.lgaId);
              return (
                <option key={a.id} value={a.id}>
                  {a.name} — {f?.lgaName}
                </option>
              );
            })}
          </select>
        </label>
        <div className="text-sm font-semibold text-co-navy tabular-nums">Election Day clock: {formatSimClock(simMinutes)}</div>
        <div className="ml-auto flex gap-2">
          {!edStore.running && !edStore.finished && (
            <button onClick={() => edStore.start()} className="rounded-lg bg-co-orange px-3 py-1.5 text-xs font-semibold text-white hover:bg-co-orange/90">
              {simMinutes === 0 ? "Start Election Day" : "Resume"}
            </button>
          )}
          {edStore.running && (
            <button onClick={() => edStore.pause()} className="rounded-lg bg-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-300">
              Pause
            </button>
          )}
          {[1, 5, 20].map((s) => (
            <button
              key={s}
              onClick={() => edStore.setSpeed(s as 1 | 5 | 20)}
              className={`rounded px-2 py-1.5 text-xs font-semibold ${edStore.speed === s ? "bg-co-navy text-white" : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"}`}
            >
              {s}x
            </button>
          ))}
          <button
            onClick={() => edStore.reset()}
            className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-500 hover:bg-zinc-50"
            title="Restart the shared Election Day clock at 06:00 — handy before demoing a different agent from the top of the day"
          >
            Reset Clock
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[380px_1fr]">
        <PhoneFrame clock={formatSimClock(simMinutes)}>
          <div className="p-3">
            <div className="mb-3 rounded-xl bg-co-orange px-3 py-3 text-white">
              <div className="text-[10px] uppercase tracking-wide text-white/70">Your assignment</div>
              <div className="text-sm font-bold">{pu?.name ?? agent.assignedPuId}</div>
              <div className="text-[11px] text-white/80">{ward?.name} Ward &middot; {flagship?.lgaName}, {flagship?.stateName}</div>
            </div>

            {overdue && (
              <div className="mb-3 animate-pulse rounded-lg border border-co-amber bg-co-amber/10 px-3 py-2 text-[11px] font-semibold text-co-amber">
                ⏰ PU Presence verification due — tap Step 4 to confirm you&apos;re present and focused.
              </div>
            )}

            {/* Step 1 — Check-in */}
            <StepCard step={1} title="Report at PU &amp; Check In" done={!!state.checkIn}>
              {!state.checkIn ? (
                <PrimaryButton
                  onClick={() => {
                    const gps = simulateGpsCheckIn(agent.id);
                    mStore.checkIn(agent.id, simMinutes, gps.verified, gps.distanceM);
                  }}
                >
                  📍 Check In Now (GPS)
                </PrimaryButton>
              ) : (
                <div className="text-[11px] text-zinc-500">
                  Checked in at {formatSimClock(state.checkIn.ts)} &middot; {state.checkIn.distanceM}m from registered PU &middot;{" "}
                  <Badge tone={state.checkIn.gpsVerified ? "green" : "amber"}>
                    {state.checkIn.gpsVerified ? "GPS verified" : "Flagged — manual review"}
                  </Badge>
                </div>
              )}
            </StepCard>

            {/* Step 2 — Officials & materials */}
            <StepCard step={2} title="INEC Officials &amp; Materials" done={bothMaterialsIn}>
              <div className="mb-1.5 flex items-center justify-between text-[11px] text-zinc-600">
                <span>Officials arrived</span>
                {state.officialsArrivedTs ? (
                  <Badge tone="green">{formatSimClock(state.officialsArrivedTs)}</Badge>
                ) : (
                  <button
                    onClick={() => mStore.reportOfficialsArrived(agent.id, simMinutes)}
                    disabled={!state.checkIn}
                    className="rounded bg-co-navy px-2 py-1 text-[10px] font-semibold text-white disabled:opacity-30"
                  >
                    Report arrival
                  </button>
                )}
              </div>
              <div className="flex items-center justify-between text-[11px] text-zinc-600">
                <span>Election materials arrived</span>
                {state.materialsArrivedTs ? (
                  <Badge tone="green">{formatSimClock(state.materialsArrivedTs)}</Badge>
                ) : (
                  <button
                    onClick={() => mStore.reportMaterialsArrived(agent.id, simMinutes)}
                    disabled={!state.checkIn}
                    className="rounded bg-co-navy px-2 py-1 text-[10px] font-semibold text-white disabled:opacity-30"
                  >
                    Report arrival
                  </button>
                )}
              </div>
              {state.officialsArrivedTs && !state.materialsArrivedTs && (
                <div className="mt-1.5 text-[10px] font-medium text-co-red">Officials on-site without materials — flag delay if this persists.</div>
              )}
            </StepCard>

            {/* Step 3 — Accreditation start */}
            <StepCard step={3} title="Report Accreditation Start" done={!!state.accreditationStartedTs}>
              {state.accreditationStartedTs ? (
                <div className="text-[11px] text-zinc-500">Accreditation started {formatSimClock(state.accreditationStartedTs)}</div>
              ) : (
                <PrimaryButton onClick={() => mStore.startAccreditation(agent.id, simMinutes)} disabled={!bothMaterialsIn}>
                  Report Accreditation Started
                </PrimaryButton>
              )}
            </StepCard>

            {/* Step 4 — PU Presence */}
            <StepCard step={4} title="PU Presence Verification" done={!overdue && state.lastTrainingVerifiedTs > 0}>
              <div className="mb-1.5 flex items-center justify-between text-[11px] text-zinc-600">
                <span>Prompt interval</span>
                <select
                  value={state.trainingIntervalMinutes}
                  onChange={(e) => mStore.setTrainingInterval(agent.id, Number(e.target.value) as TrainingIntervalMinutes)}
                  className="rounded border border-zinc-200 px-1.5 py-1 text-[10px] font-semibold text-co-navy outline-none"
                >
                  {TRAINING_INTERVAL_OPTIONS.map((m) => (
                    <option key={m} value={m}>
                      {INTERVAL_LABEL[m]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-1.5 text-[10px] text-zinc-400">Next check due {formatSimClock(dueAt)} &middot; last verified {formatSimClock(state.lastTrainingVerifiedTs)}</div>
              <PrimaryButton onClick={() => mStore.verifyTraining(agent.id, simMinutes)} tone={overdue ? "red" : "navy"}>
                {overdue ? "Confirm Presence — Verify Now" : "Verify Presence Early"}
              </PrimaryButton>
            </StepCard>

            {/* Step 5 — Incidents */}
            <StepCard step={5} title="Report an Incident">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as IncidentCategory)}
                className="mb-1.5 w-full rounded border border-zinc-200 px-2 py-1.5 text-[11px] outline-none"
              >
                {INCIDENT_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="One-line detail (optional)"
                className="mb-1.5 w-full rounded border border-zinc-200 px-2 py-1.5 text-[11px] outline-none"
              />
              <PrimaryButton
                tone="red"
                onClick={() => {
                  mStore.reportIncident(agent.id, simMinutes, category, note || INCIDENT_CATEGORIES.find((c) => c.id === category)!.label);
                  setNote("");
                }}
              >
                🚨 Report &amp; Escalate
              </PrimaryButton>
              {state.incidents.length > 0 && (
                <div className="mt-2 space-y-1">
                  {state.incidents.map((inc, i) => (
                    <div key={i} className="rounded bg-co-red/5 px-2 py-1 text-[10px] text-co-red">
                      {formatSimClock(inc.ts)} — {INCIDENT_CATEGORIES.find((c) => c.id === inc.category)?.label}: {inc.note}
                    </div>
                  ))}
                </div>
              )}
            </StepCard>

            {/* Step 6 — Final collation */}
            <StepCard step={6} title="Final Collation Report" done={!!state.collation}>
              {state.collation ? (
                <div className="text-[11px] text-zinc-500">
                  Submitted {formatSimClock(state.collation.ts)} &middot; {state.collation.accreditedCount} accredited &middot; {state.collation.votesCast} votes cast &middot;{" "}
                  {state.collation.photoAttached ? "📷 photo attached" : "no photo"}
                </div>
              ) : (
                <>
                  <div className="mb-1.5 grid grid-cols-2 gap-1.5">
                    <input
                      value={accredited}
                      onChange={(e) => setAccredited(e.target.value.replace(/\D/g, ""))}
                      placeholder="Accredited"
                      className="rounded border border-zinc-200 px-2 py-1.5 text-[11px] outline-none"
                    />
                    <input
                      value={votes}
                      onChange={(e) => setVotes(e.target.value.replace(/\D/g, ""))}
                      placeholder="Votes cast"
                      className="rounded border border-zinc-200 px-2 py-1.5 text-[11px] outline-none"
                    />
                  </div>
                  <button
                    onClick={() => setPhoto((p) => !p)}
                    className={`mb-1.5 w-full rounded border px-2 py-1.5 text-[11px] font-medium ${photo ? "border-co-green bg-co-green/10 text-co-green" : "border-zinc-200 text-zinc-500"}`}
                  >
                    {photo ? "📷 Result sheet photo attached" : "📷 Attach result-sheet photo"}
                  </button>
                  <PrimaryButton
                    tone="green"
                    disabled={!accredited || !votes}
                    onClick={() => {
                      mStore.submitCollation(agent.id, simMinutes, Number(accredited), Number(votes), photo);
                    }}
                  >
                    Submit Final Collation
                  </PrimaryButton>
                </>
              )}
            </StepCard>

            <Link href="/mobilisation/training" className="mt-2 block text-center text-[11px] text-co-navy underline">
              Need a refresher? Open the Training Guide
            </Link>
          </div>
        </PhoneFrame>

        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <h3 className="mb-3 text-sm font-semibold text-co-navy">Why this matters</h3>
          <ul className="space-y-2 text-xs text-zinc-500">
            <li><strong className="text-co-navy">GPS check-in</strong> proves agents are physically present at their assigned PU, not phoning it in from home.</li>
            <li><strong className="text-co-navy">Periodic PU presence prompts</strong> (configurable interval) keep agents focused and re-confirm they haven&apos;t abandoned post.</li>
            <li><strong className="text-co-navy">Officials-vs-materials split reporting</strong> catches the real failure mode where INEC staff arrive but materials don&apos;t — the single biggest cause of delayed accreditation starts in past elections.</li>
            <li><strong className="text-co-navy">5-category incident reporting</strong> keeps escalation fast under pressure — no long forms, one tap.</li>
            <li><strong className="text-co-navy">Photo + figures collation</strong> gives HQ an independent result cross-check the moment polls close, before official INEC upload.</li>
          </ul>
          <div className="mt-4 rounded-lg bg-zinc-50 p-3 text-[11px] text-zinc-400">
            Every action above updates the Admin Dashboard live — open it in another tab to watch this agent&apos;s status change in real time.
          </div>
        </div>
      </div>
    </div>
  );
}
