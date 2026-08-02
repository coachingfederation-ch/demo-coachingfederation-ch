/**
 * Community circle with a ring of member photos.
 *
 * The ring is a presentation of the *same* volunteers as the team page, so it
 * opens the shared `MemberModal` on activation. Display rules:
 *   - 0 members      -> the circle on its own
 *   - 1 to 12        -> everyone on the ring
 *   - more than 12   -> the first twelve alphabetically, plus an overflow chip
 *
 * Accessibility: every photo is a real focusable <button> in DOM order with an
 * aria-label carrying name and role; the zoom/label reveal is driven by
 * :hover *and* :focus-visible. Below `sm` (and therefore on most touch
 * devices) the circle is replaced by a plain avatar list, so nothing depends on
 * hovering.
 */
import { useState } from "react";
import { useI18n } from "@/i18n";
import { MemberModal } from "@/components/team/MemberModal";
import { ringPosition, splitRing } from "@/lib/communities";
import type { TeamMember } from "@/lib/team";

function Avatar({ member, className }: { member: TeamMember; className?: string }) {
  const [failed, setFailed] = useState(false);
  const showImage = !!member.imageUrl && !failed;
  return showImage ? (
    <img
      src={member.imageUrl!}
      alt=""
      loading="lazy"
      onError={() => setFailed(true)}
      className={"h-full w-full rounded-full object-cover " + (className ?? "")}
    />
  ) : (
    <span
      className={
        "grid h-full w-full place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary " +
        (className ?? "")
      }
    >
      {member.initials}
    </span>
  );
}

function roleFor(member: TeamMember, slug: string): string | null {
  const match = member.assignments.find((a) => a.projectSlug === slug);
  return match ? match.role : (member.assignments[0]?.role ?? null);
}

export function CommunityRing({
  name,
  slug,
  members,
}: {
  name: string;
  slug: string;
  members: TeamMember[];
}) {
  const { t } = useI18n();
  const [openId, setOpenId] = useState<string | null>(null);
  const { ring, overflow } = splitRing(members);
  const open = members.find((m) => m.memberId === openId) ?? null;

  const label = (member: TeamMember) => {
    const role = roleFor(member, slug);
    return role ? `${member.name} — ${role}` : member.name;
  };

  const hub = (
    <span className="grid h-full w-full place-items-center rounded-full bg-primary text-center text-primary-foreground">
      <span className="px-4 text-sm font-bold leading-tight sm:text-base">{name}</span>
    </span>
  );

  return (
    <>
      {/* Ring layout — pointer devices and roomy viewports. */}
      <div className="hidden sm:block">
        {/* No ring to draw: don't reserve a whole square of empty space. */}
        {ring.length === 0 ? (
          <div className="mx-auto aspect-square w-52">{hub}</div>
        ) : (
          <div className="relative mx-auto aspect-square w-full max-w-[30rem]">
            <div className="absolute left-1/2 top-1/2 aspect-square w-[50%] -translate-x-1/2 -translate-y-1/2">
              {hub}
            </div>
            {ring.map((member, index) => {
              const { x, y } = ringPosition(index, ring.length);
              return (
                <button
                  key={member.memberId}
                  type="button"
                  onClick={() => setOpenId(member.memberId)}
                  aria-label={label(member)}
                  className="group absolute h-[50px] w-[50px] -translate-x-1/2 -translate-y-1/2 rounded-full outline-none transition-transform duration-200 hover:z-20 hover:scale-[1.7] focus-visible:z-20 focus-visible:scale-[1.7] focus-visible:ring-4 focus-visible:ring-ring/40"
                  style={{ left: `${50 + x * 42}%`, top: `${50 + y * 42}%` }}
                >
                  <span className="block h-full w-full overflow-hidden rounded-full ring-2 ring-background">
                    <Avatar member={member} />
                  </span>
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 w-40 -translate-x-1/2 rounded-lg bg-foreground px-2 py-1.5 text-center text-[10px] font-semibold leading-tight text-background opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100"
                  >
                    {member.name}
                    {roleFor(member, slug) ? (
                      <span className="block font-normal opacity-80">{roleFor(member, slug)}</span>
                    ) : null}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Touch / small-screen fallback: a plain, tappable avatar list. */}
      <div className="sm:hidden">
        <div className="mx-auto aspect-square w-40">{hub}</div>
        {ring.length ? (
          <ul className="mt-6 space-y-2">
            {ring.map((member) => (
              <li key={member.memberId}>
                <button
                  type="button"
                  onClick={() => setOpenId(member.memberId)}
                  className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-3 text-left"
                >
                  <span className="h-10 w-10 shrink-0 overflow-hidden rounded-full">
                    <Avatar member={member} />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">{member.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {roleFor(member, slug)}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {overflow.length ? (
        <p className="mt-6 text-center text-xs text-muted-foreground">
          {t("communities.detail.andMore").replace("{count}", String(overflow.length))}
        </p>
      ) : null}

      {open ? <MemberModal member={open} onClose={() => setOpenId(null)} /> : null}
    </>
  );
}
