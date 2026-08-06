/**
 * Services section of the Member Area profile editor: coaching/mentoring/
 * supervision availability toggles and the general availability select.
 * Consumed by MemberProfileEditor.tsx.
 */
import { vocabLabel, type CoachFinderVocabularies } from "@/lib/vocabularies";
import { Section } from "./shared";

export function ServicesSection({
  t,
  locale,
  vocab,
  services,
  setServices,
  availability,
  setAvailability,
  mentorAccredited,
  supervisionAccredited,
}: {
  t: (key: string) => string;
  locale: Parameters<typeof vocabLabel>[1];
  vocab: CoachFinderVocabularies | null;
  services: { coaching: boolean; mentoring: boolean; supervision: boolean };
  setServices: (updater: (s: { coaching: boolean; mentoring: boolean; supervision: boolean }) => {
    coaching: boolean;
    mentoring: boolean;
    supervision: boolean;
  }) => void;
  availability: string;
  setAvailability: (value: string) => void;
  mentorAccredited: boolean;
  supervisionAccredited: boolean;
}) {
  return (
    <Section title={t("member.servicesTitle")} note={t("member.servicesNote")}>
      <div className="mt-3 space-y-2 text-sm">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={services.coaching}
            onChange={(e) => setServices((s) => ({ ...s, coaching: e.target.checked }))}
          />
          {t("member.coachingAvailable")}
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={services.mentoring}
            disabled={!mentorAccredited}
            onChange={(e) => setServices((s) => ({ ...s, mentoring: e.target.checked }))}
          />
          {t("member.mentoringAvailable")}
          {!mentorAccredited ? (
            <span className="text-xs text-muted-foreground">
              ({t("member.needsAccreditation")})
            </span>
          ) : null}
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={services.supervision}
            disabled={!supervisionAccredited}
            onChange={(e) => setServices((s) => ({ ...s, supervision: e.target.checked }))}
          />
          {t("member.supervisionAvailable")}
          {!supervisionAccredited ? (
            <span className="text-xs text-muted-foreground">
              ({t("member.needsAccreditation")})
            </span>
          ) : null}
        </label>
      </div>
      <label
        className="mt-4 block text-xs font-semibold text-muted-foreground"
        htmlFor="availability"
      >
        {t("member.availability")}
      </label>
      <select
        id="availability"
        value={availability}
        onChange={(e) => setAvailability(e.target.value)}
        className="mt-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
      >
        <option value="">{t("member.availabilityNone")}</option>
        {(vocab?.cf_availability_labels ?? []).map((row) => (
          <option key={row.id} value={row.slug}>
            {vocabLabel(row, locale)}
          </option>
        ))}
      </select>
    </Section>
  );
}
