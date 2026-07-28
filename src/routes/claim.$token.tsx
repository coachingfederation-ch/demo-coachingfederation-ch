import { createFileRoute } from "@tanstack/react-router";
import { ClaimTokenPage } from "@/pages/MemberClaim";

export const Route = createFileRoute("/claim/$token")({
  head: () => ({
    meta: [
      { title: "Set your password — ICF Switzerland" },
      {
        name: "description",
        content: "Set the password for your ICF Switzerland Member Area account.",
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
