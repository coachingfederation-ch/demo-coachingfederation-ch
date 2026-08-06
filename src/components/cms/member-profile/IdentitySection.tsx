/**
 * Read-only identity section of the Member Area profile editor: name,
 * credential and member id imported from ICF, plus the eligibility note.
 * Consumed by MemberProfileEditor.tsx.
 */
import { Section } from "./shared";

export function IdentitySection({
  t,
  fullName,
  credentialSlug,
  cstRecno,
  eligibilityReason,
}: {
  t: (key: string) => string;
  fullName: string | null;
  credentialSlug: string | null;
  cstRecno: number | string | null;
  eligibilityReason: string;
}) {
  return (
    <Section title={t("member.identityTitle")} note={t("member.identityNote")}>
      <dl className="mt-3 grid gap-1 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted-foreground">{t("member.name")}</dt>
          <dd className="font-medium">{fullName ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{t("member.credential")}</dt>
          <dd className="font-medium">{credentialSlug ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{t("member.memberId")}</dt>
          <dd className="font-medium tabular-nums">{cstRecno ?? "—"}</dd>
        </div>
      </dl>
      <p className="mt-3 text-xs text-muted-foreground">
        {t(`member.eligibility.${eligibilityReason}`)}
      </p>
    </Section>
  );
}
