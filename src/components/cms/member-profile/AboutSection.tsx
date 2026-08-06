/**
 * "About" section of the Member Area profile editor: tagline and long
 * description fields. Consumed by MemberProfileEditor.tsx.
 */
import { Section } from "./shared";
import { DESCRIPTION_MAX, TAGLINE_MAX } from "./types";

export function AboutSection({
  t,
  tagline,
  setTagline,
  description,
  setDescription,
}: {
  t: (key: string) => string;
  tagline: string;
  setTagline: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
}) {
  return (
    <Section title={t("member.aboutTitle")}>
      <label className="mt-3 block text-xs font-semibold text-muted-foreground" htmlFor="tagline">
        {t("member.tagline")}
      </label>
      <input
        id="tagline"
        value={tagline}
        maxLength={TAGLINE_MAX}
        onChange={(e) => setTagline(e.target.value)}
        className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
      />
      <label
        className="mt-4 block text-xs font-semibold text-muted-foreground"
        htmlFor="description"
      >
        {t("member.description")}
      </label>
      <textarea
        id="description"
        value={description}
        maxLength={DESCRIPTION_MAX}
        rows={8}
        onChange={(e) => setDescription(e.target.value)}
        className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
      />
      <p className="mt-1 text-xs text-muted-foreground">
        {description.length} / {DESCRIPTION_MAX}
      </p>
    </Section>
  );
}
