/**
 * Admin setting for the LinkedIn company page every article post targets.
 * Exports: LinkedInPageSettings. Rendered on /_staff/integration.
 */
import { useEffect, useState } from "react";
import { Linkedin } from "lucide-react";
import { toast } from "sonner";
import { useCms } from "@/i18n/cms";
import { getLinkedInPage, saveLinkedInPage } from "@/lib/linkedin.functions";

export function LinkedInPageSettings() {
  const { t } = useCms();
  const [urn, setUrn] = useState("");
  const [name, setName] = useState("");
  const [connected, setConnected] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const data = await getLinkedInPage();
        setUrn(data.organizationUrn ?? "");
        setName(data.organizationName ?? "");
        setConnected(data.connected);
      } catch {
        /* non-admins never render this card; a read failure is not actionable */
      }
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const next = await saveLinkedInPage({ data: { organizationUrn: urn, organizationName: name } });
      setConnected(next.connected);
      toast.success(t("linkedin.pageSaved"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("linkedin.postFailed"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-1 flex items-center gap-2 font-display text-base font-semibold">
        <Linkedin className="h-4 w-4" />
        {t("linkedin.pageTitle")}
      </div>
      <p className="mb-4 text-sm text-muted-foreground">
        {connected ? t("linkedin.pageBody") : t("linkedin.notConnected")}
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="text-muted-foreground">{t("linkedin.pageUrn")}</span>
          <input
            value={urn}
            onChange={(e) => setUrn(e.target.value)}
            placeholder="urn:li:organization:1234567"
            className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/20"
          />
        </label>
        <label className="block text-sm">
          <span className="text-muted-foreground">{t("linkedin.pageName")}</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/20"
          />
        </label>
      </div>
      <button
        onClick={() => void save()}
        disabled={saving}
        className="mt-4 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
      >
        {t("linkedin.pageSave")}
      </button>
    </div>
  );
}
