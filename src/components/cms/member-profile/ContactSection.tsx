/**
 * Contact section of the Member Area profile editor: booking url, response
 * time note and the "show email publicly" toggle. Consumed by
 * MemberProfileEditor.tsx.
 */
import { Field, Section } from "./shared";
import { NOTE_MAX, type PracticeDraft } from "./types";

export function ContactSection({
  t,
  practice,
  setPractice,
  email,
}: {
  t: (key: string) => string;
  practice: PracticeDraft;
  setPractice: (updater: (p: PracticeDraft) => PracticeDraft) => void;
  email: string | null | undefined;
}) {
  return (
    <Section title={t("member.contactTitle")} note={t("member.contactNote")}>
      <Field
        id="booking-url"
        label={t("member.bookingUrl")}
        value={practice.booking_url}
        onChange={(v) => setPractice((p) => ({ ...p, booking_url: v }))}
        max={250}
        placeholder="https://"
      />
      <Field
        id="response-time"
        label={t("member.responseTime")}
        value={practice.response_time_note}
        onChange={(v) => setPractice((p) => ({ ...p, response_time_note: v }))}
        max={NOTE_MAX}
        placeholder={t("member.responseTimePlaceholder")}
      />
      <label className="mt-4 flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          checked={practice.contact_email_public}
          onChange={(e) => setPractice((p) => ({ ...p, contact_email_public: e.target.checked }))}
          className="mt-1"
        />
        <span>
          {t("member.showEmail")}
          {email ? <span className="block text-xs text-muted-foreground">{email}</span> : null}
        </span>
      </label>
    </Section>
  );
}
