import { createFileRoute } from "@tanstack/react-router";
import { ClaimRequestPage } from "@/pages/MemberClaim";

export const Route = createFileRoute("/claim/")({
  head: () => ({
    meta: [
      { title: "Member access — ICF Switzerland" },
      { name: "description", content: "Set up access to the ICF Switzerland Member Area." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ClaimRequestPage,
});
