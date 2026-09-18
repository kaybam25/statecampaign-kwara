"use client";

import { useIssuesStore } from "@/lib/store/issues";
import { useState } from "react";

// Makes the demo's "offline-first architecture" claim demonstrable rather
// than a bullet point: toggling this queues new Issue Capture Form entries
// instead of routing them immediately, then plays a short sync confirmation
// when connectivity is restored.

export default function ConnectivityBanner() {
  const offline = useIssuesStore((s) => s.offline);
  const setOffline = useIssuesStore((s) => s.setOffline);
  const syncQueued = useIssuesStore((s) => s.syncQueued);
  const issues = useIssuesStore((s) => s.issues);
  const [lastSynced, setLastSynced] = useState<number | null>(null);

  const queuedCount = issues.filter((i) => i.queuedOffline && i.syncedAt === null).length;

  function handleToggle() {
    if (offline) {
      const synced = syncQueued();
      setOffline(false);
      setLastSynced(synced);
      window.setTimeout(() => setLastSynced(null), 4000);
    } else {
      setOffline(true);
    }
  }

  return (
    <div
      className={`mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3 transition ${
        offline ? "border-amber-300 bg-amber-50" : "border-zinc-200 bg-white"
      }`}
    >
      <div className="flex items-center gap-3">
        <span className={`h-2.5 w-2.5 rounded-full ${offline ? "bg-amber-500" : "bg-co-green"}`} />
        <div className="text-xs">
          <div className="font-semibold text-co-navy">
            {offline ? "Offline Mode — simulating no connectivity" : "Connected"}
          </div>
          <div className="text-zinc-500">
            {offline
              ? `New issue reports are queuing on-device${queuedCount ? ` — ${queuedCount} waiting to sync` : ""}.`
              : "All field functions work identically with no internet — this toggle simulates a rural ward with no signal."}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {lastSynced !== null && (
          <span className="rounded-full bg-co-green/10 px-3 py-1 text-xs font-semibold text-co-green">
            Synced {lastSynced} record{lastSynced === 1 ? "" : "s"}
          </span>
        )}
        <button
          onClick={handleToggle}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold text-white ${offline ? "bg-co-green" : "bg-amber-500"}`}
        >
          {offline ? "Reconnect & Sync" : "Simulate Offline"}
        </button>
      </div>
    </div>
  );
}
