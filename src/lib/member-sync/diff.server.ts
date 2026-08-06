/**
 * Member sync — diffing and change-kind logic.
 *
 * Pure field comparison between the ICF feed and the existing `members`
 * rows: which imported fields changed per record, and whether a feed row is
 * a first import ("created") or a change to an existing member ("updated").
 * No database access here.
 */
import type { NormalizedMember } from "../icf-soap.server";

export const IMPORTED_FIELDS: (keyof NormalizedMember)[] = [
  "first_name",
  "last_name",
  "full_name",
  "email",
  "phone",
  "city",
  "country",
  "organisation",
  "credential_slug",
  "member_type",
  "membership_join_date",
  "membership_expiration_date",
  "credential_awarded_on",
  "credential_expires_on",
];

/** Computes, for every feed member, which imported fields changed vs. the existing row. */
export function diffFeed(
  feed: NormalizedMember[],
  byRecno: Map<string, Record<string, unknown>>,
): {
  changedByRecno: Map<string, string[]>;
  createdRecnos: Set<string>;
  created: number;
  updated: number;
} {
  const changedByRecno = new Map<string, string[]>();
  const createdRecnos = new Set<string>();
  let created = 0;
  let updated = 0;
  for (const member of feed) {
    const existing = byRecno.get(member.cst_recno);
    const changed = IMPORTED_FIELDS.filter(
      (field) => !existing || (existing[field] ?? null) !== (member[field] ?? null),
    );
    changedByRecno.set(member.cst_recno, existing ? changed : [...IMPORTED_FIELDS]);
    if (existing) updated += changed.length ? 1 : 0;
    else {
      created += 1;
      createdRecnos.add(member.cst_recno);
    }
  }
  return { changedByRecno, createdRecnos, created, updated };
}
