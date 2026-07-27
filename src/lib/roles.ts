/**
 * Role model for the two authenticated areas.
 *
 * Access is decided by ROLES, and member data access is decided by the
 * explicit `members.auth_user_id` linkage — never by an email match. A single
 * account may legitimately hold both a staff role and a linked member record
 * (controlled support/testing), so the two areas are independent grants, not
 * mutually exclusive states.
 */
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

export type AppRole = "admin" | "editor" | "contributor" | "member" | "user";

export const STAFF_ROLES: AppRole[] = ["admin", "editor", "contributor"];

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

/** Reads the caller's own roles (RLS: users may only read their own rows). */
export async function fetchMyRoles(userId: string): Promise<RoleSet> {
  const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  if (error) return EMPTY_ROLES;
  return toRoleSet((data ?? []).map((row) => row.role as AppRole));
}

/** Client-side role state for nav/affordance gating only — never a boundary. */
export function useMyRoles(): { roles: RoleSet; loading: boolean } {
  const [roles, setRoles] = useState<RoleSet>(EMPTY_ROLES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(async ({ data }) => {
      const next = data.user ? await fetchMyRoles(data.user.id) : EMPTY_ROLES;
      if (!active) return;
      setRoles(next);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  return { roles, loading };
}