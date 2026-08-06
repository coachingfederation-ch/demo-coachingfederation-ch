/**
 * Testimonial section of the Member Area profile editor: a client quote
 * and its attribution. Consumed by MemberProfileEditor.tsx.
 */
import { Field, Section, TextArea } from "./shared";
import { NOTE_MAX, QUOTE_MAX, type PracticeDraft } from "./types";

export function TestimonialSection({
  t,
  practice,
  setPractice,
}: {
  t: (key: string) => string;
  practice: PracticeDraft;
  setPractice: (updater: (p: PracticeDraft) => PracticeDraft) => void;
}) {
  return (
    <Section title={t("member.testimonialTitle")} note={t("member.testimonialNote")}>
      <TextArea
        id="testimonial"
        label={t("member.testimonialQuote")}
        value={practice.testimonial_quote}
        onChange={(v) => setPractice((p) => ({ ...p, testimonial_quote: v }))}
        max={QUOTE_MAX}
        rows={4}
      />
      <Field
        id="testimonial-attribution"
        label={t("member.testimonialAttribution")}
        value={practice.testimonial_attribution}
        onChange={(v) => setPractice((p) => ({ ...p, testimonial_attribution: v }))}
        max={NOTE_MAX}
        placeholder={t("member.testimonialAttributionPlaceholder")}
      />
    </Section>
  );
}
