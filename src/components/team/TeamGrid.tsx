/**
 * Public team page grid.
 *
 * Layout is a honeycomb: rows of hexagonal tiles that alternate between a full
 * and a short row and overlap vertically, so the arrangement stays organic at
 * every breakpoint instead of collapsing into a rectangular grid. The number of
 * tiles per row is derived from the viewport, so filtering simply re-chunks the
 * list and the comb reflows.
 */
import { useEffect, useMemo, useState } from "react";
import { X, Mail, Linkedin, ArrowUpRight } from "lucide-react";
import { LocaleLink, useI18n } from "@/i18n";
import type { TeamMember, TeamProject } from "@/lib/team";

const HEX_CLIP =
  "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)";

function useColumns(): number {
  const [cols, setCols] = useState(4);
  useEffect(() => {
    const compute = () => {
      const w = window.innerWidth;
      if (w < 480) return 2;
      if (w < 768) return 3;
      if (w < 1100) return 4;
      return 5;
    };
    const apply = () => setCols(compute());
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, []);
  return cols;
}

/** Alternating full / short rows — the shape that makes a comb read as a comb. */
function combRows<T>(items: T[], columns: number): T[][] {
  const rows: T[][] = [];
  let index = 0;
  let long = true;
  while (index < items.length) {
    const size = long || columns < 3 ? columns : columns - 1;
    rows.push(items.slice(index, index + size));
    index += size;
    long = !long;
  }
  return rows;
}

function HexTile({ member, onOpen }: { member: TeamMember; onOpen: () => void }) {
  const [failed, setFailed] = useState(false);
  const role = member.assignments[0];
  const showImage = !!member.imageUrl && !failed;
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group relative block w-[clamp(7rem,22vw,10.5rem)] shrink-0 focus:outline-none"
    >
      <span
        className="relative block aspect-square w-full overflow-hidden bg-primary/10 transition group-hover:brightness-95 group-focus-visible:ring-4 group-focus-visible:ring-ring/40"
        style={{ clipPath: HEX_CLIP }}
      >
        {showImage ? (
          <img
            src={member.imageUrl!}
            alt=""
            loading="lazy"
            onError={() => setFailed(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="grid h-full w-full place-items-center text-2xl font-bold text-primary">
            {member.initials}
          </span>
        )}
        <span className="absolute inset-0 flex flex-col justify-end bg-primary/85 px-3 pb-6 pt-4 text-center opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
          <span className="text-[13px] font-bold leading-tight text-primary-foreground">
            {member.name}
          </span>
          {role ? (
            <span className="mt-1 text-[11px] leading-tight text-primary-foreground/85">
              {role.role} · {role.project}
            </span>
          ) : null}
        </span>
      </span>
      <span className="sr-only">{member.name}</span>
    </button>
  );
}

function MemberModal({ member, onClose }: { member: TeamMember; onClose: () => void }) {
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
              to="/coach/$profileId"
              params={{ profileId: member.coachProfileId }}
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

export function TeamHoneycomb({ members }: { members: TeamMember[] }) {
  const columns = useColumns();
  const [openId, setOpenId] = useState<string | null>(null);
  const rows = useMemo(() => combRows(members, columns), [members, columns]);
  const open = members.find((m) => m.memberId === openId) ?? null;

  return (
    <>
      <div className="flex flex-col items-center">
        {rows.map((row, i) => (
          <div
            key={i}
            className={"flex justify-center gap-2 sm:gap-3 " + (i > 0 ? "-mt-[3.5%]" : "")}
          >
            {row.map((member) => (
              <HexTile
                key={member.memberId}
                member={member}
                onOpen={() => setOpenId(member.memberId)}
              />
            ))}
          </div>
        ))}
      </div>
      {open ? <MemberModal member={open} onClose={() => setOpenId(null)} /> : null}
    </>
  );
}

export function TeamFilters({
  projects,
  active,
  onChange,
}: {
  projects: TeamProject[];
  active: string | null;
  onChange: (slug: string | null) => void;
}) {
  const { t } = useI18n();
  const pill = (selected: boolean) =>
    "rounded-full px-4 py-1.5 text-xs font-semibold transition " +
    (selected
      ? "bg-primary text-primary-foreground"
      : "bg-secondary text-muted-foreground hover:text-foreground");
  return (
    <div className="flex flex-wrap justify-center gap-2" aria-label={t("team.filters.label")}>
      <button
        type="button"
        aria-pressed={active === null}
        onClick={() => onChange(null)}
        className={pill(active === null)}
      >
        {t("team.filters.all")}
      </button>
      {projects.map((p) => (
        <button
          key={p.slug}
          type="button"
          aria-pressed={active === p.slug}
          onClick={() => onChange(p.slug)}
          className={pill(active === p.slug)}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
