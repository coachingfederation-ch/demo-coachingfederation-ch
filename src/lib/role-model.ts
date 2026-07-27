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
export type AppRole = "admin" | "editor" | "contributor" | "member" | "user";

/** Roles that may reach the Insights CMS. */
export const STAFF_ROLES: AppRole[] = ["admin", "editor", "contributor"];

/** The only role an admin may grant or revoke through the application. */
export const MANAGED_ROLE = "editor" as const;

export type RoleSet = {
  roles: AppRole[];
  isAdmin: boolean;
  isEditor: boolean;
  isContributor: boolean;
  isStaff: boolean;
  isMember: boolean;
};

export const EMPTY_ROLES: RoleSet = {
  roles: [],
  isAdmin: false,
  isEditor: false,
  isContributor: false,
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
    isStaff: STAFF_ROLES.some(has),
    isMember: has("member"),
  };
}

/**
 * Where a signed-in account lands. Membership is the primary identity, so a
 * member who also holds `editor` goes to their profile; the CMS is the added
 * capability, reachable from the Member Area header.
 */
export function landingPath(roles: RoleSet): "/articles" | "/my-profile" | "/no-access" {
  if (roles.isMember) return "/my-profile";
  if (roles.isStaff) return "/articles";
  return "/no-access";
}
