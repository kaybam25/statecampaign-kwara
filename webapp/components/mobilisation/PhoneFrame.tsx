"use client";

import type { ReactNode } from "react";

// A simple phone-shaped chrome so the agent/canvasser flows read visually
// as "the app on their phone" next to the desktop-style admin dashboard,
// without any real mobile build. Pure CSS, no external assets.
export default function PhoneFrame({ children, clock }: { children: ReactNode; clock?: string }) {
  return (
    <div className="mx-auto w-full max-w-sm">
      <div className="rounded-[2rem] border-4 border-zinc-800 bg-zinc-800 p-2 shadow-xl">
        <div className="flex items-center justify-between rounded-t-xl bg-zinc-900 px-4 py-1.5 text-[10px] font-medium text-white/70">
          <span>{clock ?? "--:--"}</span>
          <span>CampaignOS Field App</span>
        </div>
        <div className="max-h-[70vh] overflow-y-auto rounded-b-xl bg-zinc-50">{children}</div>
      </div>
    </div>
  );
}
