import { createFileRoute } from "@tanstack/react-router";
import { ClaimRequestPage } from "@/pages/MemberClaim";

export const Route = createFileRoute("/claim/")({
  head: () => ({
    meta: [
      { title: "Member access — The Switzerland Chapter of ICF" },
      { name: "description", content: "Set up access to the The Switzerland Chapter of ICF Member Area." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ClaimRequestPage,
});
