/**
 * Shared member detail modal.
 *
 * Used by the public team honeycomb and by the community member ring, so both
 * surfaces present a volunteer identically: circular photo (initials
 * fallback), name, role list, volunteer bio and the opt-in contact channels.
 */
import { useEffect, useState } from "react";
import { X, Mail, Linkedin, ArrowUpRight } from "lucide-react";
import { LocaleLink, useI18n } from "@/i18n";
import type { TeamMember } from "@/lib/team";

export function MemberModal({ member, onClose }: { member: TeamMember; onClose: () => void }) {
  const { t } = useI18n();
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const showImage = !!member.imageUrl && !failed;
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-foreground/50 p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={member.name}
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[85dvh] w-full max-w-lg overflow-y-auto rounded-2xl bg-card p-8 text-foreground shadow-xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={t("team.modal.close")}
          className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex flex-col items-center text-center">
          <span className="grid h-28 w-28 place-items-center overflow-hidden rounded-full bg-primary/10 text-2xl font-bold text-primary">
            {showImage ? (
              <img
                src={member.imageUrl!}
                alt=""
                onError={() => setFailed(true)}
                className="h-full w-full object-cover"
              />
            ) : (
              member.initials
            )}
          </span>
          <h2 className="mt-4 text-xl font-bold tracking-tight">{member.name}</h2>
          <ul className="mt-2 space-y-1">
            {member.assignments.map((a) => (
              <li key={`${a.projectSlug}-${a.role}`} className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{a.role}</span> · {a.project}
              </li>
            ))}
          </ul>
        </div>

        {member.bio ? (
          <p className="mt-6 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
            {member.bio}
          </p>
        ) : null}

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          {member.email ? (
            <a
              href={`mailto:${member.email}`}
              aria-label={t("team.modal.email")}
              className="inline-flex h-10 items-center gap-2 rounded-full bg-secondary px-4 text-sm font-semibold text-foreground hover:bg-secondary/70"
            >
              <Mail className="h-4 w-4" /> {t("team.modal.email")}
            </a>
          ) : null}
          {member.linkedinUrl ? (
            <a
              href={member.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 items-center gap-2 rounded-full bg-secondary px-4 text-sm font-semibold text-foreground hover:bg-secondary/70"
            >
              <Linkedin className="h-4 w-4" /> {t("team.modal.linkedin")}
            </a>
          ) : null}
          {member.coachProfileId ? (
            <LocaleLink
              to={`/coach/${member.coachProfileId}`}
              className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              {t("team.modal.coachProfile")} <ArrowUpRight className="h-4 w-4" />
            </LocaleLink>
          ) : null}
        </div>
      </div>
    </div>
  );
}
