/**
 * External links section of the Member Area profile editor: an editable
 * list of website/LinkedIn/other links. Consumed by MemberProfileEditor.tsx.
 */
import { Section } from "./shared";
import { LINKS_MAX, type LinkDraft } from "./types";

export function LinksSection({
  t,
  links,
  setLinks,
}: {
  t: (key: string) => string;
  links: LinkDraft[];
  setLinks: (updater: (prev: LinkDraft[]) => LinkDraft[]) => void;
}) {
  return (
    <Section title={t("member.linksTitle")} note={t("member.linksNote")}>
      <div className="mt-3 space-y-2">
        {links.map((link, index) => (
          <div key={index} className="flex flex-wrap items-center gap-2">
            <select
              aria-label={t("member.linkType")}
              value={link.link_type}
              onChange={(e) =>
                setLinks((prev) =>
                  prev.map((l, i) =>
                    i === index
                      ? { ...l, link_type: e.target.value as LinkDraft["link_type"] }
                      : l,
                  ),
                )
              }
              className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm"
            >
              <option value="website">{t("member.linkWebsite")}</option>
              <option value="linkedin">{t("member.linkLinkedin")}</option>
              <option value="other">{t("member.linkOther")}</option>
            </select>
            <input
              aria-label={t("member.linkLabel")}
              placeholder={t("member.linkLabel")}
              value={link.label}
              onChange={(e) =>
                setLinks((prev) =>
                  prev.map((l, i) => (i === index ? { ...l, label: e.target.value } : l)),
                )
              }
              className="w-40 rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
            />
            <input
              aria-label={t("member.linkUrl")}
              placeholder="https://"
              value={link.url}
              onChange={(e) =>
                setLinks((prev) =>
                  prev.map((l, i) => (i === index ? { ...l, url: e.target.value } : l)),
                )
              }
              className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
            />
            <button
              type="button"
              onClick={() => setLinks((prev) => prev.filter((_, i) => i !== index))}
              className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold hover:bg-secondary"
            >
              {t("member.linkRemove")}
            </button>
          </div>
        ))}
      </div>
      {links.length < LINKS_MAX ? (
        <button
          type="button"
          onClick={() => setLinks((prev) => [...prev, { link_type: "website", label: "", url: "" }])}
          className="mt-3 rounded-full border border-border px-3 py-1.5 text-xs font-semibold hover:bg-secondary"
        >
          {t("member.linkAdd")}
        </button>
      ) : null}
    </Section>
  );
}
