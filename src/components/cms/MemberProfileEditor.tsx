/**
 * Member Area profile editor.
 *
 * Only local, member-owned fields are editable here. Imported ICF identity is
 * shown read-only, and accreditation flags are staff-maintained: the member
 * can declare *availability* for mentoring/supervision but never accreditation.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCms } from "@/i18n/cms";
import {
  fetchActiveVocabularies,
  vocabLabel,
  type CoachFinderVocabularies,
  type VocabRow,
} from "@/lib/vocabularies";
import { getMyMemberProfile, saveMyMemberProfile } from "@/lib/member-profile.functions";

export const PHOTO_BUCKET = "member-profile-images";
const PHOTO_SIZE = 512;
const DESCRIPTION_MAX = 3000;
const TAGLINE_MAX = 160;
const LINKS_MAX = 6;

type Profile = NonNullable<Awaited<ReturnType<typeof getMyMemberProfile>>>;
type LinkDraft = { link_type: "website" | "linkedin" | "other"; label: string; url: string };

function initialsOf(name: string | null): string {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  return (parts[0]![0]! + (parts[1]?.[0] ?? "")).toUpperCase();
}

/** Centre-crop to a square and downscale — one small JPEG per member. */
async function toSquareJpeg(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = PHOTO_SIZE;
  canvas.height = PHOTO_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  ctx.drawImage(
    bitmap,
    (bitmap.width - side) / 2,
    (bitmap.height - side) / 2,
    side,
    side,
    0,
    0,
    PHOTO_SIZE,
    PHOTO_SIZE,
  );
  return await new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Encode failed"))), "image/jpeg", 0.85),
  );
}

function Chips({
  rows,
  selected,
  onToggle,
  locale,
}: {
  rows: VocabRow[];
  selected: string[];
  onToggle: (id: string) => void;
  locale: Parameters<typeof vocabLabel>[1];
}) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {rows.map((row) => {
        const on = selected.includes(row.id);
        return (
          <button
            key={row.id}
            type="button"
            aria-pressed={on}
            onClick={() => onToggle(row.id)}
            className={
              on
                ? "rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground"
                : "rounded-full border border-border px-3 py-1 text-xs font-semibold hover:bg-secondary"
            }
          >
            {vocabLabel(row, locale)}
          </button>
        );
      })}
    </div>
  );
}

function Section({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="mt-5 rounded-2xl border border-border bg-card p-5">
      <h2 className="text-sm font-semibold">{title}</h2>
      {note ? <p className="mt-1 text-xs text-muted-foreground">{note}</p> : null}
      {children}
    </section>
  );
}

export function MemberProfileEditor() {
  const { t, locale } = useCms();
  const [data, setData] = useState<Profile | null | "unbound">(null);
  const [vocab, setVocab] = useState<CoachFinderVocabularies | null>(null);
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [availability, setAvailability] = useState("");
  const [services, setServices] = useState({ coaching: false, mentoring: false, supervision: false });
  const [facets, setFacets] = useState({
    region_ids: [] as string[],
    language_ids: [] as string[],
    format_ids: [] as string[],
    specialisation_ids: [] as string[],
  });
  const [links, setLinks] = useState<LinkDraft[]>([]);
  const [imagePath, setImagePath] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const apply = (next: Profile) => {
    setData(next);
    const p = next.profile;
    setTagline(p?.tagline ?? "");
    setDescription(p?.description ?? "");
    setAvailability(p?.availability_slug ?? "");
    setServices({
      coaching: p?.coaching_available ?? false,
      mentoring: p?.mentoring_available ?? false,
      supervision: p?.supervision_available ?? false,
    });
    setFacets({
      region_ids: p?.region_ids ?? [],
      language_ids: p?.language_ids ?? [],
      format_ids: p?.format_ids ?? [],
      specialisation_ids: p?.specialisation_ids ?? [],
    });
    setLinks(
      (p?.links ?? []).map((l) => ({ link_type: l.link_type, label: l.label ?? "", url: l.url })),
    );
    setImagePath(p?.profile_image_path ?? null);
  };

  useEffect(() => {
    void (async () => {
      try {
        const [profile, vocabularies] = await Promise.all([
          getMyMemberProfile(),
          fetchActiveVocabularies(),
        ]);
        setVocab(vocabularies);
        if (!profile) setData("unbound");
        else apply(profile as Profile);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    })();
  }, []);

  // Photos live in a private bucket; owners read them through a signed URL.
  useEffect(() => {
    let active = true;
    if (!imagePath) {
      setImageUrl(null);
      return;
    }
    void supabase.storage
      .from(PHOTO_BUCKET)
      .createSignedUrl(imagePath, 3600)
      .then(({ data: signed }) => {
        if (active) setImageUrl(signed?.signedUrl ?? null);
      });
    return () => {
      active = false;
    };
  }, [imagePath]);

  const profile = typeof data === "object" && data ? data.profile : null;
  const member = typeof data === "object" && data ? data.member : null;
  const eligible = typeof data === "object" && data ? data.eligibility.eligible : false;

  const publishBlocked = useMemo(() => {
    if (!eligible) return t("member.blockedIneligible");
    if (!facets.region_ids.length) return t("member.blockedNoRegion");
    return null;
  }, [eligible, facets.region_ids, t]);

  const toggle = (key: keyof typeof facets) => (id: string) =>
    setFacets((prev) => ({
      ...prev,
      [key]: prev[key].includes(id) ? prev[key].filter((v) => v !== id) : [...prev[key], id],
    }));

  const save = async (visibility?: "draft" | "published") => {
    setStatus("saving");
    setError(null);
    try {
      const next = await saveMyMemberProfile({
        data: {
          tagline: tagline || null,
          description: description || null,
          availability_slug: availability || null,
          coaching_available: services.coaching,
          mentoring_available: services.mentoring,
          supervision_available: services.supervision,
          profile_image_path: imagePath,
          ...facets,
          links: links
            .filter((l) => l.url.trim().startsWith("https://"))
            .map((l) => ({ link_type: l.link_type, label: l.label || null, url: l.url.trim() })),
          ...(visibility ? { visibility } : {}),
        },
      });
      apply(next as Profile);
      setStatus("saved");
    } catch (err) {
      setStatus("idle");
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const onPickPhoto = async (file: File | undefined) => {
    if (!file || !member) return;
    setError(null);
    try {
      if (file.size > 8 * 1024 * 1024) throw new Error(t("member.photoTooLarge"));
      const blob = await toSquareJpeg(file);
      const path = `${member.id}/avatar-${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from(PHOTO_BUCKET)
        .upload(path, blob, { contentType: "image/jpeg", upsert: true });
      if (uploadError) throw uploadError;
      if (imagePath) await supabase.storage.from(PHOTO_BUCKET).remove([imagePath]);
      setImagePath(path);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  if (error && !data) return <p className="text-sm text-destructive">{error}</p>;
  if (!data) return <p className="text-sm text-muted-foreground">{t("member.loading")}</p>;
  if (data === "unbound")
    return (
      <div className="rounded-2xl border border-border bg-card p-6">
        <h1 className="text-lg font-semibold">{t("member.unboundTitle")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("member.unboundBody")}</p>
      </div>
    );
  if (!profile)
    return (
      <div className="rounded-2xl border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground">{t("member.noProfile")}</p>
      </div>
    );

  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight">{t("member.title")}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{t("member.subtitle")}</p>
      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}

      <Section title={t("member.identityTitle")} note={t("member.identityNote")}>
        <dl className="mt-3 grid gap-1 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">{t("member.name")}</dt>
            <dd className="font-medium">{member?.full_name ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">{t("member.credential")}</dt>
            <dd className="font-medium">{member?.credential_slug ?? "—"}</dd>
          </div>
        </dl>
        <p className="mt-3 text-xs text-muted-foreground">
          {t(`member.eligibility.${data.eligibility.reason}`)}
        </p>
      </Section>

      <Section title={t("member.photoTitle")} note={t("member.photoNote")}>
        <div className="mt-3 flex items-center gap-4">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={t("member.photoAlt")}
              className="h-20 w-20 rounded-full object-cover"
            />
          ) : (
            <div className="grid h-20 w-20 place-items-center rounded-full bg-secondary text-lg font-semibold text-muted-foreground">
              {initialsOf(member?.full_name ?? null)}
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold hover:bg-secondary"
            >
              {t("member.photoUpload")}
            </button>
            {imagePath ? (
              <button
                type="button"
                onClick={() => setImagePath(null)}
                className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold hover:bg-secondary"
              >
                {t("member.photoRemove")}
              </button>
            ) : null}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => void onPickPhoto(e.target.files?.[0])}
            />
          </div>
        </div>
      </Section>

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
        <label className="mt-4 block text-xs font-semibold text-muted-foreground" htmlFor="description">
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
              disabled={!profile.mentor_accredited}
              onChange={(e) => setServices((s) => ({ ...s, mentoring: e.target.checked }))}
            />
            {t("member.mentoringAvailable")}
            {!profile.mentor_accredited ? (
              <span className="text-xs text-muted-foreground">({t("member.needsAccreditation")})</span>
            ) : null}
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={services.supervision}
              disabled={!profile.supervision_accredited}
              onChange={(e) => setServices((s) => ({ ...s, supervision: e.target.checked }))}
            />
            {t("member.supervisionAvailable")}
            {!profile.supervision_accredited ? (
              <span className="text-xs text-muted-foreground">({t("member.needsAccreditation")})</span>
            ) : null}
          </label>
        </div>
        <label className="mt-4 block text-xs font-semibold text-muted-foreground" htmlFor="availability">
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

      <Section title={t("member.regionsTitle")} note={t("member.regionsNote")}>
        <Chips
          rows={vocab?.cf_regions ?? []}
          selected={facets.region_ids}
          onToggle={toggle("region_ids")}
          locale={locale}
        />
      </Section>

      <Section title={t("member.languagesTitle")}>
        <Chips
          rows={vocab?.cf_languages ?? []}
          selected={facets.language_ids}
          onToggle={toggle("language_ids")}
          locale={locale}
        />
      </Section>

      <Section title={t("member.formatsTitle")}>
        <Chips
          rows={vocab?.cf_formats ?? []}
          selected={facets.format_ids}
          onToggle={toggle("format_ids")}
          locale={locale}
        />
      </Section>

      <Section title={t("member.specialisationsTitle")}>
        <Chips
          rows={vocab?.cf_specialisations ?? []}
          selected={facets.specialisation_ids}
          onToggle={toggle("specialisation_ids")}
          locale={locale}
        />
      </Section>

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
                      i === index ? { ...l, link_type: e.target.value as LinkDraft["link_type"] } : l,
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
                  setLinks((prev) => prev.map((l, i) => (i === index ? { ...l, label: e.target.value } : l)))
                }
                className="w-40 rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
              />
              <input
                aria-label={t("member.linkUrl")}
                placeholder="https://"
                value={link.url}
                onChange={(e) =>
                  setLinks((prev) => prev.map((l, i) => (i === index ? { ...l, url: e.target.value } : l)))
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

      <Section title={t("member.publicationTitle")} note={t("member.publicationNote")}>
        <p className="mt-2 text-sm">
          {t("member.currentState")}: <strong>{t(`members.visibility.${profile.visibility}`)}</strong>
        </p>
        {publishBlocked ? <p className="mt-2 text-xs text-destructive">{publishBlocked}</p> : null}
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void save()}
            disabled={status === "saving"}
            className="rounded-full border border-border px-4 py-2 text-sm font-semibold hover:bg-secondary disabled:opacity-50"
          >
            {status === "saving" ? t("member.saving") : t("member.save")}
          </button>
          {profile.visibility === "published" ? (
            <button
              type="button"
              onClick={() => void save("draft")}
              disabled={status === "saving"}
              className="rounded-full border border-border px-4 py-2 text-sm font-semibold hover:bg-secondary disabled:opacity-50"
            >
              {t("member.unpublish")}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void save("published")}
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
    </>
  );
}
