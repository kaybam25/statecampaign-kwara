import { create } from "zustand";

// Field Operations — Issue Capture Form store. Separate, lightweight store
// (mirrors the pattern in lib/store/mobilisation.ts) so this module page
// works standalone without depending on the live Election Day simulation
// clock — issue timestamps here use wall-clock Date.now() since agents
// would be logging these throughout the canvassing period, not just on
// election day itself.

export type IssueCategory = "service_complaint" | "personal_appeal" | "infrastructure" | "security_concern" | "other";

export const ISSUE_CATEGORY_LABEL: Record<IssueCategory, string> = {
  service_complaint: "Service complaint",
  personal_appeal: "Personal appeal",
  infrastructure: "Infrastructure request",
  security_concern: "Security concern",
  other: "Other",
};

// Auto-routing rule: service/infrastructure complaints go to the
// spokesperson (public-facing response); personal appeals and security
// concerns go direct to the candidate's office.
export function routeFor(category: IssueCategory): "Spokesperson" | "Candidate's Office" {
  if (category === "personal_appeal" || category === "security_concern") return "Candidate's Office";
  return "Spokesperson";
}

export type IssueStatus = "New" | "Routed" | "Resolved";

export type IssueRecord = {
  id: string;
  category: IssueCategory;
  wardLabel: string;
  description: string;
  hasPhoto: boolean;
  status: IssueStatus;
  routedTo: "Spokesperson" | "Candidate's Office";
  loggedAt: number; // Date.now()
  queuedOffline: boolean; // true if captured while the Connectivity banner was set to "offline"
  syncedAt: number | null;
};

type IssuesStore = {
  issues: IssueRecord[];
  offline: boolean;
  setOffline: (offline: boolean) => void;
  logIssue: (input: { category: IssueCategory; wardLabel: string; description: string; hasPhoto: boolean }) => void;
  resolveIssue: (id: string) => void;
  syncQueued: () => number; // returns count of records synced
};

let seq = 0;
function nextId() {
  seq += 1;
  return `issue-${seq}`;
}

export const useIssuesStore = create<IssuesStore>((set, get) => ({
  issues: [],
  offline: false,

  setOffline: (offline) => set({ offline }),

  logIssue: ({ category, wardLabel, description, hasPhoto }) =>
    set((s) => ({
      issues: [
        {
          id: nextId(),
          category,
          wardLabel,
          description,
          hasPhoto,
          status: s.offline ? "New" : "Routed",
          routedTo: routeFor(category),
          loggedAt: Date.now(),
          queuedOffline: s.offline,
          syncedAt: s.offline ? null : Date.now(),
        },
        ...s.issues,
      ],
    })),

  resolveIssue: (id) =>
    set((s) => ({
      issues: s.issues.map((i) => (i.id === id ? { ...i, status: "Resolved" } : i)),
    })),

  syncQueued: () => {
    const queued = get().issues.filter((i) => i.queuedOffline && i.syncedAt === null);
    set((s) => ({
      issues: s.issues.map((i) =>
        i.queuedOffline && i.syncedAt === null ? { ...i, status: "Routed", syncedAt: Date.now() } : i
      ),
    }));
    return queued.length;
  },
}));
