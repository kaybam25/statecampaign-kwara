import { BROADCAST_QUEUE, type BroadcastRecord } from "@/lib/comms-data";
import type { SentBlast } from "./ExampleBlasts";

function fmt(n: number) {
  return n >= 1000 ? `${(n / 1000).toLocaleString(undefined, { maximumFractionDigits: 0 })}K` : n.toString();
}

const AUDIENCE_COUNT_BY_ID: Record<SentBlast["audienceId"], number> = {
  field_agents: 18,
  ward_supporters: 480,
  press_media: 340,
};

function blastToRecord(b: SentBlast): BroadcastRecord {
  return {
    id: b.id,
    label: `${b.audienceLabel}${b.wardLabel ? ` — ${b.wardLabel}` : ""} (example blast)`,
    channel: "WhatsApp",
    status: "Sent",
    whenLabel: "Just now",
    audienceCount: AUDIENCE_COUNT_BY_ID[b.audienceId],
    deliveredPct: 97,
    openedPct: 61,
  };
}

export default function BroadcastQueue({ exampleBlasts = [] }: { exampleBlasts?: SentBlast[] }) {
  const rows = [...exampleBlasts.map(blastToRecord).reverse(), ...BROADCAST_QUEUE];
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <h3 className="mb-3 text-sm font-semibold text-co-navy">Scheduled Broadcast Queue</h3>
      <div className="space-y-2">
        {rows.map((b) => (
          <div key={b.id} className="flex items-center justify-between gap-3 rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2">
            <div className="min-w-0">
              <div className="truncate text-xs font-medium text-co-navy">{b.label}</div>
              <div className="text-[10px] text-zinc-400">
                {b.channel} &middot; {b.whenLabel} &middot; {fmt(b.audienceCount)} audience
              </div>
            </div>
            <div className="shrink-0 text-right">
              {b.status === "Sent" ? (
                <div className="text-[10px] text-zinc-500">
                  <div>
                    <span className="font-semibold text-co-teal">{b.deliveredPct}%</span> delivered
                  </div>
                  <div>
                    <span className="font-semibold text-co-purple">{b.openedPct}%</span> opened
                  </div>
                </div>
              ) : (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">Scheduled</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
