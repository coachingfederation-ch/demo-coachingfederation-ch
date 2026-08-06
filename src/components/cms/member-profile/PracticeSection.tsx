/**
 * Practice details section of the Member Area profile editor: approach,
 * qualifications, experience band, session length, availability note and
 * fees. Consumed by MemberProfileEditor.tsx.
 */
import { vocabLabel, type CoachFinderVocabularies } from "@/lib/vocabularies";
import { Field, Section, TextArea } from "./shared";
import { NOTE_MAX, RICH_TEXT_MAX, type PracticeDraft } from "./types";

export function PracticeSection({
  t,
  locale,
  vocab,
  practice,
  setPractice,
}: {
  t: (key: string) => string;
  locale: Parameters<typeof vocabLabel>[1];
  vocab: CoachFinderVocabularies | null;
  practice: PracticeDraft;
  setPractice: (updater: (p: PracticeDraft) => PracticeDraft) => void;
}) {
  return (
    <Section title={t("member.practiceTitle")} note={t("member.practiceNote")}>
      <TextArea
        id="approach"
        label={t("member.approach")}
        note={t("member.approachNote")}
        value={practice.approach}
        onChange={(v) => setPractice((p) => ({ ...p, approach: v }))}
        max={RICH_TEXT_MAX}
        rows={6}
      />
      <TextArea
        id="qualifications"
        label={t("member.qualifications")}
        note={t("member.qualificationsNote")}
        value={practice.qualifications}
        onChange={(v) => setPractice((p) => ({ ...p, qualifications: v }))}
        max={RICH_TEXT_MAX}
      />
      <div className="mt-4">
        <label className="block text-xs font-semibold text-muted-foreground" htmlFor="experience">
          {t("member.experienceBand")}
        </label>
        <select
          id="experience"
          value={practice.experience_band}
          onChange={(e) => setPractice((p) => ({ ...p, experience_band: e.target.value }))}
          className="mt-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
        >
          <option value="">{t("member.availabilityNone")}</option>
          {(vocab?.cf_experience_bands ?? []).map((band) => (
            <option key={band.id} value={band.slug}>
              {vocabLabel(band, locale)}
            </option>
          ))}
        </select>
      </div>
      <Field
        id="session-length"
        label={t("member.sessionLength")}
        value={practice.session_length_note}
        onChange={(v) => setPractice((p) => ({ ...p, session_length_note: v }))}
        max={NOTE_MAX}
        placeholder={t("member.sessionLengthPlaceholder")}
      />
      <Field
        id="availability-note"
        label={t("member.availabilityNote")}
        value={practice.availability_note}
        onChange={(v) => setPractice((p) => ({ ...p, availability_note: v }))}
        max={NOTE_MAX}
        placeholder={t("member.availabilityNotePlaceholder")}
      />
      <TextArea
        id="fees"
        label={t("member.fees")}
        note={t("member.feesNote")}
        value={practice.fees_note}
        onChange={(v) => setPractice((p) => ({ ...p, fees_note: v }))}
        max={RICH_TEXT_MAX}
        rows={4}
      />
    </Section>
  );
}
