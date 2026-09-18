"use client";

import { useState } from "react";
import ModuleShell from "@/components/shared/ModuleShell";
import AudienceSelector from "@/components/comms/AudienceSelector";
import LanguagePreview from "@/components/comms/LanguagePreview";
import BroadcastQueue from "@/components/comms/BroadcastQueue";
import SocialMonitor from "@/components/comms/SocialMonitor";
import CrisisLauncher from "@/components/comms/CrisisLauncher";
import ExampleBlasts, { type SentBlast } from "@/components/comms/ExampleBlasts";
import SocialMessageGenerator from "@/components/comms/SocialMessageGenerator";
import { MESSAGE_TEMPLATES, GEO_OPTIONS } from "@/lib/comms-data";

const CHANNELS = [
  { id: "whatsapp", label: "WhatsApp Broadcast", reach: "~2.1M contacts" },
  { id: "sms", label: "SMS / USSD", reach: "43% of electorate without smartphones" },
  { id: "social", label: "Social Media (FB/X/IG/TikTok)", reach: "~890K followers" },
];

const INITIAL_CHANNELS = ["whatsapp"];
const INITIAL_ROLES = ["agents"];

export default function CommsPage() {
  const [selectedChannels, setSelectedChannels] = useState<string[]>(INITIAL_CHANNELS);
  const [selectedRoles, setSelectedRoles] = useState<string[]>(INITIAL_ROLES);
  const [geoId, setGeoId] = useState(GEO_OPTIONS[0].id);
  const [message, setMessage] = useState("");
  const [exampleBlasts, setExampleBlasts] = useState<SentBlast[]>([]);
  // Bumped on Reset — remounts every stateful child (LanguagePreview,
  // CrisisLauncher, ExampleBlasts, SocialMessageGenerator) so their own
  // internal state clears too, not just this page's state.
  const [resetKey, setResetKey] = useState(0);

  const toggleChannel = (id: string) => setSelectedChannels((s) => (s.includes(id) ? s.filter((c) => c !== id) : [...s, id]));
  const toggleRole = (id: string) => setSelectedRoles((s) => (s.includes(id) ? s.filter((r) => r !== id) : [...s, id]));

  function handleCrisisDraft() {
    const template = MESSAGE_TEMPLATES.find((t) => t.id === "crisis-counter")!;
    setMessage(template.english);
    setSelectedChannels(["whatsapp", "sms", "social"]);
  }

  function handleReset() {
    setSelectedChannels(INITIAL_CHANNELS);
    setSelectedRoles(INITIAL_ROLES);
    setGeoId(GEO_OPTIONS[0].id);
    setMessage("");
    setExampleBlasts([]);
    setResetKey((k) => k + 1);
  }

  return (
    <ModuleShell
      title="Communications Centre"
      subtitle="WhatsApp/SMS/social broadcast composer, segmented audiences, local-language drafts, example blasts, and crisis response. This is a UX mock — no messages are actually sent."
      color="#0f766e"
      actions={
        <button
          onClick={handleReset}
          className="shrink-0 rounded-lg bg-white/15 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/25"
          title="Clear the composer, audience selection, example blasts, and reset every panel in this module"
        >
          Reset
        </button>
      }
    >
      <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-zinc-200 bg-white p-5">
          <h3 className="mb-3 text-sm font-semibold text-co-navy">Compose broadcast</h3>
          <div className="mb-3 flex flex-wrap gap-2">
            {CHANNELS.map((c) => (
              <button
                key={c.id}
                onClick={() => toggleChannel(c.id)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  selectedChannels.includes(c.id) ? "border-co-teal bg-co-teal/10 text-co-teal" : "border-zinc-200 text-zinc-500 hover:bg-zinc-50"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Draft your message in English — use the Local-Language Preview panel to generate Hausa/Yoruba/Igbo/Pidgin versions for review..."
            className="h-32 w-full resize-none rounded-lg border border-zinc-200 p-3 text-sm outline-none focus:border-co-teal"
          />
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-zinc-400">
              {selectedChannels.length
                ? CHANNELS.filter((c) => selectedChannels.includes(c.id)).map((c) => c.reach).join(" + ")
                : "select a channel"}
            </span>
            <button className="rounded-lg bg-co-teal px-4 py-2 text-xs font-semibold text-white opacity-60" disabled title="Demo only — sending is disabled">
              Schedule Broadcast (demo — disabled)
            </button>
          </div>
        </div>
        <AudienceSelector selectedRoles={selectedRoles} toggleRole={toggleRole} geoId={geoId} setGeoId={setGeoId} />
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ExampleBlasts key={`blasts-${resetKey}`} onSend={(b) => setExampleBlasts((prev) => [...prev, b])} />
        <SocialMessageGenerator key={`social-gen-${resetKey}`} />
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <LanguagePreview key={`lang-${resetKey}`} />
        <CrisisLauncher key={`crisis-${resetKey}`} onDraft={handleCrisisDraft} />
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <BroadcastQueue exampleBlasts={exampleBlasts} />
        <SocialMonitor />
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-5">
        <h3 className="mb-3 text-sm font-semibold text-co-navy">Delivery channels (roadmap)</h3>
        <ul className="space-y-3 text-xs text-zinc-500">
          <li>📱 <strong className="text-co-navy">WhatsApp Broadcast Manager</strong> — segmented lists, video/audio/document support, delivery tracking</li>
          <li>💬 <strong className="text-co-navy">SMS Blast Engine</strong> — Termii/Infobip integration, USSD fallback for feature phones</li>
          <li>📢 <strong className="text-co-navy">Social Media Command Centre</strong> — schedule across FB/X/IG/TikTok, monitor mentions in real time</li>
          <li>📰 <strong className="text-co-navy">Press Release Generator</strong> — AI-assisted drafting in English + local languages</li>
        </ul>
      </div>
    </ModuleShell>
  );
}
