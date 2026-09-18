"use client";

import { useState } from "react";
import { MESSAGE_TEMPLATES, LANGUAGE_LABEL, type Language } from "@/lib/comms-data";

const LANGUAGES = Object.keys(LANGUAGE_LABEL) as Language[];

export default function LanguagePreview() {
  const [templateId, setTemplateId] = useState(MESSAGE_TEMPLATES[0].id);
  const [generated, setGenerated] = useState(false);
  const template = MESSAGE_TEMPLATES.find((t) => t.id === templateId)!;

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <h3 className="mb-3 text-sm font-semibold text-co-navy">Local-Language Preview</h3>
      <select
        value={templateId}
        onChange={(e) => {
          setTemplateId(e.target.value);
          setGenerated(false);
        }}
        className="mb-3 w-full rounded-lg border border-zinc-200 px-2 py-1.5 text-xs outline-none focus:border-co-teal"
      >
        {MESSAGE_TEMPLATES.map((t) => (
          <option key={t.id} value={t.id}>
            {t.label}
          </option>
        ))}
      </select>
      <div className="mb-3 rounded-lg bg-zinc-50 p-3 text-xs text-zinc-600">{template.english}</div>

      {!generated ? (
        <button
          onClick={() => setGenerated(true)}
          className="w-full rounded-lg bg-co-teal px-4 py-2 text-xs font-semibold text-white hover:opacity-90"
        >
          Generate Hausa / Yorùbá / Igbo / Pidgin
        </button>
      ) : (
        <div className="space-y-2">
          {LANGUAGES.map((lang) => (
            <div key={lang} className="rounded-lg border border-zinc-100 bg-zinc-50 p-2.5">
              <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-co-teal">{LANGUAGE_LABEL[lang]}</div>
              <div className="text-xs text-zinc-600">{template.translations[lang]}</div>
            </div>
          ))}
          <p className="text-[10px] text-zinc-400">Draft translations for local-reviewer sign-off before real use — not a live translation call.</p>
        </div>
      )}
    </div>
  );
}
