import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/cms/Shell";
import { MemberProfileEditor } from "@/components/cms/MemberProfileEditor";

export const Route = createFileRoute("/_member/my-profile")({
  head: () => ({
    meta: [
      { title: "My coach profile — ICF Switzerland" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MemberAreaPage,
});

function MemberAreaPage() {
  return (
    <Shell>
      <div className="mx-auto max-w-4xl px-10 py-10">
        <MemberProfileEditor />
      </div>
    </Shell>
  );
}
