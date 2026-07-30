import { createFileRoute } from "@tanstack/react-router";
import CommunityDetailPage from "@/pages/CommunityDetail";
import { localeLinkTags, localeMeta } from "@/i18n";

export const Route = createFileRoute("/communities/$slug")({
  head: ({ params }) => ({
    meta: localeMeta(
      "en",
      `/communities/${params.slug}`,
      "communities.meta.detailTitle",
      "communities.meta.detailDescription",
    ),
    links: localeLinkTags(`/communities/${params.slug}`, "en"),
  }),
  component: () => <CommunityDetailPage slug={Route.useParams().slug} />,
});
