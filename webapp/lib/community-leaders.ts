import { REAL_DATA_LGAS } from "./data";
import { seededInt } from "./seed";

// Sample Influencer & Gatekeeper Map data — illustrative sample entries per
// real-data LGA (traditional ruler, religious leader, market leader),
// generated the same way the rest of the demo's non-INEC sample data
// is generated (seededInt off a stable id). Names are generic
// role-descriptive placeholders, not real people, per the project's
// "never present invented data as real" rule.

export type LeaderCategory = "traditional_ruler" | "religious_leader" | "market_women_leader" | "youth_leader";

export const LEADER_CATEGORY_LABEL: Record<LeaderCategory, string> = {
  traditional_ruler: "Traditional Ruler",
  religious_leader: "Religious Leader",
  market_women_leader: "Market Women Leader",
  youth_leader: "Youth Leader",
};

export type CommunityLeader = {
  id: string;
  lgaId: string;
  category: LeaderCategory;
  title: string;
  reachScore: number; // 1-100, seeded
  endorsementStatus: "Endorsed" | "Undecided" | "Not yet approached";
};

const CATEGORIES: LeaderCategory[] = ["traditional_ruler", "religious_leader", "market_women_leader", "youth_leader"];
const ENDORSEMENT: CommunityLeader["endorsementStatus"][] = ["Endorsed", "Undecided", "Not yet approached"];

const TITLE_BY_CATEGORY: Record<LeaderCategory, (lgaName: string) => string> = {
  traditional_ruler: (lga) => `Traditional Ruler — ${lga} Chieftaincy`,
  religious_leader: (lga) => `Senior Cleric — ${lga} Interfaith Council`,
  market_women_leader: (lga) => `Market Women Leader — ${lga} Central Market`,
  youth_leader: (lga) => `Youth Council President — ${lga}`,
};

export const COMMUNITY_LEADERS: CommunityLeader[] = REAL_DATA_LGAS.flatMap((f) =>
  CATEGORIES.map((cat, i) => {
    const seed = `${f.lgaId}-leader-${cat}`;
    return {
      id: seed,
      lgaId: f.lgaId,
      category: cat,
      title: TITLE_BY_CATEGORY[cat](f.lgaName),
      reachScore: seededInt(seed + "reach", 35, 96),
      endorsementStatus: ENDORSEMENT[seededInt(seed + "status", 0, ENDORSEMENT.length - 1)],
    };
  })
);

export function getLeadersForLga(lgaId: string): CommunityLeader[] {
  return COMMUNITY_LEADERS.filter((l) => l.lgaId === lgaId);
}
