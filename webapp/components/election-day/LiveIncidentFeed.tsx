"use client";

import type { FeedItem } from "@/lib/store/electionDay";
import { getPU, getFlagship } from "@/lib/data";

function lgaTag(lgaId: string | undefined): string {
  if (!lgaId) return "";
  const f = getFlagship(lgaId);
  return f ? `${f.lgaName} — ` : "";
}

function describe(item: FeedItem): { text: string; tone: string } {
  switch (item.kind) {
    case "checkin": {
      const pu = getPU(item.puId);
      return { text: `${lgaTag(item.lgaId)}Agent confirmed at ${pu?.name ?? item.puId}`, tone: "text-co-green" };
    }
    case "turnout": {
      const pu = getPU(item.puId);
      return { text: `${lgaTag(item.lgaId)}${item.accredited} accredited so far at ${pu?.name ?? item.puId}`, tone: "text-co-blue" };
    }
    case "result": {
      const pu = getPU(item.puId);
      return { text: `${lgaTag(item.lgaId)}Result sheet uploaded — ${pu?.name ?? item.puId}`, tone: "text-co-navy" };
    }
    case "incident": {
      const pu = getPU(item.puId);
      return { text: `${lgaTag(item.lgaId)}[${item.severity.toUpperCase()}] ${item.note} (${pu?.name ?? item.puId})`, tone: "text-co-red" };
    }
    case "alert":
      return { text: `⚠ DISINFORMATION ALERT: ${item.headline}`, tone: "text-co-red font-semibold" };
    case "alert_resolved":
      return { text: `✓ Counter-narrative published — alert resolved`, tone: "text-co-green font-semibold" };
  }
}

export default function LiveIncidentFeed({ items }: { items: FeedItem[] }) {
  return (
    <div className="flex h-full flex-col rounded-xl border border-zinc-200 bg-white">
      <div className="border-b border-zinc-100 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
        Live Feed
      </div>
      <div className="flex-1 space-y-1 overflow-y-auto px-4 py-2">
        {items.length === 0 && <div className="py-8 text-center text-xs text-zinc-400">Press Start to begin the simulation.</div>}
        {items.map((item, i) => {
          const d = describe(item);
          return (
            <div key={i} className={`text-xs leading-snug ${d.tone}`}>
              <span className="mr-1.5 font-mono text-[10px] text-zinc-400">{formatTs(item.ts)}</span>
              {d.text}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function formatTs(simMinutes: number) {
  const startHour = 6; // election day starts ~6am
  const totalMin = startHour * 60 + simMinutes;
  const h = Math.floor(totalMin / 60) % 24;
  const m = Math.floor(totalMin % 60);
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}
