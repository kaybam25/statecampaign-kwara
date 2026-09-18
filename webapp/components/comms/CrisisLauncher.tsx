"use client";

import { useEffect, useRef, useState } from "react";
import { SAMPLE_CRISIS } from "@/lib/comms-data";

// Self-contained sample crisis scenario — this module page doesn't depend on
// the live Election Day simulation being started. Visual language matches
// components/election-day/CrisisBanner.tsx's countdown-to-response framing.

export default function CrisisLauncher({ onDraft }: { onDraft: () => void }) {
  const [launched, setLaunched] = useState(false);
  const [resolved, setResolved] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  function handleLaunch() {
    setLaunched(true);
    setResolved(false);
    setElapsedSec(0);
    onDraft();
    if (timerRef.current) clearInterval(timerRef.current);
    // Compressed demo clock: 1 simulated minute per real second, so a
    // <45-minute response target resolves inside 45 seconds on stage.
    timerRef.current = setInterval(() => {
      setElapsedSec((s) => s + 1);
    }, 1000);
  }

  function handlePublish() {
    if (timerRef.current) clearInterval(timerRef.current);
    setResolved(true);
  }

  const targetSec = SAMPLE_CRISIS.responseTargetMinutes;
  const remaining = Math.max(0, targetSec - elapsedSec);
  const overTarget = elapsedSec > targetSec;

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <h3 className="mb-3 text-sm font-semibold text-co-navy">Crisis Counter-Narrative Launcher</h3>

      {!launched && (
        <div className="rounded-lg border border-co-red/30 bg-co-red/5 p-3">
          <div className="mb-2 text-xs text-zinc-700">{SAMPLE_CRISIS.headline}</div>
          <button onClick={handleLaunch} className="rounded-lg bg-co-red px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90">
            Draft Counter-Narrative
          </button>
        </div>
      )}

      {launched && !resolved && (
        <div className="rounded-lg border border-co-red/40 bg-co-red/5 p-3 animate-pulse">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-co-red">Composer pre-filled &mdash; response clock running</span>
            <span className="shrink-0 rounded-lg bg-co-red px-2.5 py-1 text-xs font-bold tabular-nums text-white">
              {remaining}
              {overTarget ? "s over target" : "s to target"}
            </span>
          </div>
          <p className="text-[10px] text-zinc-500">
            Demo clock: 1 simulated minute per real second, target &lt;{targetSec} min &mdash; publish below to stop the clock.
          </p>
          <button onClick={handlePublish} className="mt-2 rounded-lg bg-co-navy px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90">
            Publish Counter-Narrative
          </button>
        </div>
      )}

      {resolved && (
        <div className="flex items-center gap-3 rounded-lg border border-co-green/30 bg-co-green/5 p-3">
          <span className="text-lg">✓</span>
          <div className="text-xs">
            <span className="font-semibold text-co-green">Published.</span>{" "}
            <span className="text-zinc-600">
              Counter-narrative live in {elapsedSec} simulated minutes {elapsedSec <= targetSec ? "— inside the target." : "— over the target, review response workflow."}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
