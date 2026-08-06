/**
 * Visibility / publication section of the Member Area profile editor:
 * current state, save/publish/unpublish controls and eligibility gate.
 * Consumed by MemberProfileEditor.tsx.
 */
import { Section } from "./shared";

export function VisibilitySection({
  t,
  visibility,
  publishBlocked,
  status,
  onSave,
}: {
  t: (key: string) => string;
  visibility: string;
  publishBlocked: string | null;
  status: "idle" | "saving" | "saved";
  onSave: (visibility?: "draft" | "published") => void;
}) {
  return (
    <Section title={t("member.publicationTitle")} note={t("member.publicationNote")}>
      <p className="mt-2 text-sm">
        {t("member.currentState")}: <strong>{t(`members.visibility.${visibility}`)}</strong>
      </p>
      {publishBlocked ? <p className="mt-2 text-xs text-destructive">{publishBlocked}</p> : null}
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onSave()}
          disabled={status === "saving"}
          className="rounded-full border border-border px-4 py-2 text-sm font-semibold hover:bg-secondary disabled:opacity-50"
        >
          {status === "saving" ? t("member.saving") : t("member.save")}
        </button>
        {visibility === "published" ? (
          <button
            type="button"
            onClick={() => onSave("draft")}
            disabled={status === "saving"}
            className="rounded-full border border-border px-4 py-2 text-sm font-semibold hover:bg-secondary disabled:opacity-50"
          >
            {t("member.unpublish")}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onSave("published")}
            disabled={status === "saving" || Boolean(publishBlocked)}
            className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-40"
          >
            {t("member.publish")}
          </button>
        )}
        {status === "saved" ? (
          <span className="self-center text-xs text-muted-foreground">{t("member.saved")}</span>
        ) : null}
      </div>
    </Section>
  );
}
