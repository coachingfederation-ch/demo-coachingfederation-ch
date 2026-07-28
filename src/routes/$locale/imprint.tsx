import { createFileRoute } from "@tanstack/react-router";
import ImprintPage from "@/pages/Imprint";
import { localeLinkTags, localeMeta } from "@/i18n";
import type { Locale } from "@/i18n/config";

export const Route = createFileRoute("/$locale/imprint")({
  head: ({ params }) => {
    const locale = params.locale as Locale;
    return {
      meta: localeMeta(
        locale,
        "/imprint",
        "legal.imprint.meta.title",
        "legal.imprint.meta.description",
      ),
      links: localeLinkTags("/imprint", locale),
    };
  },
  component: ImprintPage,
});
