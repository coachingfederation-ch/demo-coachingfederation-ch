/**
 * Team bio section of the Member Area profile editor, shown only to
 * operational-structure members (the `editor` grant). Consumed by
 * MemberProfileEditor.tsx.
 */
import { Section, TextArea } from "./shared";
import { RICH_TEXT_MAX, type PracticeDraft } from "./types";

export function TeamBioSection({
  t,
  practice,
  setPractice,
}: {
  t: (key: string) => string;
  practice: PracticeDraft;
  setPractice: (updater: (p: PracticeDraft) => PracticeDraft) => void;
}) {
  return (
    <Section title={t("member.teamBioTitle")} note={t("member.teamBioNote")}>
      <TextArea
        id="team-bio"
        label={t("member.teamBio")}
        value={practice.team_bio}
        onChange={(v) => setPractice((p) => ({ ...p, team_bio: v }))}
        max={RICH_TEXT_MAX}
        rows={7}
      />
    </Section>
  );
}
