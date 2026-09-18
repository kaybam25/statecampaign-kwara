import Link from "next/link";
import ModuleShell from "@/components/shared/ModuleShell";
import { kwaraTotals } from "@/lib/data";

const FEATURES = [
  { title: "INEC Ward Structure Mirror", desc: "Full hierarchy pre-loaded: National → Zone → State → LGA → Ward → Polling Unit — see it live in the Territory Navigator." },
  { title: "Agent Registration & Vetting", desc: "ID verification, ward assignment, duplicate-registration detection." },
  { title: "GOTV Engine", desc: "Track PVC holders per ward, coordinate election-day deployment — see it live in the Election Day Operations Center." },
  { title: "Task Management", desc: "Assign daily tasks with USSD fallback for feature-phone agents in rural wards." },
  { title: "Coalition Partner Tracker", desc: "Database of allied parties, traditional rulers, religious leaders — rated by ward reach." },
  { title: "Decamping Manager", desc: "Workflow for managing incoming defectors, including press announcement templates." },
];

export default function MobilisationPage() {
  return (
    <ModuleShell
      title="Mobilisation Hub"
      subtitle={`The operational heart of CampaignOS — mirrors INEC's exact administrative hierarchy across Kwara State's ${kwaraTotals.totalWards.toLocaleString()} wards and ${kwaraTotals.totalPollingUnits.toLocaleString()} polling units.`}
      color="#e85d2c"
    >
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">Pre-Election Canvassing (new)</h3>
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Link href="/mobilisation/party-member" className="rounded-xl border-l-4 border-co-green bg-white p-4 shadow-sm hover:shadow-md">
          <div className="text-sm font-semibold text-co-navy">Party Member Canvassing App &rarr;</div>
          <div className="mt-1 text-xs text-zinc-500">
            Each member claims a fixed, non-overlapping block of voters within one polling unit — configurable 30/50/75/custom block size, per-voter
            contact tracking, no double-assignment.
          </div>
        </Link>
        <Link href="/mobilisation/canvass-command" className="rounded-xl border-l-4 border-co-navy bg-white p-4 shadow-sm hover:shadow-md">
          <div className="text-sm font-semibold text-co-navy">Canvassing Coverage — Command Center &rarr;</div>
          <div className="mt-1 text-xs text-zinc-500">
            Ward/LGA coverage tiles, a pilot-wide coverage map, and coordinator-set ward priority — see how canvassing progress rolls up across the
            whole pilot.
          </div>
        </Link>
      </div>

      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">Election Day Field Operations</h3>
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-4">
        <Link href="/mobilisation/agent" className="rounded-xl border-l-4 border-co-orange bg-white p-4 shadow-sm hover:shadow-md">
          <div className="text-sm font-semibold text-co-navy">Field Agent App &rarr;</div>
          <div className="mt-1 text-xs text-zinc-500">Simulated phone check-in: GPS, officials/materials, accreditation, training prompts, incidents, final collation.</div>
        </Link>
        <Link href="/mobilisation/canvasser" className="rounded-xl border-l-4 border-co-teal bg-white p-4 shadow-sm hover:shadow-md">
          <div className="text-sm font-semibold text-co-navy">Canvasser / Transport App &rarr;</div>
          <div className="mt-1 text-xs text-zinc-500">WhatsApp/SMS voting reminders, transport pickup notices, GOTV pushes to canvassed contacts.</div>
        </Link>
        <Link href="/mobilisation/command" className="rounded-xl border-l-4 border-co-navy bg-white p-4 shadow-sm hover:shadow-md">
          <div className="text-sm font-semibold text-co-navy">Mobilisation Admin Dashboard &rarr;</div>
          <div className="mt-1 text-xs text-zinc-500">Live roster of every agent &amp; canvasser, check-in/training status, incident feed, reminder reach.</div>
        </Link>
        <Link href="/mobilisation/training" className="rounded-xl border-l-4 border-co-amber bg-white p-4 shadow-sm hover:shadow-md">
          <div className="text-sm font-semibold text-co-navy">Quick Training Guide &rarr;</div>
          <div className="mt-1 text-xs text-zinc-500">Short how-to for agents and canvassers — no manual required.</div>
        </Link>
      </div>

      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">Territory &amp; Election Day Monitoring</h3>
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Link href="/territory" className="rounded-xl border-l-4 border-co-orange bg-white p-4 shadow-sm hover:shadow-md">
          <div className="text-sm font-semibold text-co-navy">Open Territory Navigator &rarr;</div>
          <div className="mt-1 text-xs text-zinc-500">Full ward-structure drill-down, live and interactive.</div>
        </Link>
        <Link href="/election-day" className="rounded-xl border-l-4 border-co-red bg-white p-4 shadow-sm hover:shadow-md">
          <div className="text-sm font-semibold text-co-navy">Open Election Day Monitor &rarr;</div>
          <div className="mt-1 text-xs text-zinc-500">Live GOTV deployment and agent activation simulation, one LGA at a time.</div>
        </Link>
        <Link href="/command-center" className="rounded-xl border-l-4 border-co-purple bg-white p-4 shadow-sm hover:shadow-md">
          <div className="text-sm font-semibold text-co-navy">Open Kwara State Command Center &rarr;</div>
          <div className="mt-1 text-xs text-zinc-500">All 16 Kwara LGAs monitored simultaneously.</div>
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <div key={f.title} className="rounded-xl border border-zinc-200 bg-white p-4">
            <div className="mb-1 text-sm font-semibold text-co-navy">{f.title}</div>
            <div className="text-xs text-zinc-500">{f.desc}</div>
          </div>
        ))}
      </div>
    </ModuleShell>
  );
}
