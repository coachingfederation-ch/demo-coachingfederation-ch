/** Client-safe definitions for the coaching culture assessment. */

export const PRESSURES = [
  "retention",
  "leadership",
  "ai",
  "inclusion",
  "collaboration",
] as const;
export type Pressure = (typeof PRESSURES)[number];

export const DIMENSIONS = ["leadership", "capability", "access", "measurement"] as const;
export type Dimension = (typeof DIMENSIONS)[number];

export type Question = { id: string; dimension: Dimension };

/** Two questions per dimension, answered on a 1-5 scale. */
export const QUESTIONS: Question[] = [
  { id: "q1", dimension: "leadership" },
  { id: "q2", dimension: "leadership" },
  { id: "q3", dimension: "capability" },
  { id: "q4", dimension: "capability" },
  { id: "q5", dimension: "access" },
  { id: "q6", dimension: "access" },
  { id: "q7", dimension: "measurement" },
  { id: "q8", dimension: "measurement" },
];

export const SCALE = [1, 2, 3, 4, 5] as const;

export const BANDS = ["emerging", "developing", "established", "embedded"] as const;
export type Band = (typeof BANDS)[number];

export type Answers = Record<string, number>;

/** Percentage score per dimension (0-100). */
export function dimensionScores(answers: Answers): Record<Dimension, number> {
  const out = {} as Record<Dimension, number>;
  for (const d of DIMENSIONS) {
    const qs = QUESTIONS.filter((q) => q.dimension === d);
    const sum = qs.reduce((acc, q) => acc + (answers[q.id] ?? 0), 0);
    const max = qs.length * 5;
    out[d] = max === 0 ? 0 : Math.round((sum / max) * 100);
  }
  return out;
}

/** Overall percentage score (0-100). */
export function totalScore(answers: Answers): number {
  const sum = QUESTIONS.reduce((acc, q) => acc + (answers[q.id] ?? 0), 0);
  return Math.round((sum / (QUESTIONS.length * 5)) * 100);
}

export function bandFor(score: number): Band {
  if (score < 40) return "emerging";
  if (score < 60) return "developing";
  if (score < 80) return "established";
  return "embedded";
}