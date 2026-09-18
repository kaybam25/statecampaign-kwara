"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useElectionDayStore } from "@/lib/store/electionDay";
import { useMobilisationStore } from "@/lib/store/mobilisation";
import { FIELD_AGENTS, getConstituentsForWard } from "@/lib/mobilisation-data";
import { getWard, getFlagship } from "@/lib/data";
import type { ReminderChannel, ReminderKind } from "@/lib/types";
import PhoneFrame from "@/components/mobilisation/PhoneFrame";
import { StepCard, PrimaryButton, formatSimClock } from "@/components/mobilisation/StepCard";

const CANVASSERS = FIELD_AGENTS.filter((a) => a.role === "canvasser");

const TEMPLATES: Record<ReminderKind, { label: string; message: (puName: string) => string; audience: "all" | "transport" }> = {
  voting_awareness: {
    label: "Voting Awareness + PU Reminder",
    message: (pu) => `Good morning! Today is election day — your polling unit is ${pu}. Accreditation starts early, so please arrive before 8:00am with your PVC. Every vote counts!`,
    audience: "all",
  },
  transport_logistics: {
    label: "Transport Pickup Notice",
    message: (pu) => `Your ride to vote is confirmed. A CampaignOS transport volunteer will meet you near ${pu} between 7:00–7:30am and bring you back after you vote. Reply YES to confirm.`,
    audience: "transport",
  },
  gotv_push: {
    label: "GOTV Push (haven't voted yet)",
    message: (pu) => `We're counting on you today! Your polling unit (${pu}) stays open until 2:30pm — there's still time to get out and vote.`,
    audience: "all",
  },
};

export default function CanvasserAppPage() {
  const [agentId, setAgentId] = useState(CANVASSERS[0].id);
  const agent = CANVASSERS.find((a) => a.id === agentId)!;
  const ward = getWard(agent.assignedWardId!);
  const flagship = getFlagship(agent.lgaId);
  const constituents = getConstituentsForWard(agent.assignedWardId!, 6);

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

  const [kind, setKind] = useState<ReminderKind>("voting_awareness");
  const [channels, setChannels] = useState<ReminderChannel[]>(["whatsapp", "sms"]);

  // Reminder-type/channel selection is local UI state, not store state —
  // reset it to the defaults whenever the presenter switches "Signed in as"
  // to a different canvasser, same fix as the Field Agent App.
  useEffect(() => {
    setKind("voting_awareness");
    setChannels(["whatsapp", "sms"]);
  }, [agentId]);

  if (!state) return null;

  const toggleChannel = (c: ReminderChannel) => setChannels((s) => (s.includes(c) ? s.filter((x) => x !== c) : [...s, c]));

  const template = TEMPLATES[kind];
  const audience = template.audience === "transport" ? constituents.filter((c) => c.needsTransport) : constituents;
  const sampleName = audience[0]?.puName ?? ward?.name ?? "your polling unit";

  return (
    <div className="min-h-screen bg-zinc-50 p-6">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-co-navy">Field Canvasser / Transport Coordinator App</h1>
          <p className="text-xs text-zinc-500">Election-morning outreach — WhatsApp/SMS sending is simulated, no real messages leave this demo.</p>
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
            {CANVASSERS.map((a) => {
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
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[380px_1fr]">
        <PhoneFrame clock={formatSimClock(simMinutes)}>
          <div className="p-3">
            <div className="mb-3 rounded-xl bg-co-orange px-3 py-3 text-white">
              <div className="text-[10px] uppercase tracking-wide text-white/70">Your ward</div>
              <div className="text-sm font-bold">{ward?.name}</div>
              <div className="text-[11px] text-white/80">{flagship?.lgaName}, {flagship?.stateName} &middot; {constituents.length} canvassed contacts</div>
            </div>

            <StepCard step={1} title="Choose reminder type">
              <div className="space-y-1.5">
                {(Object.keys(TEMPLATES) as ReminderKind[]).map((k) => (
                  <button
                    key={k}
                    onClick={() => setKind(k)}
                    className={`w-full rounded-lg border px-2.5 py-2 text-left text-[11px] font-medium ${
                      kind === k ? "border-co-orange bg-co-orange/10 text-co-orange" : "border-zinc-200 text-zinc-500"
                    }`}
                  >
                    {TEMPLATES[k].label}
                  </button>
                ))}
              </div>
            </StepCard>

            <StepCard step={2} title="Channels">
              <div className="flex gap-1.5">
                {(["whatsapp", "sms"] as ReminderChannel[]).map((c) => (
                  <button
                    key={c}
                    onClick={() => toggleChannel(c)}
                    className={`rounded-full border px-3 py-1 text-[11px] font-medium ${
                      channels.includes(c) ? "border-co-teal bg-co-teal/10 text-co-teal" : "border-zinc-200 text-zinc-500"
                    }`}
                  >
                    {c === "whatsapp" ? "WhatsApp" : "SMS"}
                  </button>
                ))}
              </div>
            </StepCard>

            <StepCard step={3} title="Preview &amp; send">
              <div className="mb-2 rounded-lg bg-zinc-100 p-2 text-[11px] italic text-zinc-600">&ldquo;{template.message(sampleName)}&rdquo;</div>
              <div className="mb-2 text-[10px] text-zinc-400">
                Audience: {audience.length} of {constituents.length} contacts {template.audience === "transport" ? "(transport-needs only)" : "(all canvassed)"}
              </div>
              <PrimaryButton
                disabled={channels.length === 0 || audience.length === 0}
                onClick={() => channels.forEach((c) => mStore.sendReminder(agent.id, simMinutes, c, kind, audience.length))}
              >
                Send to {audience.length} contact{audience.length === 1 ? "" : "s"}
              </PrimaryButton>
            </StepCard>

            {state.remindersSent.length > 0 && (
              <StepCard step={4} title="Sent log">
                <div className="space-y-1">
                  {[...state.remindersSent].reverse().map((r, i) => (
                    <div key={i} className="rounded bg-co-teal/5 px-2 py-1 text-[10px] text-co-teal">
                      {formatSimClock(r.ts)} — {TEMPLATES[r.kind].label} via {r.channel === "whatsapp" ? "WhatsApp" : "SMS"} to {r.recipientCount}
                    </div>
                  ))}
                </div>
              </StepCard>
            )}

            <Link href="/mobilisation/training" className="mt-2 block text-center text-[11px] text-co-navy underline">
              Need a refresher? Open the Training Guide
            </Link>
          </div>
        </PhoneFrame>

        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <h3 className="mb-3 text-sm font-semibold text-co-navy">Canvassed contacts in {ward?.name}</h3>
          <div className="overflow-hidden rounded-lg border border-zinc-100">
            <table className="w-full text-xs">
              <thead className="bg-zinc-50 text-[10px] uppercase tracking-wide text-zinc-400">
                <tr>
                  <th className="px-3 py-2 text-left">Name</th>
                  <th className="px-3 py-2 text-left">Polling Unit</th>
                  <th className="px-3 py-2 text-left">Transport?</th>
                </tr>
              </thead>
              <tbody>
                {constituents.map((c) => (
                  <tr key={c.id} className="border-t border-zinc-100">
                    <td className="px-3 py-2 text-co-navy">{c.name}</td>
                    <td className="px-3 py-2 text-zinc-500">{c.puName}</td>
                    <td className="px-3 py-2">
                      {c.needsTransport ? <span className="text-co-amber">Needs pickup</span> : <span className="text-zinc-400">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-[11px] text-zinc-400">Illustrative sample contacts, not real voter data. In production this list pulls from the canvassed-voter CRM with consent-based opt-in.</p>
        </div>
      </div>
    </div>
  );
}
