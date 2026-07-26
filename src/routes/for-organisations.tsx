import { createFileRoute } from "@tanstack/react-router";
import ForOrganisationsPage from "@/pages/ForOrganisations";
import { localeLinkTags, localeMeta } from "@/i18n";

export const Route = createFileRoute("/for-organisations")({
  head: () => ({
    meta: localeMeta("en", "/for-organisations", "organisations.meta.title", "organisations.meta.description"),
    links: localeLinkTags("/for-organisations", "en"),
  }),
  component: ForOrganisationsPage,
});
