/**
 * Privacy policy section 5: recipients of personal data (hosting, platform, sub-processors).
 * Exports: ThirdPartiesSection. Rendered by src/pages/Privacy.tsx inside the Privacy Policy section.
 */
import { ExternalLink, InfoCallout, MailLink } from "./shared";

export function ThirdPartiesSection() {
  return (
    <>
          <div className="space-y-6">
            <h3 className="text-lg font-semibold tracking-tight">5. Who receives your data?</h3>
            <p className="text-foreground/80">
              We share personal data with the following categories of recipients:
            </p>

            <div className="space-y-4">
              <h4 className="text-base font-semibold tracking-tight">
                a) Hosting and infrastructure providers
              </h4>
              <ul className="list-disc space-y-1 pl-5 text-foreground/80">
                <li>
                  <strong>Supabase</strong> — provides the database, authentication, file storage,
                  and real-time infrastructure for our website. Supabase is accessed through Lovable
                  Cloud, meaning Supabase is a sub-processor of Lovable, not a direct processor of
                  The Switzerland Chapter of ICF. Personal data stored in Supabase is processed
                  under Lovable&apos;s data processing agreement. Data residency: Europe (Ireland) —
                  the Lovable Cloud project is configured to store data in the EU (Ireland) region.
                  The EU/EEA is recognised as having an adequate level of data protection under
                  Swiss law.
                </li>
                <li>
                  <strong>Cloudflare</strong> — provides the edge runtime and content delivery
                  network (CDN) for the current website deployment. The site is being migrated from
                  Cloudflare to Lovable. [Confirm: whether Cloudflare services (CDN, WAF, DNS) will
                  remain in front of the Lovable deployment or will be fully retired after
                  migration. If retained, list which Cloudflare services remain and their data
                  processing locations.]
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-base font-semibold tracking-tight">
                b) Website platform and hosting — Lovable
              </h4>
              <p className="text-foreground/80">
                The Switzerland Chapter of ICF website is hosted and operated on the{" "}
                <strong>Lovable</strong> platform (Lovable Labs Incorporated, a US company). Lovable
                provides the web application hosting, development tools, and deployment
                infrastructure for coachingfederation.ch. The site is being migrated from a previous
                Cloudflare-based deployment to Lovable.
              </p>
              <p className="text-foreground/80">
                Lovable processes personal data as a <strong>data processor</strong> on behalf of
                The Switzerland Chapter of ICF. Key details from{" "}
                <ExternalLink href="https://lovable.dev/privacy">
                  Lovable&apos;s Privacy Policy
                </ExternalLink>{" "}
                (last updated April 2026):
              </p>
              <ul className="list-disc space-y-1 pl-5 text-foreground/80">
                <li>
                  <strong>Legal entity:</strong> Lovable Labs Incorporated (Delaware, USA)
                </li>
                <li>
                  <strong>EU representative:</strong> Lovable Labs AB, Regeringsgatan 25, 111 53
                  Stockholm, Sweden
                </li>
                <li>
                  <strong>DPO contact:</strong> <MailLink address="dpo@lovable.dev" />
                </li>
                <li>
                  <strong>Role:</strong> Lovable processes Customer Data (website content, user
                  data, application data) as a data processor. Lovable also collects Service Data
                  (usage telemetry, IP addresses, browser data, error logs) as an independent
                  controller for its own security, billing, analytics, and product-improvement
                  purposes.
                </li>
                <li>
                  <strong>Hosting infrastructure:</strong> Lovable Cloud stores and processes all
                  Customer Data — including the website&apos;s database, authentication, file
                  storage, and application data — on Supabase infrastructure. Supabase is a
                  sub-processor of Lovable, accessed through Lovable Cloud. The Switzerland Chapter
                  of ICF does not have a direct contractual relationship with Supabase. If
                  Lovable&apos;s AI Gateway is used, data may also be transmitted to third-party AI
                  providers (OpenAI, Google Gemini, models via OpenRouter).
                </li>
                <li>
                  <strong>Sub-processors:</strong> Lovable engages sub-processors including Supabase
                  (hosting), Stripe (payments), PostHog and Google Analytics (analytics for the
                  Lovable platform), TikTok, Facebook/Meta, and Google Ads (marketing for the
                  Lovable platform). The full list is available at{" "}
                  <ExternalLink href="https://trust.lovable.dev">trust.lovable.dev</ExternalLink>.
                </li>
                <li>
                  <strong>International transfers:</strong> Lovable may transfer Personal Data to
                  the United States. Lovable safeguards these transfers through EU Standard
                  Contractual Clauses (Module 2, Controller-to-Processor), the UK International Data
                  Transfer Addendum, and a Swiss Addendum adapting the SCCs to the revised Swiss
                  FADP, naming the FDPIC as the competent authority.
                </li>
                <li>
                  <strong>Data retention:</strong> Lovable retains Log Data for up to 90 days;
                  Customer Data is deleted within 30 days after account termination.
                </li>
                <li>
                  <strong>Security:</strong> SOC 2 Type II and ISO 27001 certified data centers,
                  role-based access controls, MFA, encrypted data in transit and at rest, continuous
                  backups, 24/7 incident response.
                </li>
                <li>
                  <strong>Cookies on the Lovable platform:</strong> Lovable uses cookies on its own
                  platform (PostHog, Google Analytics, TikTok, Facebook/Meta, Google Ads). These
                  cookies affect the Lovable platform itself.
                </li>
              </ul>
              <InfoCallout>
                <p className="font-semibold text-foreground">Items to confirm before publishing:</p>
                <ol className="mt-2 list-decimal space-y-1 pl-5">
                  <li>
                    <strong>Lovable plan type</strong> — Confirm which Lovable plan The Switzerland
                    Chapter of ICF is on (Free, Pro, Business, or Enterprise). Business/Enterprise
                    plans include a Data Processing Agreement (DPA); Free/Pro plans do not. A DPA
                    should be in place with Lovable as a processor.
                  </li>
                  <li>
                    <strong>Migration status</strong> — Confirm whether the migration from
                    Cloudflare to Lovable is complete. During the transition, both platforms may
                    process data. Update the privacy policy to reflect the final production setup
                    once migration is complete.
                  </li>
                  <li>
                    <strong>Lovable Cloud vs. direct Supabase</strong> — Confirmed: Supabase is
                    accessed through Lovable Cloud. Supabase is a sub-processor of Lovable, and The
                    Switzerland Chapter of ICF does not have a direct contractual relationship with
                    Supabase. Data residency: Europe (Ireland) — the EU/EEA is recognised as
                    adequate under Swiss law.
                  </li>
                  <li>
                    <strong>AI Gateway</strong> — Confirm whether Lovable&apos;s AI Gateway is used
                    on the live site. If so, data may be transmitted to OpenAI, Google, and
                    OpenRouter.
                  </li>
                  <li>
                    <strong>Lovable cookies on live site</strong> — Conduct a cookie audit on the
                    live coachingfederation.ch site once migrated to Lovable to determine whether
                    any Lovable platform cookies (PostHog, Google Analytics, TikTok, Facebook/Meta,
                    Google Ads) are present.
                  </li>
                  <li>
                    <strong>Cloudflare retirement</strong> — If Cloudflare is being retired, confirm
                    that no Cloudflare services remain active (CDN, WAF, DNS) or list which
                    Cloudflare services are still used in front of the Lovable deployment.
                  </li>
                  <li>
                    <strong>Sub-processor review</strong> — Review Lovable&apos;s full sub-processor
                    list at{" "}
                    <ExternalLink href="https://trust.lovable.dev">
                      https://trust.lovable.dev
                    </ExternalLink>{" "}
                    and ensure alignment with The Switzerland Chapter of ICF&apos;s data processing
                    needs.
                  </li>
                  <li>
                    <strong>DPA</strong> — Ensure a Data Processing Agreement is in place with
                    Lovable. If on a Free/Pro plan, request a DPA or upgrade to a plan that includes
                    one.
                  </li>
                </ol>
              </InfoCallout>
            </div>

            <div className="space-y-4">
              <h4 className="text-base font-semibold tracking-tight">
                c) Email and communication providers
              </h4>
              <p className="text-foreground/80">
                [Confirm: which email service provider is used for sending newsletters and
                transactional emails — e.g., Mailchimp, Brevo, SendGrid, Resend, or other. List the
                provider name and processing location.]
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="text-base font-semibold tracking-tight">
                d) Analytics providers (if applicable)
              </h4>
              <p className="text-foreground/80">
                [Confirm: whether any analytics or tracking tools are used — e.g., Google Analytics,
                Plausible, Fathom, Vercel Analytics, or other. If none are used, state &quot;We do
                not use third-party analytics or tracking tools.&quot; If any are used, list the
                provider, what data is collected, and the processing location.]
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="text-base font-semibold tracking-tight">e) ICF Global</h4>
              <p className="text-foreground/80">
                Member data is exchanged with ICF Global through an automated integration. This
                includes receiving member data from ICF Global and potentially sending profile
                updates back. [Confirm: the direction of data flow and the specific data shared with
                ICF Global, and where ICF Global processes this data.]
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="text-base font-semibold tracking-tight">
                f) Payment providers (if applicable)
              </h4>
              <p className="text-foreground/80">
                [Confirm: if event registration or other services involve payments, list the payment
                provider (e.g., Stripe, PayPal, TWINT) and its processing location.]
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="text-base font-semibold tracking-tight">g) Internal access</h4>
              <ul className="list-disc space-y-1 pl-5 text-foreground/80">
                <li>Members of the Board of The Switzerland Chapter of ICF</li>
                <li>
                  Authorised staff and volunteers with access to the CMS and member administration
                  tools
                </li>
                <li>Access is granted on a role-based, need-to-know basis</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-base font-semibold tracking-tight">
                h) Other third-party services
              </h4>
              <p className="text-foreground/80">
                Fonts are self-hosted (Quicksand for headlines, Plus Jakarta Sans for body text) —
                no external font requests are made.
              </p>
              <p className="text-foreground/80">
                The following third-party services may be used on the website:
              </p>
              <ul className="list-disc space-y-1 pl-5 text-foreground/80">
                <li>[Confirm: Embedded maps (e.g., Google Maps, Mapbox)]</li>
                <li>[Confirm: Video embeds (e.g., YouTube, Vimeo)]</li>
                <li>
                  [Confirm: Social media embeds or plugins (e.g., LinkedIn, X/Twitter, Facebook)]
                </li>
                <li>
                  [Confirm: CAPTCHA / bot protection (e.g., Google reCAPTCHA, hCaptcha, Cloudflare
                  Turnstile)]
                </li>
                <li>[Confirm: Image services (e.g., Unsplash API used by the CMS image picker)]</li>
                <li>[Confirm: Newsletter tracking pixels (open / click tracking)]</li>
              </ul>
              <p className="text-foreground/80">
                <strong>Note on analytics:</strong> No analytics or tracking tools were detected on
                the Lovable-hosted demo as of July 2026. If analytics are added before launch, they
                must be listed here with their data processing details. Lovable&apos;s own platform
                analytics (PostHog, Google Analytics, TikTok, Facebook/Meta, Google Ads) apply to
                the Lovable editor at lovable.dev, not to visitors of coachingfederation.ch — unless
                Lovable injects tracking into deployed sites. [Confirm: whether Lovable injects any
                platform-level tracking into deployed sites.]
              </p>
              <p className="text-foreground/80">We do not sell personal data to third parties.</p>
            </div>
          </div>

    </>
  );
}
