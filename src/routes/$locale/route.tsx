import { createFileRoute, notFound, Outlet } from "@tanstack/react-router";
import { isLocale } from "@/i18n/config";

export const Route = createFileRoute("/$locale")({
  beforeLoad: ({ params }) => {
    if (!isLocale(params.locale) || params.locale === "en") throw notFound();
  },
  component: () => <Outlet />,
});
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/$locale')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/$locale"!</div>
}
