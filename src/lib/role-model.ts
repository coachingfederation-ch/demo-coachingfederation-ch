/**
 * The single definition of the role vocabulary, shared by client code
 * (`roles.ts`), server-function guards (`authz.ts`) and — in spirit — the
 * `private.has_role / is_editor / is_staff` helpers in the database.
 *
 * Roles are ADDITIVE GRANTS, never a state machine. An account that holds both
 * `member` and `editor` is a member who can also work in the Insights CMS:
 * granting or revoking `editor` never touches `members.auth_user_id`, the
 * `member` grant, or Member Area access.
 *
 * `contributor` and `user` are dormant: their RLS policies still exist and are
 * still enforced, but nothing grants them and no UI surfaces them.
 *
 * Client-safe: no imports, no secrets, no I/O.
 */
export type AppRole = "admin" | "editor" | "contributor" | "organizer" | "member" | "user";

/** Roles that may reach the staff CMS. */
export const STAFF_ROLES: AppRole[] = ["admin", "editor", "contributor", "organizer"];

/** The roles an admin may grant or revoke through the application. */
export const MANAGED_ROLES = ["editor", "organizer"] as const;
export type ManagedRole = (typeof MANAGED_ROLES)[number];

/** @deprecated use MANAGED_ROLES. Kept so older call sites keep compiling. */
export const MANAGED_ROLE = "editor" as const;

export type RoleSet = {
  roles: AppRole[];
  isAdmin: boolean;
  isEditor: boolean;
  isContributor: boolean;
  isOrganizer: boolean;
  isStaff: boolean;
  isMember: boolean;
};

export const EMPTY_ROLES: RoleSet = {
  roles: [],
  isAdmin: false,
  isEditor: false,
  isContributor: false,
  isOrganizer: false,
  isStaff: false,
  isMember: false,
};

export function toRoleSet(roles: AppRole[]): RoleSet {
  const has = (r: AppRole) => roles.includes(r);
  return {
    roles,
    isAdmin: has("admin"),
    isEditor: has("admin") || has("editor"),
    isContributor: has("contributor"),
    // Editors and admins manage every event, so they are organizers too.
    isOrganizer: has("admin") || has("editor") || has("organizer"),
    isStaff: STAFF_ROLES.some(has),
    isMember: has("member"),
  };
}

/**
 * Exact grant test — deliberately WITHOUT the inheritance baked into
 * `isEditor` / `isOrganizer`. CMS navigation and route guards need to know
 * which role an account literally holds (an editor must not reach Events),
 * so they use this plus an explicit admin bypass.
 */
export function hasExactRole(roles: AppRole[], role: AppRole): boolean {
  return roles.includes(role);
}

/**
 * Where a signed-in account lands. Membership is the primary identity, so a
 * member who also holds `editor` goes to their profile; the CMS is the added
 * capability, reachable from the Member Area header.
 */
export function landingPath(
  roles: RoleSet,
): "/articles" | "/manage/events" | "/my-profile" | "/no-access" {
  if (roles.isMember) return "/my-profile";
  // An organizer-only staff account has no access to /articles — the route
  // guard would bounce them straight back out.
  if (roles.isStaff && hasExactRole(roles.roles, "organizer") && !hasExactRole(roles.roles, "editor") && !roles.isAdmin)
    return "/manage/events";
  if (roles.isStaff) return "/articles";
  return "/no-access";
}
