"use client";

import Link from "next/link";
import { useElectionDayStore } from "@/lib/store/electionDay";
import { kwaraTotals } from "@/lib/data";

type Kpi = {
  name: string;
  definition: string;
  target: string;
  current: number; // 0-100 normalized for the bar
  currentLabel: string;
  live?: boolean;
};

export default function ReportsPage() {
  const store = useElectionDayStore();
  const lgaStates = Object.values(store.perLga);
  const totalPUs = lgaStates.reduce((a, l) => a + l.totalPUs, 0) || 1;
  const confirmedCount = lgaStates.reduce(
    (a, l) => a + Object.values(l.puStatus).filter((s) => s === "agent_confirmed" || s === "result_uploaded").length,
    0
  );
  const activationRate = Math.round((confirmedCount / totalPUs) * 100);
  const hasRun = lgaStates.length > 0 && lgaStates.some((l) => l.script.length > 0);
  const crisisResolved = store.disinfoAlert?.resolved;
  const crisisMinutes = store.disinfoAlert ? Math.round(store.disinfoAlert.resolveTs - store.disinfoAlert.startTs) : null;

  const kpis: Kpi[] = [
    { name: "Ward Penetration Rate", definition: "Wards with ≥1 active agent ÷ total wards", target: "95%+", current: 82, currentLabel: "82%" },
    {
      name: "PU Agent Activation Rate",
      definition: "Polling units with confirmed agent on election day ÷ total PUs, across all 16 Kwara LGAs",
      target: "90%+",
      current: hasRun ? activationRate : 65,
      currentLabel: hasRun ? `${activationRate}%` : "65% (illustrative — run the Election Day or Command Center simulation for live data)",
      live: hasRun,
    },
    { name: "PVC-to-Voter Conversion", definition: "PVC holders who voted ÷ PVC holders canvassed", target: ">70%", current: 61, currentLabel: "61%" },
    { name: "Swing Ward Capture Rate", definition: "Previously opposition wards now >50% support ÷ swing wards targeted", target: ">55%", current: 55, currentLabel: "55%" },
    { name: "Manifesto Awareness Score", definition: "Voters who can name ≥2 promises ÷ surveyed voters", target: ">60%", current: 88, currentLabel: "88%" },
    { name: "Donor Conversion Rate", definition: "Unique donors who completed payment ÷ visitors", target: ">12%", current: 45, currentLabel: "45%" },
    { name: "Zone Balance Index", definition: "Std. deviation of campaign investment across 6 zones", target: "<0.15", current: 71, currentLabel: "0.18 (approaching target)" },
    { name: "GOTV Turnout Delta", definition: "Turnout in canvassed wards vs non-canvassed control wards", target: "+8%+", current: 74, currentLabel: "+7.4pp" },
    { name: "Campaign Finance Compliance", definition: "Expenditure with receipts & INEC-compliant docs ÷ total", target: "100%", current: 96, currentLabel: "96%" },
    {
      name: "Crisis Response Time",
      definition: "Minutes from fake-news detection to counter-narrative published",
      target: "<45 min",
      current: crisisMinutes ? Math.max(0, 100 - crisisMinutes) : 90,
      currentLabel: crisisResolved ? `${crisisMinutes} min (resolved — see Command Center)` : crisisMinutes ? `In progress (target <45 min)` : "90 (illustrative — run the simulation to see live)",
      live: !!crisisResolved,
    },
  ];

  const exportPdf = async () => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("CampaignOS — Performance Scorecard", 14, 18);
    doc.setFontSize(9);
    doc.text("Demo export — live Kwara State (16 LGA) data where available, illustrative elsewhere.", 14, 25);
    let y = 36;
    doc.setFontSize(10);
    kpis.forEach((k) => {
      doc.setFont("helvetica", "bold");
      doc.text(k.name, 14, y);
      doc.setFont("helvetica", "normal");
      doc.text(`Target: ${k.target}`, 140, y);
      y += 5;
      doc.setFontSize(8);
      doc.text(k.definition, 14, y);
      doc.text(`Current: ${k.currentLabel}`, 140, y);
      doc.setFontSize(10);
      y += 8;
    });
    doc.save("campaignos-scorecard.pdf");
  };

  return (
    <div className="min-h-screen bg-zinc-50 p-6">
      <header className="mb-6 flex items-center justify-between rounded-xl bg-co-green px-6 py-5 text-white">
        <div>
          <h1 className="text-xl font-bold">Reports &amp; KPI Scorecard</h1>
          <p className="mt-1 text-xs text-white/80">
            10 performance metrics from the CampaignOS Strategy Report, scoped to Kwara State — {kwaraTotals.totalPollingUnits.toLocaleString()} polling units across all 16 LGAs, with live data shown wherever the simulation has run.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button onClick={exportPdf} className="rounded-lg bg-white/15 px-3 py-2 text-xs font-semibold hover:bg-white/25">
            Export PDF
          </button>
          <Link href="/" className="rounded-lg bg-white/15 px-3 py-2 text-xs font-semibold hover:bg-white/25">
            &larr; All modules
          </Link>
        </div>
      </header>

      <div className="space-y-3">
        {kpis.map((k) => (
          <div key={k.name} className="rounded-xl border border-zinc-200 bg-white p-4">
            <div className="mb-1 flex items-center justify-between gap-3">
              <div>
                <span className="text-sm font-semibold text-co-navy">{k.name}</span>
                {k.live && <span className="ml-2 rounded-full bg-co-green/10 px-2 py-0.5 text-[10px] font-medium text-co-green">LIVE</span>}
              </div>
              <div className="shrink-0 text-xs text-zinc-500">
                Target <span className="font-semibold text-co-navy">{k.target}</span> &middot; Current{" "}
                <span className="font-semibold text-co-navy">{k.currentLabel}</span>
              </div>
            </div>
            <p className="mb-2 text-xs text-zinc-400">{k.definition}</p>
            <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100">
              <div
                className="h-full rounded-full bg-co-orange transition-all"
                style={{ width: `${Math.min(100, Math.max(0, k.current))}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
