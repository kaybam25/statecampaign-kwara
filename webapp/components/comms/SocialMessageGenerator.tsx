"use client";

import { useState } from "react";
import { generateSocialPost, SOCIAL_PLATFORM_LABEL, type SocialPlatform } from "@/lib/comms-data";

const PLATFORMS: SocialPlatform[] = ["x", "tiktok", "facebook", "instagram"];

export default function SocialMessageGenerator() {
  const [topic, setTopic] = useState("");
  const [generated, setGenerated] = useState<Record<SocialPlatform, string> | null>(null);

  function handleGenerate() {
    if (!topic.trim()) return;
    const out = {} as Record<SocialPlatform, string>;
    for (const p of PLATFORMS) out[p] = generateSocialPost(topic, p);
    setGenerated(out);
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <h3 className="mb-1 text-sm font-semibold text-co-navy">Social Media Message Generator</h3>
      <p className="mb-3 text-[11px] text-zinc-400">
        Type a topic or key message — get platform-tailored example posts for X, TikTok, Facebook, and Instagram. Scripted templating, not a live AI call.
      </p>
      <div className="mb-3 flex flex-col gap-2 sm:flex-row">
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
          placeholder="e.g. New road resurfacing completed in Oke-Ira/Aguda ward"
          className="flex-1 rounded-lg border border-zinc-200 px-3 py-2 text-xs outline-none focus:border-co-teal"
        />
        <button
          onClick={handleGenerate}
          disabled={!topic.trim()}
          className="rounded-lg bg-co-teal px-4 py-2 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-40"
        >
          Generate 4 Platform Posts
        </button>
      </div>

      {generated && (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {PLATFORMS.map((p) => (
            <div key={p} className="rounded-lg border border-zinc-100 bg-zinc-50 p-2.5">
              <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-co-teal">{SOCIAL_PLATFORM_LABEL[p]}</div>
              <div className="whitespace-pre-line text-xs text-zinc-600">{generated[p]}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
