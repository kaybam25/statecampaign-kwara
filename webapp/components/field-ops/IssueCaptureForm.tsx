"use client";

import { useState } from "react";
import { REAL_DATA_LGAS, getWardsInLGA } from "@/lib/data";
import {
  useIssuesStore,
  ISSUE_CATEGORY_LABEL,
  type IssueCategory,
  type IssueStatus,
} from "@/lib/store/issues";

const CATEGORIES = Object.keys(ISSUE_CATEGORY_LABEL) as IssueCategory[];

const STATUS_STYLE: Record<IssueStatus, string> = {
  New: "bg-amber-100 text-amber-700",
  Routed: "bg-blue-100 text-blue-700",
  Resolved: "bg-co-green/10 text-co-green",
};

function timeAgo(ts: number) {
  const mins = Math.max(0, Math.round((Date.now() - ts) / 60000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  return `${Math.round(mins / 60)}h ago`;
}

export default function IssueCaptureForm() {
  const allWards = REAL_DATA_LGAS.flatMap((f) => getWardsInLGA(f.lgaId).map((w) => ({ id: w.id, label: `${f.stateName} — ${w.name}` })));

  const [category, setCategory] = useState<IssueCategory>("service_complaint");
  const [wardId, setWardId] = useState(allWards[0]?.id ?? "");
  const [description, setDescription] = useState("");
  const [hasPhoto, setHasPhoto] = useState(false);

  const issues = useIssuesStore((s) => s.issues);
  const logIssue = useIssuesStore((s) => s.logIssue);
  const resolveIssue = useIssuesStore((s) => s.resolveIssue);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) return;
    const wardLabel = allWards.find((w) => w.id === wardId)?.label ?? "Unassigned ward";
    logIssue({ category, wardLabel, description: description.trim(), hasPhoto });
    setDescription("");
    setHasPhoto(false);
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <form onSubmit={handleSubmit} className="rounded-xl border border-zinc-200 bg-white p-4">
        <h3 className="mb-3 text-sm font-semibold text-co-navy">Issue Capture Form</h3>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as IssueCategory)}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-co-orange"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {ISSUE_CATEGORY_LABEL[c]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">Ward</label>
            <select
              value={wardId}
              onChange={(e) => setWardId(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-co-orange"
            >
              {allWards.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What the constituent reported..."
              className="h-20 w-full resize-none rounded-lg border border-zinc-200 p-3 text-sm outline-none focus:border-co-orange"
            />
          </div>
          <label className="flex items-center gap-2 text-xs text-zinc-500">
            <input type="checkbox" checked={hasPhoto} onChange={(e) => setHasPhoto(e.target.checked)} />
            Photo attached (placeholder)
          </label>
          <button type="submit" className="w-full rounded-lg bg-co-orange px-4 py-2 text-xs font-semibold text-white hover:opacity-90">
            Log Issue
          </button>
        </div>
      </form>

      <div className="rounded-xl border border-zinc-200 bg-white p-4">
        <h3 className="mb-3 text-sm font-semibold text-co-navy">Issues Log ({issues.length})</h3>
        <div className="max-h-96 space-y-2 overflow-y-auto">
          {issues.length === 0 && <p className="text-xs text-zinc-400">No issues logged yet — submit the form to see it appear here live.</p>}
          {issues.map((i) => (
            <div key={i.id} className="rounded-lg border border-zinc-100 bg-zinc-50 p-3">
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-co-navy">{ISSUE_CATEGORY_LABEL[i.category]}</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${STATUS_STYLE[i.status]}`}>{i.status}</span>
              </div>
              <p className="text-xs text-zinc-600">{i.description}</p>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10px] text-zinc-400">
                <span>{i.wardLabel}</span>
                <span>&rarr; {i.routedTo}</span>
                <span>{timeAgo(i.loggedAt)}</span>
                {i.hasPhoto && <span>📷 photo</span>}
                {i.queuedOffline && i.syncedAt === null && <span className="font-semibold text-amber-600">queued offline</span>}
              </div>
              {i.status !== "Resolved" && (
                <button onClick={() => resolveIssue(i.id)} className="mt-2 text-[10px] font-semibold text-co-green hover:underline">
                  Mark resolved
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
