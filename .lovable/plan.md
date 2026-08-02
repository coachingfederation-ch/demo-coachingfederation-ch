# Local Communities: circular hub and single-member display

## What is wrong today

Checked against live data: `community-zurich` currently has exactly **one** assigned volunteer, and it is the only community with anyone assigned at all.

`splitRing()` in `src/lib/communities.ts` returns an empty ring whenever a community has 1 or 0 members (an intentional earlier rule: "a ring of one reads as an accident"). So on the community detail page and the About-page preview that single member is pushed into `overflow` and never drawn — you only see the shape. The `/communities` overview page uses a different component, a plain avatar stack, which is why the member shows up there.

The hub itself is drawn with `HEX_CLIP`, the hexagon clip-path shared with the team grid.

## Changes

1. **Circle instead of hexagon** — in `src/components/communities/CommunityRing.tsx`, replace the hexagon-clipped hub with a round hub and drop the now-unused `HEX_CLIP` import. The team page grid keeps its hexagons; this change is scoped to the community hub.
2. **Show every member, including a single one** — change `splitRing()` so members 1 through 12 all go on the ring and only 13 and beyond go to overflow. Remove the `<= 1` special case.
3. **Small-screen fallback** — same behaviour, so a one-member community renders one avatar row instead of nothing.
4. **Overflow note** — the "and N more" line currently also requires more than one member; it renders only when there is real overflow.

No data, schema, server-function, or i18n changes. Ring geometry, hover/focus labels, and the `MemberModal` behaviour stay as they are.

## Technical detail

- `src/lib/communities.ts`: `splitRing` becomes `{ ring: members.slice(0, RING_MAX_MEMBERS), overflow: members.slice(RING_MAX_MEMBERS) }` unconditionally.
- `src/components/communities/CommunityRing.tsx`: the hub span becomes `rounded-full`; the desktop hub box changes from `h-[46%] w-[52%]` to a square (`w-[50%] aspect-square`) so the circle is not an oval, and the mobile/no-ring hub becomes a square box too.
- With one member, the ring places that avatar at the 12 o'clock position around the circle.

## PR note

**Summary** — Makes the local-community hub a circle and fixes single-member communities rendering an empty ring on the About preview and the community detail page.

**Changes**
- UI: `CommunityRing` hub switched from hexagon clip-path to a circle.
- UI logic: `splitRing` no longer suppresses the ring for 0 or 1 members.

**Backend / Schema Changes** — None.

**Testing & Verification** — Check `/communities/community-zurich` (1 member) and the About page preview show the avatar on the circle, at desktop and mobile widths; check a 0-member community such as `community-basel` still renders just the circle plus the empty-state note; keyboard-focus an avatar to confirm the label reveal and modal still work.

**Risks & Rollback** — Low, presentation only; revert the two files.

**Follow-ups** — Team page hexagons are untouched; applying the circular language there too would be a separate change.