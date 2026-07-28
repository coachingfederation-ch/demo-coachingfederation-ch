import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useCms } from "@/i18n/cms";

export const Route = createFileRoute("/no-access")({
  ssr: false,
  head: () => ({
    meta: [{ title: "No access — The Switzerland Chapter of ICF" }, { name: "robots", content: "noindex" }],
  }),
  component: NoAccessPage,
});

function NoAccessPage() {
  const { t } = useCms();
  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/auth";
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-[var(--shadow-soft)]">
        <h1 className="text-xl font-bold tracking-tight">{t("noAccess.title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("noAccess.body")}</p>
        <button
          onClick={signOut}
          className="mt-6 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-95"
        >
          {t("nav.signOut")}
        </button>
      </div>
    </div>
  );
}
