import { createFileRoute, notFound } from "@tanstack/react-router";
import CoachProfilePage, { CoachFallback } from "@/pages/CoachProfile";
import { getPublicCoachProfile } from "@/lib/directory.functions";
import { coachHead } from "@/lib/coach-head";

export const Route = createFileRoute("/coach/$profileId")({
  loader: async ({ params }) => {
    const profile = await getPublicCoachProfile({
      data: { profileId: params.profileId, locale: "en" },
    });
    if (!profile) throw notFound();
    return { profile };
  },
  head: ({ loaderData, params }) => coachHead(loaderData, "en", params.profileId),
  errorComponent: () => (
    <CoachFallback
      titleKey="directory.detail.notFoundTitle"
      bodyKey="directory.detail.notFoundBody"
    />
  ),
  notFoundComponent: () => (
    <CoachFallback
      titleKey="directory.detail.notFoundTitle"
      bodyKey="directory.detail.notFoundBody"
    />
  ),
  component: CoachDetail,
});

function CoachDetail() {
  const { profile } = Route.useLoaderData();
  return <CoachProfilePage profile={profile} />;
}
