import { createFileRoute, Link } from "@tanstack/react-router";
import { useCms } from "@/i18n/cms";
import { MemberShell } from "@/components/member/MemberShell";
import { MemberProfileEditor } from "@/components/cms/MemberProfileEditor";

export const Route = createFileRoute("/_member/my-profile")({
  head: () => ({
    meta: [{ title: "My coach profile — The Switzerland Chapter of ICF" }, { name: "robots", content: "noindex" }],
  }),
  component: MemberAreaPage,
});

function MemberAreaPage() {
  const { t } = useCms();
  return (
    <MemberShell>
      <div className="mx-auto max-w-4xl px-10 py-10">
        <Link to="/member" className="mb-4 inline-flex items-center text-sm font-semibold text-primary hover:underline">
          {t("member.back")}
        </Link>
        <MemberProfileEditor />
      </div>
    </MemberShell>
  );
}
