"use client";

import { useState } from "react";
import { KWARA_STATE_HISTORY, KWARA_TURNOUT_SCENARIO_LOW, KWARA_TURNOUT_SCENARIO_HIGH, interpolateKwaraTurnoutScenario } from "@/lib/kwara-election-data";

export default function TurnoutSimulator() {
  const [turnout, setTurnout] = useState(KWARA_STATE_HISTORY.find((h) => h.year === 2023)!.turnoutPct);
  const scenario = interpolateKwaraTurnoutScenario(turnout);

  const min = KWARA_TURNOUT_SCENARIO_LOW.turnoutPct;
  const max = KWARA_TURNOUT_SCENARIO_HIGH.turnoutPct;

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <h3 className="mb-1 text-sm font-semibold text-co-navy">Kwara Turnout Scenario Simulator</h3>
      <p className="mb-4 text-xs text-zinc-500">
        Move the slider between Kwara&apos;s two real recorded turnout extremes across the last 3 governorship cycles: 2023&apos;s 27.88% (lowest)
        and 2015&apos;s 37.07% (highest). Vote-share is a linear interpolation between those two real results, not a poll of its own.
      </p>

      <input
        type="range"
        min={min}
        max={max}
        step={0.1}
        value={turnout}
        onChange={(e) => setTurnout(parseFloat(e.target.value))}
        className="w-full accent-co-purple"
      />
      <div className="mb-4 mt-1 flex justify-between text-[10px] text-zinc-400">
        {KWARA_STATE_HISTORY.slice()
          .reverse()
          .map((h) => (
            <span key={h.year} className={h.turnoutPct === Math.round(turnout * 10) / 10 ? "font-bold text-co-purple" : ""}>
              {h.year}: {h.turnoutPct}%
            </span>
          ))}
      </div>

      <div className="mb-3 text-center">
        <span className="text-2xl font-bold tabular-nums text-co-navy">{turnout.toFixed(1)}%</span>
        <span className="ml-2 text-xs text-zinc-400">Kwara-wide turnout</span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-co-green/5 p-3 text-center">
          <div className="text-xl font-bold tabular-nums text-co-green">{scenario.apcPct}%</div>
          <div className="text-[10px] uppercase tracking-wide text-zinc-500">APC vote share</div>
        </div>
        <div className="rounded-lg bg-red-50 p-3 text-center">
          <div className="text-xl font-bold tabular-nums text-red-600">{scenario.pdpPct}%</div>
          <div className="text-[10px] uppercase tracking-wide text-zinc-500">PDP vote share</div>
        </div>
        <div className="rounded-lg bg-zinc-100 p-3 text-center">
          <div className="text-xl font-bold tabular-nums text-zinc-500">{scenario.otherPct}%</div>
          <div className="text-[10px] uppercase tracking-wide text-zinc-500">Other / SDP</div>
        </div>
      </div>
      <p className="mt-3 text-[10px] text-zinc-400">
        Real anchors — 2023 (lowest-turnout cycle): APC {KWARA_TURNOUT_SCENARIO_LOW.apcPct}% / PDP {KWARA_TURNOUT_SCENARIO_LOW.pdpPct}%. 2015
        (highest-turnout cycle): APC {KWARA_TURNOUT_SCENARIO_HIGH.apcPct}% / PDP {KWARA_TURNOUT_SCENARIO_HIGH.pdpPct}%. Source: INEC-declared
        results via Wikipedia's 2015/2019/2023 Kwara State gubernatorial election articles.
      </p>
    </div>
  );
}
