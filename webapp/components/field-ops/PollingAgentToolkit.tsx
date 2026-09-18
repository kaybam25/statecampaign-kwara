import Link from "next/link";

const LEGAL_RIGHTS = [
  "You have the right to be present at your assigned Polling Unit throughout accreditation, voting, and counting.",
  "You have the right to a copy of the result sheet (EC8A) at the close of counting, signed by the Presiding Officer.",
  "You have the right to record objections in the polling agents' remarks section before results are announced.",
  "You do not have the right to touch BVAS devices or ballot materials — report equipment concerns to the Presiding Officer, then to your coordinator.",
];

const FORM_GUIDES = [
  { code: "EC8A", desc: "Polling Unit result sheet — the form you photograph for the Result Collation Interface." },
  { code: "EC40G", desc: "Incident/complaint form — use for any procedural objection you want on the record." },
  { code: "EC25B", desc: "Voter register — used to confirm your PU's registered voter count matches INEC's." },
];

export default function PollingAgentToolkit() {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <h3 className="mb-3 text-sm font-semibold text-co-navy">Polling Agent Toolkit</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">Legal rights reminder</h4>
          <ul className="space-y-1.5">
            {LEGAL_RIGHTS.map((r) => (
              <li key={r} className="flex gap-2 text-xs text-zinc-600">
                <span className="text-co-orange">&bull;</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">INEC form quick-guides</h4>
          <ul className="space-y-1.5">
            {FORM_GUIDES.map((f) => (
              <li key={f.code} className="text-xs text-zinc-600">
                <span className="font-semibold text-co-navy">{f.code}:</span> {f.desc}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-zinc-100 pt-4">
        <button
          type="button"
          className="rounded-lg bg-co-red px-3 py-1.5 text-xs font-semibold text-white opacity-90 hover:opacity-100"
          title="Demo only — no real call is placed"
        >
          &#9742; Call Legal Officer (demo)
        </button>
        <Link
          href="/mobilisation/agent"
          className="rounded-lg border border-co-orange px-3 py-1.5 text-xs font-semibold text-co-orange hover:bg-co-orange/5"
        >
          Open result-sheet photo upload &rarr;
        </Link>
      </div>
    </div>
  );
}
