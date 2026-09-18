"use client";

import { useState } from "react";
import Link from "next/link";
import ModuleShell from "@/components/shared/ModuleShell";

type Guide = "agent" | "canvasser";

const AGENT_STEPS = [
  { title: "1. Get to your Polling Unit early", body: "Arrive at your assigned PU at least 30 minutes before accreditation is scheduled to start. Bring your agent ID and phone." },
  { title: "2. Check in on arrival", body: "Open the Field Agent App and tap “Check In Now (GPS)”. The app confirms your location against your assigned PU automatically — no manual address entry needed." },
  { title: "3. Confirm PU presence prompts promptly", body: "The app will prompt you at your set interval (default every 2 hours) to confirm you're present and alert. Tap “Verify Presence” as soon as you see the prompt — it takes two seconds." },
  { title: "4. Report officials and materials separately", body: "These often arrive at different times. Report each the moment it happens — don't wait for both. If officials arrive without materials, that delay is now visible to HQ instantly." },
  { title: "5. Report accreditation start time", body: "As soon as accreditation actually begins at your PU, tap “Report Accreditation Started”." },
  { title: "6. Escalate incidents immediately", body: "Pick the closest match from the 5 categories, add one line of detail if you can, and tap Report & Escalate. Don't wait to write a full account — speed matters more than detail in the moment." },
  { title: "7. Submit your final collation report", body: "At the close of voting, photograph the result sheet, enter the accredited-voter and votes-cast figures, and submit. This gives HQ an independent check before the official INEC upload." },
];

const CANVASSER_STEPS = [
  { title: "1. Review your ward's contact list", body: "Open the Canvasser App to see everyone you've previously canvassed in your ward, including who indicated they need a transport pickup." },
  { title: "2. Send the morning voting-awareness reminder first", body: "Reminds people which polling unit to go to and to bring their PVC. Send this as early as possible on election morning." },
  { title: "3. Send transport pickup notices", body: "This message goes only to contacts who requested transport help — the app filters the list automatically so you don't message people who don't need it." },
  { title: "4. Use GOTV pushes later in the day", body: "Mid-to-late morning, if turnout looks soft in your ward, send the GOTV push to everyone as a reminder that polls are still open." },
  { title: "5. Choose channels deliberately", body: "WhatsApp works well where data is available; SMS reaches feature-phone voters. Send both when you're unsure which a contact has." },
];

export default function TrainingPage() {
  const [tab, setTab] = useState<Guide>("agent");
  const steps = tab === "agent" ? AGENT_STEPS : CANVASSER_STEPS;

  return (
    <ModuleShell
      title="Mobilisation Module — Quick Training"
      subtitle="A short, plain-language walkthrough for polling agents and canvassers/transport coordinators. No login or manual required."
      color="#e85d2c"
    >
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setTab("agent")}
          className={`rounded-lg px-4 py-2 text-xs font-semibold ${tab === "agent" ? "bg-co-orange text-white" : "bg-white text-zinc-500 border border-zinc-200"}`}
        >
          Polling Agent Guide
        </button>
        <button
          onClick={() => setTab("canvasser")}
          className={`rounded-lg px-4 py-2 text-xs font-semibold ${tab === "canvasser" ? "bg-co-teal text-white" : "bg-white text-zinc-500 border border-zinc-200"}`}
        >
          Canvasser / Transport Coordinator Guide
        </button>
        <Link
          href={tab === "agent" ? "/mobilisation/agent" : "/mobilisation/canvasser"}
          className="ml-auto rounded-lg bg-co-navy px-4 py-2 text-xs font-semibold text-white hover:bg-co-navy/90"
        >
          Try it in the app &rarr;
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {steps.map((s) => (
          <div key={s.title} className="rounded-xl border border-zinc-200 bg-white p-4">
            <div className="mb-1 text-sm font-semibold text-co-navy">{s.title}</div>
            <div className="text-xs text-zinc-500">{s.body}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-co-amber/30 bg-co-amber/5 p-4 text-xs text-zinc-600">
        <strong className="text-co-navy">Tip for the pitch:</strong> this training screen is deliberately short — real field agents in rural wards often have low literacy or limited data; the production version adds voice-note guides and a Hausa/Yoruba/Igbo/Pidgin toggle (Phase 2).
      </div>
    </ModuleShell>
  );
}
