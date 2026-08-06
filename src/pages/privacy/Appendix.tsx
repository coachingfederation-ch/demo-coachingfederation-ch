/**
 * Appendix section of the Privacy page: internal items to confirm before publishing.
 * Exports: AppendixSection. Rendered by src/pages/Privacy.tsx inside the Privacy Policy section.
 */
import { ExternalLink } from "./shared";

export function AppendixSection() {
  return (
    <>
        <section className="space-y-8">
          <h2 className="text-2xl font-bold tracking-tight">
            Appendix: Items to confirm before publishing
          </h2>
          <p className="text-foreground/80">
            The following items are marked with [Confirm:] placeholders throughout this document.
            They must be verified and completed before the privacy policy is published:
          </p>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold tracking-tight">A. Organisation and governance</h3>
            <ol className="list-decimal space-y-2 pl-5 text-foreground/80">
              <li>
                <strong>Data Protection Adviser</strong> — Has The Switzerland Chapter of ICF
                designated a Data Protection Adviser (Datenschutzberater) under Art. 14 DPO? If so,
                their name and contact should be in Section 1.
              </li>
              <li>
                <strong>Board contact</strong> — Should a named board member (e.g., President) be
                listed as responsible for content in the Imprint? Currently, &quot;The Board&quot;
                is used generically.
              </li>
              <li>
                <strong>VAT status</strong> — The UID extract shows no VAT registration. This is
                expected for a non-commercial association. No action needed unless VAT registration
                is planned.
              </li>
            </ol>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold tracking-tight">
              B. Technical services and providers
            </h3>
            <ol className="list-decimal space-y-2 pl-5 text-foreground/80">
              <li>
                <strong>Supabase data residency</strong> — Confirmed: Europe (Ireland). The Lovable
                Cloud project is configured to store data in the EU (Ireland) region. The EU/EEA is
                recognised as having an adequate level of data protection under Swiss law, so no
                additional transfer safeguards (SCCs) are required for the Supabase storage itself.
                Note: Lovable Labs Inc. (US) still has processor access to this data; the Lovable
                processor relationship is covered by SCCs and the Swiss Addendum.
              </li>
              <li>
                <strong>Cloudflare — migration status</strong> — The site is migrating from
                Cloudflare to Lovable. Confirm whether Cloudflare services (CDN, WAF, DNS) will
                remain in front of the Lovable deployment or be fully retired. If retained, list
                which services remain and their data processing locations.
              </li>
              <li>
                <strong>Newsletter/email provider</strong> — Confirm which service is used for the
                newsletter signup visible in the website footer. Name the provider and its data
                processing location.
              </li>
              <li>
                <strong>Analytics/tracking</strong> — Confirm whether any analytics or tracking
                tools are used on the live coachingfederation.ch site, including any inherited from
                Lovable&apos;s platform (PostHog, Google Analytics, TikTok, Facebook/Meta, Google
                Ads). If none are used, state &quot;We do not use third-party analytics or tracking
                tools.&quot;
              </li>
              <li>
                <strong>Payment provider</strong> — If event registrations or other services involve
                payments, name the payment provider (e.g., Stripe, PayPal, TWINT) and its processing
                location. Note: Lovable uses Stripe as a sub-processor for its own billing.
              </li>
              <li>
                <strong>ICF Global data flow</strong> — Confirm the exact data fields exchanged with
                ICF Global, the direction of data flow, and where ICF Global stores and processes
                this data.
              </li>
              <li>
                <strong>Lovable — production platform</strong> — Lovable is the target production
                platform for coachingfederation.ch. Confirm:
                <ul className="mt-1 list-disc space-y-1 pl-5">
                  <li>
                    Which Lovable plan The Switzerland Chapter of ICF is on (Free, Pro, Business, or
                    Enterprise). Business/Enterprise plans include a DPA; Free/Pro do not.
                  </li>
                  <li>
                    Whether a Data Processing Agreement (DPA) with Lovable is in place (required for
                    compliance)
                  </li>
                  <li>
                    Whether Supabase is accessed directly or through Lovable Cloud — Confirmed:
                    through Lovable Cloud. Supabase is a sub-processor of Lovable. Data residency:
                    Europe (Ireland).
                  </li>
                  <li>
                    Whether Lovable&apos;s AI Gateway is used on the live site (transmits data to
                    OpenAI, Google, OpenRouter)
                  </li>
                  <li>
                    Whether Lovable&apos;s platform cookies (PostHog, Google Analytics, TikTok,
                    Facebook/Meta, Google Ads) are present on the live coachingfederation.ch site
                  </li>
                  <li>
                    Review Lovable&apos;s full sub-processor list at{" "}
                    <ExternalLink href="https://trust.lovable.dev">
                      https://trust.lovable.dev
                    </ExternalLink>
                  </li>
                  <li>
                    Lovable&apos;s retention: 90 days for logs, 30 days for customer data after
                    termination — verify alignment with The Switzerland Chapter of ICF&apos;s needs
                  </li>
                </ul>
              </li>
              <li>
                <strong>Embedded third-party services</strong> — As of July 2026, no analytics,
                social media embeds, maps, video embeds, or CAPTCHA services were detected on the
                demo. Fonts are self-hosted (Quicksand + Plus Jakarta Sans). Verify whether any
                additional third-party services are added before launch (maps, videos, social
                plugins, CAPTCHA, Unsplash API, newsletter tracking pixels).
              </li>
              <li>
                <strong>Gated / inactive features</strong> — Confirm which features are actually
                live at launch (the repo notes that member account claiming and member-facing email
                are &quot;built but gated off&quot;). Remove or adjust privacy policy sections for
                features that are not yet active.
              </li>
              <li>
                <strong>Cookie consent banner</strong> — No cookie consent mechanism was detected on
                the Lovable-hosted demo. Fonts are self-hosted, removing the primary driver for
                consent. A consent banner should still be implemented before launch if any
                non-essential cookies are used. Conduct a final cookie audit once the site is live
                on Lovable.
              </li>
              <li>
                <strong>Footer legal links</strong> — The demo site already has disabled
                &quot;Privacy&quot;, &quot;Imprint&quot;, and &quot;Code of Ethics&quot; links in
                the footer (marked &quot;Coming soon&quot;). Ensure these link to the published
                pages once the content is finalized.
              </li>
            </ol>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold tracking-tight">C. Data details</h3>
            <ol className="list-decimal space-y-2 pl-5 text-foreground/80">
              <li>
                <strong>Newsletter signup fields</strong> — The demo site has a newsletter signup
                with an email input field in the footer. Confirm whether additional fields are
                collected beyond email.
              </li>
              <li>
                <strong>Event registration fields</strong> — The demo shows events with date,
                location, language, and topic. Confirm all fields collected during event
                registration (name, email, organisation, dietary requirements, accessibility, etc.).
              </li>
              <li>
                <strong>ICF Global integration fields</strong> — Confirm the exact data fields
                received in the nightly sync.
              </li>
            </ol>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold tracking-tight">D. Retention periods</h3>
            <ol className="list-decimal space-y-2 pl-5 text-foreground/80">
              <li>
                <strong>Technical logs</strong> — Confirm the retention period for access logs,
                security logs, and error logs. Note: Lovable retains log data for up to 90 days.
              </li>
              <li>
                <strong>Contact enquiries</strong> — Confirm the retention period for contact form
                submissions.
              </li>
              <li>
                <strong>Member data</strong> — Confirm the data deletion timeline after membership
                ends.
              </li>
              <li>
                <strong>Event data</strong> — Confirm the retention period for event registration
                data.
              </li>
              <li>
                <strong>CMS/staff data</strong> — Confirm the retention period after access is
                revoked.
              </li>
            </ol>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold tracking-tight">E. Cookies</h3>
            <ol className="list-decimal space-y-2 pl-5 text-foreground/80">
              <li>
                <strong>Cookie audit</strong> — Conduct a complete audit of all cookies and similar
                technologies set by the website and any third-party services once the site is live
                on Lovable. As of the July 2026 demo, no third-party cookies or tracking were
                detected and fonts are self-hosted. List all cookies in the cookie table in Section
                8.
              </li>
              <li>
                <strong>Consent mechanism</strong> — No cookie consent banner was detected on the
                demo. Fonts are self-hosted, so the primary external request concern is resolved. If
                non-essential cookies are added before launch, a consent management tool must be
                implemented.
              </li>
              <li>
                <strong>Local storage / similar technologies</strong> — Check for use of
                localStorage, sessionStorage, IndexedDB, fingerprinting, or other tracking
                technologies on the live site.
              </li>
            </ol>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold tracking-tight">F. Legal review</h3>
            <ol className="list-decimal space-y-2 pl-5 text-foreground/80">
              <li>
                <strong>Swiss legal counsel</strong> — This draft should be reviewed by a
                Swiss-qualified lawyer before publication to ensure full compliance with the DSG,
                DPO, and UWG.
              </li>
              <li>
                <strong>GDPR applicability</strong> — If the website is accessible to users in the
                EU/EEA (which it is), consider whether additional GDPR-specific provisions should be
                included.
              </li>
              <li>
                <strong>Association statutes</strong> — Verify that the data processing described
                here aligns with the association&apos;s statutes (Statuten) regarding member data,
                as the board is responsible under association law.
              </li>
              <li>
                <strong>Lovable DPA</strong> — A Data Processing Agreement with Lovable is required
                since Lovable is the production hosting platform. Lovable&apos;s Free/Pro plans are
                governed by their standard Privacy Policy; Business/Enterprise plans include a DPA.
                The Switzerland Chapter of ICF should upgrade to a plan that includes a DPA or
                negotiate one separately.
              </li>
              <li>
                <strong>Lovable Service Data</strong> — Lovable collects Service Data (IP addresses,
                browser data, usage telemetry) as an independent controller. This means Lovable
                processes some visitor data for its own purposes (security, analytics, product
                improvement). Consider whether this needs to be disclosed to website visitors in the
                privacy policy, as they interact with Lovable&apos;s infrastructure when visiting
                coachingfederation.ch.
              </li>
            </ol>
          </div>
        </section>
    </>
  );
}
