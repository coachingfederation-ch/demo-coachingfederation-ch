/**
 * Coach directory mock data.
 *
 * The shape deliberately separates the two sources of truth:
 *  - `icf`   — fields imported from the ICF Global API (system of record,
 *              read-only on this portal).
 *  - `local` — fields the member manages here on the ICF Switzerland portal.
 *
 * The UI does not surface the distinction yet, but the boundary is explicit so
 * a real ICF Global integration can drop in without reshaping the frontend.
 */

export type CredentialLevel = "ACC" | "PCC" | "MCC";
export type CoachingFormat = "in-person" | "online";
export type CoachLanguage = "de" | "fr" | "it" | "en";

/** Imported from ICF Global — never edited on this portal. */
export type IcfGlobalProfile = {
  fullName: string;
  photoUrl?: string;
  credential: CredentialLevel;
  credentialSince: number;
  city: string;
  canton: string;
  languages: CoachLanguage[];
  specializations: string[];
  formats: CoachingFormat[];
  bioSnippet: string;
  memberSince: number;
};

/** Managed by the member on this portal. */
export type LocalCoachProfile = {
  featured: boolean;
  customHeadline?: string;
  customDescription?: string;
  acceptingClients: boolean;
  websiteUrl?: string;
};

export type Coach = {
  id: string;
  icf: IcfGlobalProfile;
  local: LocalCoachProfile;
};

export const SPECIALIZATION_KEYS = [
  "leadership",
  "career",
  "team",
  "executive",
  "transition",
  "wellbeing",
  "systemic",
  "diversity",
] as const;

export type SpecializationKey = (typeof SPECIALIZATION_KEYS)[number];

export const COACHES: Coach[] = [
  {
    id: "icf-ch-10421",
    icf: {
      fullName: "Nadia Berger",
      credential: "PCC",
      credentialSince: 2019,
      city: "Basel",
      canton: "BS",
      languages: ["de", "en"],
      specializations: ["leadership", "team", "wellbeing"],
      formats: ["in-person", "online"],
      bioSnippet:
        "Twelve years in pharma HR before turning to coaching. Works with first-time leaders finding their own voice.",
      memberSince: 2018,
    },
    local: {
      featured: true,
      customHeadline: "Leadership transitions in life-science organisations",
      acceptingClients: true,
    },
  },
  {
    id: "icf-ch-10877",
    icf: {
      fullName: "Marc Dubois",
      credential: "ACC",
      credentialSince: 2023,
      city: "Genève",
      canton: "GE",
      languages: ["fr", "en"],
      specializations: ["career", "transition"],
      formats: ["in-person", "online"],
      bioSnippet:
        "Coaches professionals navigating career pivots in international organisations and NGOs.",
      memberSince: 2022,
    },
    local: {
      featured: false,
      acceptingClients: true,
      websiteUrl: "https://example.org/marc-dubois",
    },
  },
  {
    id: "icf-ch-10093",
    icf: {
      fullName: "Giulia Ferrari",
      credential: "MCC",
      credentialSince: 2014,
      city: "Lugano",
      canton: "TI",
      languages: ["it", "en", "de"],
      specializations: ["executive", "systemic", "team"],
      formats: ["in-person", "online"],
      bioSnippet:
        "Executive and team coach, mentor coach for ICF credential candidates across Ticino and northern Italy.",
      memberSince: 2011,
    },
    local: {
      featured: true,
      customDescription:
        "Also hosts quarterly peer-coaching circles for the Svizzera Italiana community.",
      acceptingClients: false,
    },
  },
  {
    id: "icf-ch-11250",
    icf: {
      fullName: "Stefan Huber",
      credential: "PCC",
      credentialSince: 2020,
      city: "Zürich",
      canton: "ZH",
      languages: ["de", "en"],
      specializations: ["executive", "leadership", "transition"],
      formats: ["in-person", "online"],
      bioSnippet:
        "Former banking COO. Partners with senior leaders on strategic clarity and stakeholder influence.",
      memberSince: 2017,
    },
    local: {
      featured: false,
      acceptingClients: true,
    },
  },
  {
    id: "icf-ch-11604",
    icf: {
      fullName: "Claire Moreau",
      credential: "PCC",
      credentialSince: 2018,
      city: "Lausanne",
      canton: "VD",
      languages: ["fr", "en", "de"],
      specializations: ["diversity", "wellbeing", "career"],
      formats: ["in-person", "online"],
      bioSnippet:
        "Focuses on inclusive leadership and sustainable performance for teams working across cultures.",
      memberSince: 2016,
    },
    local: {
      featured: false,
      customHeadline: "Inclusive leadership, without the burnout",
      acceptingClients: true,
    },
  },
  {
    id: "icf-ch-11982",
    icf: {
      fullName: "Andrea Kunz",
      credential: "ACC",
      credentialSince: 2024,
      city: "Bern",
      canton: "BE",
      languages: ["de", "fr"],
      specializations: ["career", "wellbeing"],
      formats: ["in-person"],
      bioSnippet:
        "Supports public-sector professionals through role changes, returns to work and reorganisations.",
      memberSince: 2023,
    },
    local: {
      featured: false,
      acceptingClients: false,
    },
  },
  {
    id: "icf-ch-12310",
    icf: {
      fullName: "Ravi Menon",
      credential: "MCC",
      credentialSince: 2013,
      city: "Online",
      canton: "ZG",
      languages: ["en", "de"],
      specializations: ["systemic", "team", "executive", "diversity"],
      formats: ["online"],
      bioSnippet:
        "Works exclusively online with distributed leadership teams across Europe, the Gulf and Asia.",
      memberSince: 2010,
    },
    local: {
      featured: true,
      customDescription: "Sessions in 60- and 90-minute formats, evenings available.",
      acceptingClients: true,
      websiteUrl: "https://example.org/ravi-menon",
    },
  },
];

export const CREDENTIAL_LEVELS: CredentialLevel[] = ["ACC", "PCC", "MCC"];
export const COACHING_FORMATS: CoachingFormat[] = ["in-person", "online"];

export const CANTONS = Array.from(new Set(COACHES.map((c) => c.icf.canton))).sort();
export const COACH_LANGUAGES: CoachLanguage[] = ["de", "fr", "it", "en"];

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}