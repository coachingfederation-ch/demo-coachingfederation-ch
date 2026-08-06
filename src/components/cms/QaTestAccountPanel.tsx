/**
 * Admin-only invite/provisioning dialog used by src/routes/_staff/roles.tsx.
 * Creates a pure-member QA account bound to one unclaimed imported record,
 * visible only while the roles integration is in TEST mode.
 */
import { useEffect, useState } from "react";
import { useCms } from "@/i18n/cms";
import {
  listQaProvisioningOptions,
  provisionQaTestAccount,
  searchQaCandidates,
} from "@/lib/roles.functions";

/**
 * Admin-only QA support control, visible only while the integration is in TEST
 * mode. It creates a pure-member account bound to one unclaimed imported
 * record — the same binding contract as the claim flow, with a login address
 * the operator controls. The password is shown once, in-session, and never
 * stored or emailed.
 */
export function QaTestAccountPanel({ onProvisioned }: { onProvisioned: () => void }) {
  const { t } = useCms();
  const [open, setOpen] = useState(false);
  const [testMode, setTestMode] = useState<boolean | null>(null);
  const [candidates, setCandidates] = useState<
    { memberId: string; name: string; cstRecno: string }[]
  >([]);
  const [query, setQuery] = useState("");
  const [memberId, setMemberId] = useState("");
  const [selectedName, setSelectedName] = useState("");
  const [remote, setRemote] = useState<{
    candidates: { memberId: string; name: string; cstRecno: string }[];
    truncated: boolean;
  } | null>(null);
  const [searching, setSearching] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    email: string;
    password: string;
    memberName: string;
  } | null>(null);

  useEffect(() => {
    if (!open || testMode !== null) return;
    void (async () => {
      try {
        const data = await listQaProvisioningOptions();
        setTestMode(data.testMode);
        setCandidates(data.candidates);
      } catch {
        setTestMode(false);
      }
    })();
  }, [open, testMode]);

  // The default list is capped, so anything typed is resolved server-side over
  // the full set of claimable members rather than filtered locally.
  useEffect(() => {
    const term = query.trim();
    if (!open || !testMode || term.length < 2) {
      setRemote(null);
      setSearching(false);
      return;
    }
    setSearching(true);
    const timer = setTimeout(() => {
      void (async () => {
        try {
          const res = await searchQaCandidates({ data: { query: term } });
          setRemote({ candidates: res.candidates, truncated: res.truncated });
        } catch {
          setRemote({ candidates: [], truncated: false });
        } finally {
          setSearching(false);
        }
      })();
    }, 250);
    return () => clearTimeout(timer);
  }, [query, open, testMode]);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await provisionQaTestAccount({ data: { memberId, email, password } });
      setResult({ email: res.email, password, memberName: res.memberName });
      setMemberId("");
      setSelectedName("");
      setQuery("");
      setRemote(null);
      setEmail("");
      setPassword("");
      setCandidates((prev) => prev.filter((c) => c.memberId !== memberId));
      onProvisioned();
    } catch (e) {
      setError(e instanceof Error ? e.message : t("roles.saveError"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-10 rounded-2xl border border-border bg-card p-5">
      <button
        onClick={() => setOpen((v) => !v)}
        className="text-lg font-semibold tracking-tight hover:underline"
      >
        {t("roles.qaTitle")}
      </button>
      <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{t("roles.qaIntro")}</p>

      {open ? (
        testMode === null ? (
          <p className="mt-4 text-sm text-muted-foreground">{t("roles.loading")}</p>
        ) : !testMode ? (
          <p className="mt-4 text-sm text-muted-foreground">{t("roles.qaLiveDisabled")}</p>
        ) : (
          <div className="mt-4 space-y-3">
            <div className="w-full max-w-md">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("roles.qaSearchMember")}
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm"
                aria-autocomplete="list"
                aria-controls="candidate-list"
              />
              <div
                id="candidate-list"
                className="mt-1 max-h-60 overflow-auto rounded-lg border border-border bg-card"
                role="listbox"
              >
                {(() => {
                  const q = query.trim().toLowerCase();
                  const searchingRemotely = q.length >= 2;
                  if (searchingRemotely && (searching || !remote)) {
                    return (
                      <div className="px-3 py-2 text-sm text-muted-foreground">
                        {t("roles.loading")}
                      </div>
                    );
                  }
                  const filtered = searchingRemotely
                    ? (remote?.candidates ?? [])
                    : q
                      ? candidates.filter(
                          (c) =>
                            c.name.toLowerCase().includes(q) ||
                            c.cstRecno.toLowerCase().includes(q),
                        )
                      : candidates;
                  if (filtered.length === 0) {
                    return (
                      <div className="px-3 py-2 text-sm text-muted-foreground">
                        {t("roles.qaNoMatches")}
                      </div>
                    );
                  }
                  const rows = filtered.map((c) => {
                    const selected = memberId === c.memberId;
                    return (
                      <button
                        key={c.memberId}
                        type="button"
                        role="option"
                        aria-selected={selected}
                        onClick={() => {
                          setMemberId(c.memberId);
                          setSelectedName(c.name);
                          setQuery(c.name);
                        }}
                        className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                          selected ? "bg-primary/10 text-primary" : "hover:bg-secondary/60"
                        }`}
                      >
                        {c.name} · ICF {c.cstRecno}
                      </button>
                    );
                  });
                  return (
                    <>
                      {rows}
                      {searchingRemotely && remote?.truncated ? (
                        <p className="px-3 py-2 text-xs text-muted-foreground">
                          {t("roles.qaMoreResults")}
                        </p>
                      ) : null}
                    </>
                  );
                })()}
              </div>
              {memberId ? (
                <div className="mt-2 flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">{t("roles.qaSelectedMember")}</span>
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 font-medium text-primary">
                    {selectedName || memberId}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setMemberId("");
                      setSelectedName("");
                      setQuery("");
                    }}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    ×
                  </button>
                </div>
              ) : null}
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("roles.qaEmailPlaceholder")}
              className="block w-full max-w-md rounded-lg border border-border bg-card px-3 py-2 text-sm"
            />
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("roles.qaPasswordPlaceholder")}
              className="block w-full max-w-md rounded-lg border border-border bg-card px-3 py-2 text-sm"
            />
            <button
              onClick={() => void submit()}
              disabled={busy || !memberId || !email || password.length < 10}
              className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-50"
            >
              {t("roles.qaCreate")}
            </button>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            {result ? (
              <div className="rounded-lg border border-border bg-secondary/50 px-4 py-3 text-sm">
                <p className="font-semibold">{t("roles.qaCreated")}</p>
                <p className="mt-1 text-muted-foreground">{result.memberName}</p>
                <p className="mt-1 font-mono text-xs">{result.email}</p>
                <p className="font-mono text-xs">{result.password}</p>
                <p className="mt-1 text-xs text-muted-foreground">{t("roles.qaCredentialsNote")}</p>
              </div>
            ) : null}
          </div>
        )
      ) : null}
    </div>
  );
}
