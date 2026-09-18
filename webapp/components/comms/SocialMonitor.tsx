import { SOCIAL_MENTIONS, type SentimentTag } from "@/lib/comms-data";

const SENTIMENT_STYLE: Record<SentimentTag, string> = {
  Positive: "bg-co-green/10 text-co-green",
  Negative: "bg-red-100 text-red-600",
  Neutral: "bg-zinc-100 text-zinc-500",
};

export default function SocialMonitor() {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <h3 className="mb-3 text-sm font-semibold text-co-navy">Social Media Monitor</h3>
      <div className="max-h-80 space-y-2 overflow-y-auto">
        {SOCIAL_MENTIONS.map((m) => (
          <div key={m.id} className="rounded-lg border border-zinc-100 bg-zinc-50 p-2.5">
            <div className="mb-1 flex items-center justify-between gap-2">
              <span className="text-[10px] font-semibold text-co-navy">{m.platform}</span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${SENTIMENT_STYLE[m.sentiment]}`}>{m.sentiment}</span>
            </div>
            <p className="text-xs text-zinc-600">{m.snippet}</p>
            <div className="mt-1 text-[10px] text-zinc-400">{m.whenLabel}</div>
          </div>
        ))}
      </div>
      <p className="mt-2 text-[10px] text-zinc-400">Scripted sample mentions — see Voter Intelligence for the linked sentiment tracker.</p>
    </div>
  );
}
