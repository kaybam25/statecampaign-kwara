import Link from "next/link";
import { kwaraTotals, KWARA_LGAS, states } from "@/lib/data";
import ModuleNavCard from "@/components/shared/ModuleNavCard";
import PdpStrip from "@/components/shared/PdpStrip";

const MODULES = [
  { title: "Mobilisation Hub", href: "/modules/mobilisation", color: "#e85d2c", desc: "INEC ward structure, agent network, GOTV tools." },
  { title: "Voter Intelligence", href: "/modules/voter-intel", color: "#7c3aed", desc: "Swing ward identifier and sentiment tracking." },
  { title: "Communications Centre", href: "/modules/comms", color: "#0f766e", desc: "WhatsApp, SMS/USSD, and social media command centre." },
  { title: "Field Operations", href: "/modules/field-ops", color: "#e85d2c", desc: "Canvassing routes, issue capture, election-day ops." },
];

const kwaraState = states.find((s) => s.id === "kwara")!;

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 p-6">
      <PdpStrip />
      <header className="mb-6 rounded-xl bg-co-navy px-6 py-6 text-white">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Kwara State CampaignOS</h1>
            <p className="mt-1 text-sm text-white/70">Nigeria Political Campaign Platform — Kwara State PDP Demo</p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/command-center"
              className="rounded-lg bg-white/15 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-white/25"
            >
              Kwara State Command Center &rarr;
            </Link>
            <Link
              href="/territory"
              className="rounded-lg bg-co-orange px-4 py-2 text-sm font-semibold text-white shadow hover:bg-co-orange/90"
            >
              Start Guided Demo &rarr;
            </Link>
          </div>
        </div>
        <p className="mt-2 text-xs text-white/50">
          Suggested order: 1. Territory Navigator &nbsp;&middot;&nbsp; 2. Election Day Single-LGA Monitor &nbsp;&middot;&nbsp; 3. Kwara State Command Center &nbsp;&middot;&nbsp; 4. Reports &nbsp;&middot;&nbsp; 5. Modules below
        </p>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat value={kwaraTotals.registeredVoters.toLocaleString()} label="Registered Voters" />
          <Stat value={kwaraTotals.totalWards.toLocaleString()} label="Electoral Wards" />
          <Stat value={kwaraTotals.totalPollingUnits.toLocaleString()} label="Polling Units" />
          <Stat value={kwaraTotals.electivePositions.toLocaleString()} label="Elective Positions" />
        </div>
      </header>

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <QuickLink href="/territory" title="Territory Navigator" desc="National → Zone → State → LGA → Ward → Polling Unit" color="#0f1f3a" />
        <QuickLink href="/election-day" title="Election Day — Single-LGA Monitor" desc="Live simulation for any of Kwara's 16 LGAs, one at a time" color="#dc2626" />
        <QuickLink href="/command-center" title="Kwara State Command Center" desc="All 16 Kwara LGAs live at once" color="#7c3aed" />
        <QuickLink href="/reports" title="Reports & KPI Scorecard" desc="10 campaign performance metrics, exportable" color="#1b7a43" />
      </div>

      <div className="mb-6 rounded-xl border border-co-teal/30 bg-co-teal/5 p-4">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-co-teal">Kwara State — Full Real INEC Coverage</h2>
          <span className="text-[11px] text-zinc-500">
            {kwaraState.lgaCount} of {kwaraState.lgaCount} LGAs &middot; {kwaraState.wardCount.toLocaleString()} wards &middot; {kwaraState.puCount.toLocaleString()} polling units
          </span>
        </div>
        <p className="mb-3 text-xs text-zinc-500">
          Every Kwara LGA has real, sourced INEC ward and polling-unit data. Drill into any of them in the Territory Navigator.
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-5">
          {KWARA_LGAS.map((f) => (
            <Link
              key={f.lgaId}
              href={`/territory?lga=${f.lgaId}`}
              className="rounded-lg border border-zinc-100 bg-white px-3 py-2 transition hover:border-co-teal hover:shadow-sm"
            >
              <div className="text-xs font-semibold text-co-navy">{f.lgaName}</div>
              <div className="text-[11px] text-zinc-400">real ward &amp; PU data</div>
            </Link>
          ))}
        </div>
      </div>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">The 4 CampaignOS Modules</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {MODULES.map((m) => (
          <ModuleNavCard key={m.href} href={m.href} title={m.title} description={m.desc} color={m.color} />
        ))}
      </div>

      <footer className="mt-8 text-xs text-zinc-400">
        CampaignOS Demo — built for pitch purposes, Kwara State PDP track. Android/iOS and real INEC/payment/SMS integrations are Phase 2, contingent on approval.
      </footer>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-lg bg-white/10 px-3 py-2">
      <div className="text-lg font-bold tabular-nums">{value}</div>
      <div className="text-[11px] text-white/60">{label}</div>
    </div>
  );
}

function QuickLink({ href, title, desc, color }: { href: string; title: string; desc: string; color: string }) {
  return (
    <Link
      href={href}
      className="rounded-xl border-l-4 bg-white p-4 shadow-sm transition hover:shadow-md"
      style={{ borderLeftColor: color }}
    >
      <div className="text-sm font-semibold text-co-navy">{title}</div>
      <div className="mt-1 text-xs text-zinc-500">{desc}</div>
    </Link>
  );
}
