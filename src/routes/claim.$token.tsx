/**
 * Member account claim activation route (/claim/$token).
 * Exports: Route. Renders the password setup page for members who have
 * received a claim invitation token.
 */

import { createFileRoute } from "@tanstack/react-router";
import { ClaimTokenPage } from "@/pages/MemberClaim";

export const Route = createFileRoute("/claim/$token")({
  head: () => ({
    meta: [
      { title: "Set your password — The Switzerland Chapter of ICF" },
      {
        name: "description",
        content: "Set the password for your The Switzerland Chapter of ICF Member Area account.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ClaimToken,
});

function ClaimToken() {
  const { token } = Route.useParams();
  return <ClaimTokenPage token={token} />;
}
