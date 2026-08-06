/**
 * Photo upload / signed-URL preview field for the Member Area profile
 * editor. Renders the current avatar (or initials fallback) plus the
 * upload/remove controls. Consumed by MemberProfileEditor.tsx.
 */
import type { RefObject } from "react";
import { Section } from "./shared";

function initialsOf(name: string | null): string {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  return (parts[0]![0]! + (parts[1]?.[0] ?? "")).toUpperCase();
}

export function ProfilePhotoField({
  t,
  fullName,
  imageUrl,
  imagePath,
  fileRef,
  onPickPhoto,
  onRemove,
}: {
  t: (key: string) => string;
  fullName: string | null;
  imageUrl: string | null;
  imagePath: string | null;
  fileRef: RefObject<HTMLInputElement | null>;
  onPickPhoto: (file: File | undefined) => void;
  onRemove: () => void;
}) {
  return (
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
            {initialsOf(fullName)}
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
              onClick={onRemove}
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
  );
}
