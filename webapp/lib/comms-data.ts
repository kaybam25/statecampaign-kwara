import { FIELD_AGENTS, getAgentsForLga } from "./mobilisation-data";
import { REAL_DATA_LGAS, KWARA_LGAS, getWardsInLGA } from "./data";
import { seededInt } from "./seed";

// --- Segmented Audience Selector -------------------------------------------
// Counts are real where the demo has real underlying data (field agent
// roster, ward counts); the Donors/Supporters/Media segments reuse the same
// illustrative reach figures already shown elsewhere in this module
// (~2.1M WhatsApp contacts, ~890K social followers) rather than inventing
// new unsourced numbers, and are labelled "sample" in the UI.

export type AudienceSegment = { id: string; label: string; count: number; note: string };

export const ROLE_SEGMENTS: AudienceSegment[] = [
  { id: "agents", label: "Field Agents", count: FIELD_AGENTS.length, note: "Full demo roster, all 16 Kwara State LGAs" },
  { id: "donors", label: "Donors", count: 1842, note: "Sample donor CRM segment" },
  { id: "supporters", label: "Supporters", count: 214_000, note: "Sample WhatsApp/social supporter list" },
  { id: "media", label: "Press & Media", count: 340, note: "Sample press contact list" },
];

export type GeoOption = { id: string; label: string; agentCount: number; wardCount: number };

export const GEO_OPTIONS: GeoOption[] = [
  { id: "all", label: "All 16 Kwara State LGAs", agentCount: FIELD_AGENTS.length, wardCount: REAL_DATA_LGAS.reduce((n, f) => n + getWardsInLGA(f.lgaId).length, 0) },
  ...REAL_DATA_LGAS.map((f) => ({
    id: f.lgaId,
    label: `${f.stateName} — ${f.lgaName}`,
    agentCount: getAgentsForLga(f.lgaId).length,
    wardCount: getWardsInLGA(f.lgaId).length,
  })),
];

// --- Local-Language Preview -------------------------------------------------
// Pre-authored draft translations for a small template library — a scripted
// mock, not a live translation API, so it stays free and works offline.
// These are demo drafts intended for local-reviewer sign-off before real
// use, same framing as the module's original placeholder copy.

export type Language = "hausa" | "yoruba" | "igbo" | "pidgin";

export const LANGUAGE_LABEL: Record<Language, string> = {
  hausa: "Hausa",
  yoruba: "Yorùbá",
  igbo: "Igbo",
  pidgin: "Pidgin",
};

export type MessageTemplate = {
  id: string;
  label: string;
  english: string;
  translations: Record<Language, string>;
};

export const MESSAGE_TEMPLATES: MessageTemplate[] = [
  {
    id: "gotv-reminder",
    label: "GOTV Reminder",
    english:
      "Today is Election Day! Your vote matters — visit your Polling Unit before 2:30pm accreditation closes. Bring your PVC. #YourVoiceYourVote",
    translations: {
      hausa: "Yau rana ce ta zaɓe! Muryar ku tana da mahimmanci — ku je wurin zaɓen ku kafin karfe 2:30 na yamma. Ku kawo PVC ɗin ku.",
      yoruba: "Òní ni ọjọ́ ìdìbò! Ìbò yín ṣe pàtàkì — ẹ lọ sí ibùdó ìdìbò yín kí ó tó di wákàtí 2:30 ọ̀sán. Ẹ mú PVC yín wá.",
      igbo: "Taa bụ ụbọchị ntuli aka! Olu gị dị mkpa — gaa n'ebe ntuli aka gị tupu elekere 2:30 nke ehihie akwụsị. Wetara PVC gị.",
      pidgin: "Today na Election Day! Your vote matter — go your Polling Unit before 2:30pm before dem close accreditation. Carry your PVC come.",
    },
  },
  {
    id: "rally-invite",
    label: "Rally / Town Hall Invitation",
    english:
      "You're invited: Community Town Hall this Saturday, 10am at [Venue]. Meet the candidate, ask your questions, hear the plan for your ward.",
    translations: {
      hausa: "An gayyace ku: Taron Al'umma ranar Asabar, karfe 10 na safe a [Wurin taron]. Ku hadu da dan takara, ku yi tambayoyinku.",
      yoruba: "A pè yín: Ìpàdé Àdúgbò ní ọjọ́ Sátidé, ago mẹ́wàá àárọ̀ ní [Ibi ìpàdé]. Ẹ wá pàdé olùdíje náà, ẹ béèrè ìbéèrè yín.",
      igbo: "A na-akpọ gị: Ọgbakọ Obodo na Satọde, elekere iri nke ụtụtụ na [Ebe emere]. Bịa zute onye ọsọ ntụli aka ahụ, jụọ ajụjụ gị.",
      pidgin: "We dey invite you: Community Meeting dis Saturday, 10am for [Venue]. Come meet the candidate, ask your question dem.",
    },
  },
  {
    id: "crisis-counter",
    label: "Crisis Counter-Narrative",
    english:
      "This is a confirmed FALSE report circulating about [topic]. The verified facts are: [facts]. Please do not share the false version — help us keep the record straight.",
    translations: {
      hausa: "Wannan labari ne na KARYA da ake yadawa game da [topic]. Gaskiyar magana ita ce: [facts]. Don Allah kada ku yada wannan labarin karya.",
      yoruba: "Èyí jẹ́ ìròyìn ÈKÉ tí ń kàn kiri nípa [topic]. Òtítọ́ ni pé: [facts]. Ẹ jọ̀wọ́ ẹ má ṣe pín ìròyìn èké yìí.",
      igbo: "Nke a bụ akụkọ ỤGHA na-agbasa gbasara [topic]. Eziokwu bụ: [facts]. Biko ekesala akụkọ ụgha a.",
      pidgin: "Dis na FALSE report wey dey circulate about [topic]. De correct fact na: [facts]. Abeg no share dis false one.",
    },
  },
];

// --- Scheduled Broadcast Queue ----------------------------------------------

export type BroadcastRecord = {
  id: string;
  label: string;
  channel: "WhatsApp" | "SMS" | "Social";
  status: "Sent" | "Scheduled";
  whenLabel: string;
  audienceCount: number;
  deliveredPct: number;
  openedPct: number;
};

const RAW_BROADCASTS: Omit<BroadcastRecord, "deliveredPct" | "openedPct">[] = [
  { id: "b1", label: "GOTV Reminder — All Agents", channel: "WhatsApp", status: "Sent", whenLabel: "Yesterday, 6:00am", audienceCount: FIELD_AGENTS.length },
  { id: "b2", label: "Town Hall Invite — Ilorin West Wards", channel: "SMS", status: "Sent", whenLabel: "3 days ago", audienceCount: 214_000 },
  { id: "b3", label: "Manifesto Highlights (Security)", channel: "Social", status: "Sent", whenLabel: "5 days ago", audienceCount: 890_000 },
  { id: "b4", label: "Crisis Counter-Narrative — BVAS Rumour", channel: "WhatsApp", status: "Sent", whenLabel: "6 days ago", audienceCount: 214_000 },
  { id: "b5", label: "Rally Invitation — Kano Municipal", channel: "SMS", status: "Scheduled", whenLabel: "Tomorrow, 8:00am", audienceCount: 340 },
  { id: "b6", label: "Weekly Supporter Digest", channel: "WhatsApp", status: "Scheduled", whenLabel: "Friday, 9:00am", audienceCount: 214_000 },
];

export const BROADCAST_QUEUE: BroadcastRecord[] = RAW_BROADCASTS.map((b) => ({
  ...b,
  deliveredPct: b.status === "Sent" ? seededInt(b.id + "delivered", 88, 99) : 0,
  openedPct: b.status === "Sent" ? seededInt(b.id + "opened", 34, 71) : 0,
}));

// --- Social Media Monitor Widget --------------------------------------------

export type SentimentTag = "Positive" | "Negative" | "Neutral";

export type SocialMention = {
  id: string;
  platform: "WhatsApp" | "Facebook" | "Twitter/X" | "TikTok" | "Instagram";
  snippet: string;
  sentiment: SentimentTag;
  whenLabel: string;
};

const RAW_MENTIONS: { platform: SocialMention["platform"]; snippet: string; sentiment: SentimentTag }[] = [
  { platform: "Twitter/X", snippet: "Good to finally see a campaign talking about actual road projects with photos, not just promises.", sentiment: "Positive" },
  { platform: "Facebook", snippet: "Can someone confirm if the town hall on Saturday is still happening? Saw conflicting flyers.", sentiment: "Neutral" },
  { platform: "WhatsApp", snippet: "Forwarded message claims results were pre-loaded before polls even opened — needs a response fast.", sentiment: "Negative" },
  { platform: "TikTok", snippet: "This clip of the candidate at the market yesterday is getting a lot of shares in Ilorin groups.", sentiment: "Positive" },
  { platform: "Twitter/X", snippet: "Why is security still the #1 complaint every single cycle? Want to see the actual plan, not slogans.", sentiment: "Neutral" },
  { platform: "Instagram", snippet: "Comment section under the manifesto post is mostly people asking about fuel price relief.", sentiment: "Neutral" },
  { platform: "Facebook", snippet: "Rumour going around that the achievements page numbers are inflated — worth a fact-check post.", sentiment: "Negative" },
  { platform: "WhatsApp", snippet: "Our ward group loved the Hausa version of the GOTV reminder, more people replied than usual.", sentiment: "Positive" },
  { platform: "Twitter/X", snippet: "Turnout talk trending again after the GOTV report numbers got shared — good moment to push our own data.", sentiment: "Positive" },
  { platform: "TikTok", snippet: "A duet video is mocking the last rally's turnout photo — angle made the crowd look smaller than it was.", sentiment: "Negative" },
  { platform: "Instagram", snippet: "Youth wing's canvassing photos from this week are getting solid engagement.", sentiment: "Positive" },
  { platform: "Facebook", snippet: "Local page asking why FCT hasn't had a visit yet this cycle.", sentiment: "Neutral" },
];

export const SOCIAL_MENTIONS: SocialMention[] = RAW_MENTIONS.map((m, i) => ({
  id: `mention-${i}`,
  ...m,
  whenLabel: `${seededInt(`mention-${i}-when`, 5, 340)} min ago`,
}));

// --- Crisis Counter-Narrative Launcher --------------------------------------
// A self-contained sample crisis scenario (this module page doesn't require
// the live Election Day simulation to be running). Visual language matches
// components/election-day/CrisisBanner.tsx.

export const SAMPLE_CRISIS = {
  headline: "Viral WhatsApp forward claims BVAS machines were pre-loaded with results in Kano before polls opened.",
  targetLabel: "crisis-counter" as const, // matches MESSAGE_TEMPLATES id
  responseTargetMinutes: 45,
};

// --- Example Simulated Blasts (Field Agents / Ward Supporters / Press & Media) ---
// Assumes the campaign holds a voter list of party members and potential
// supporters (per the pitch brief) plus the demo's existing field-agent
// roster and press contact list. Each card below is a ready-to-send example
// composed for that specific audience — clicking "Send Example Blast" adds
// it to the Broadcast Queue below so the flow reads end-to-end. Nothing is
// actually transmitted — same "UX mock" framing as the rest of this module.

export type BlastAudienceId = "field_agents" | "ward_supporters" | "press_media";

export type BlastAudience = {
  id: BlastAudienceId;
  label: string;
  channelLabel: string;
  description: string;
  subject?: string; // press releases only
  message: string; // may contain a {WARD} placeholder for ward_supporters
};

export const EXAMPLE_BLAST_AUDIENCES: BlastAudience[] = [
  {
    id: "field_agents",
    label: "Field Agents",
    channelLabel: "WhatsApp Broadcast List",
    description: "Operational message to every registered polling/canvassing agent — assignment + reporting reminder.",
    message:
      "Good morning, team. Today's assignment brief and PU list are in your agent app — please confirm receipt by 7am. Report officials' and materials' arrival as soon as you check in, and flag any issue immediately using the 5-category incident form. Thank you for representing us on the ground today.",
  },
  {
    id: "ward_supporters",
    label: "Supporters within a Ward",
    channelLabel: "WhatsApp/SMS — ward-level supporter list",
    description: "Localized GOTV message to the party-member/supporter list registered in a single ward — pick a ward below.",
    message:
      "Hello {WARD} family! Election Day is almost here. Your Polling Unit opens 8:30am and accreditation closes 2:30pm — please come out early and bring your PVC. Transport support is available from our ward coordinator if you need it. Every vote from {WARD} counts. See you there!",
  },
  {
    id: "press_media",
    label: "Press & Media",
    channelLabel: "Press distribution list (email + WhatsApp)",
    description: "Formal statement to the campaign's press contact list — media advisory tone, embargo-ready.",
    subject: "Media Advisory: Campaign Field Operations Update",
    message:
      "For immediate release. The campaign confirms full field-agent deployment across all monitored polling units, with real-time incident reporting and a dedicated crisis-response desk active throughout voting hours. Media inquiries and interview requests can be directed to the campaign press office. Full statement and supporting data available on request.",
  },
];

// All 193 real Kwara wards, grouped for the "Supporters within a ward" picker.
export type WardOption = { id: string; label: string; lgaName: string };

export const KWARA_WARD_OPTIONS: WardOption[] = KWARA_LGAS.flatMap((f) =>
  getWardsInLGA(f.lgaId).map((w) => ({ id: w.id, label: w.name, lgaName: f.lgaName }))
);

export function resolveBlastMessage(audience: BlastAudience, wardLabel?: string): string {
  if (audience.id !== "ward_supporters") return audience.message;
  return audience.message.replaceAll("{WARD}", wardLabel ?? "your ward");
}

// --- Social Media Message Generator (X / TikTok / Facebook / Instagram) ---
// A deterministic, offline templating pass over whatever the operator types
// into the input box — not a live AI/API call, same "scripted mock" ethos
// as the Local-Language Preview above. Each platform gets a shape that
// matches how that platform is actually used (length, hashtag density,
// tone), not just the same text four times.

export type SocialPlatform = "x" | "tiktok" | "facebook" | "instagram";

export const SOCIAL_PLATFORM_LABEL: Record<SocialPlatform, string> = {
  x: "X (Twitter)",
  tiktok: "TikTok",
  facebook: "Facebook",
  instagram: "Instagram",
};

const CAMPAIGN_HASHTAGS = ["#YourVoiceYourVote", "#CampaignOSDemo", "#GOTV2027"];

function truncateToWords(text: string, maxWords: number): string {
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) return text.trim();
  return words.slice(0, maxWords).join(" ") + "…";
}

function titleCase(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return trimmed;
  return trimmed[0].toUpperCase() + trimmed.slice(1);
}

export function generateSocialPost(topic: string, platform: SocialPlatform): string {
  const clean = titleCase(topic.trim());
  if (!clean) return "";

  switch (platform) {
    case "x": {
      // X: short, punchy, 1-2 hashtags, fits comfortably under 280 chars.
      const body = truncateToWords(clean, 28);
      return `${body} ${CAMPAIGN_HASHTAGS[0]} ${CAMPAIGN_HASHTAGS[1]}`;
    }
    case "tiktok": {
      // TikTok: casual hook + on-screen text cue + dense hashtag block.
      return [
        `🎥 On-screen text: "${truncateToWords(clean, 10)}"`,
        `Caption: ${truncateToWords(clean, 24)} 🇳🇬🔥`,
        `${CAMPAIGN_HASHTAGS.join(" ")} #FYP`,
      ].join("\n");
    }
    case "facebook": {
      // Facebook: fuller, more explanatory, a call to action, light on hashtags.
      return [
        clean.endsWith(".") ? clean : `${clean}.`,
        "",
        "Share this with your neighbours and ward WhatsApp groups — every conversation counts.",
        "",
        CAMPAIGN_HASHTAGS[0],
      ].join("\n");
    }
    case "instagram": {
      // Instagram: emoji-forward caption, line breaks, hashtag block at the end.
      return [
        `✨ ${clean} ✨`,
        "",
        "Swipe up in bio for the full story and how you can get involved. 🙌",
        "",
        CAMPAIGN_HASHTAGS.map((h) => h).join(" ") + " #Community #GOTV",
      ].join("\n");
    }
  }
}
