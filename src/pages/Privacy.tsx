import { LegalPageShell } from "./LegalPageShell";

function Table({ headers, rows }: { headers: string[]; rows: React.ReactNode[][] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border/70 bg-card">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-muted">
          <tr>
            {headers.map((h) => (
              <th key={h} className="px-4 py-3 font-semibold text-foreground">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/70">
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3 align-top text-foreground/80">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function PrivacyPage() {
  return (
    <LegalPageShell pageKey="privacy">
      <div className="space-y-12">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">1. Who is responsible?</h2>
          <p className="text-foreground/80">
            The controller responsible for the processing of personal data on this website is:
          </p>
          <div className="space-y-2 text-foreground/80">
            <p className="font-semibold text-foreground">
              International Coach Federation (ICF) Switzerland
            </p>
            <p>Switzerland Chapter of ICF</p>
            <p>Association (Verein) under Swiss law</p>
            <p>UID: CHE-205.048.647</p>
          </div>
          <address className="not-italic text-foreground/80">
            Weitegasse 6
            <br />
            9320 Arbon
            <br />
            Switzerland
          </address>
          <p className="text-foreground/80">
            Email:{" "}
            <a
              href="mailto:office@coachingfederation.ch"
              className="text-primary underline underline-offset-4 hover:text-primary/80"
            >
              office@coachingfederation.ch
            </a>
          </p>
          <p className="text-foreground/80">
            For any questions regarding data protection, you may contact us at the email address
            above.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            2. What is this privacy policy about?
          </h2>
          <p className="text-foreground/80">
            This privacy policy describes how International Coach Federation (ICF) Switzerland
            ("we", "The Switzerland Chapter of ICF", "the association") processes personal data on and in
            connection with the website{" "}
            <a
              href="https://www.coachingfederation.ch"
              className="text-primary underline underline-offset-4 hover:text-primary/80"
            >
              www.coachingfederation.ch
            </a>
            . It applies to:
          </p>
          <ul className="list-disc space-y-1 pl-5 text-foreground/80">
            <li>
              <strong>Public website</strong> — homepage, events listings, blog ("Insights"), about
              pages, coach directory
            </li>
            <li>
              <strong>Coach directory</strong> ("Find a Coach") — public profiles of ICF members
            </li>
            <li>
              <strong>Member area</strong> — where members manage their own directory profile and
              account
            </li>
            <li>
              <strong>Staff tooling</strong> — CMS, member administration, and ICF integration
              controls
            </li>
            <li>
              <strong>Newsletter and communications</strong> — email subscriptions via the website
            </li>
            <li>
              <strong>Contact and event registration forms</strong> — where personal data is
              submitted
            </li>
          </ul>
          <p className="text-foreground/80">
            This privacy policy is written to comply with the Swiss Federal Act on Data Protection
            (DSG, SR 235.1). Where the processing also affects individuals in the European Economic
            Area, the General Data Protection Regulation (GDPR) may additionally apply.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold tracking-tight">
            3. What personal data do we process?
          </h2>
          <p className="text-foreground/80">
            We process the following categories of personal data:
          </p>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold tracking-tight">
              a) Technical data (all website visitors)
            </h3>
            <p className="text-foreground/80">
              When you visit our website, we and our hosting platform Lovable automatically process
              technical data that your browser transmits:
            </p>
            <ul className="list-disc space-y-1 pl-5 text-foreground/80">
              <li>IP address (or truncated IP address)</li>
              <li>Browser type and version</li>
              <li>Operating system</li>
              <li>Device type</li>
              <li>Referrer URL (the page you visited before ours)</li>
              <li>Date and time of access</li>
              <li>Pages visited and duration of visit</li>
            </ul>
            <p className="text-foreground/80">
              This data is processed for the technical operation, security, and stability of the
              website. Our hosting platform Lovable also processes this data as an independent
              controller for its own security, analytics, and product-improvement purposes, in
              accordance with{" "}
              <a
                href="https://lovable.dev/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-4 hover:text-primary/80"
              >
                Lovable's Privacy Policy
              </a>
              . Lovable retains this log data for up to 90 days.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold tracking-tight">b) Contact and enquiry data</h3>
            <p className="text-foreground/80">
              When you contact us via email or a contact form, we process:
            </p>
            <ul className="list-disc space-y-1 pl-5 text-foreground/80">
              <li>Name</li>
              <li>Email address</li>
              <li>Any other information you choose to provide in your message</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold tracking-tight">
              c) Newsletter subscription data
            </h3>
            <p className="text-foreground/80">
              When you subscribe to our newsletter via the website, we process:
            </p>
            <ul className="list-disc space-y-1 pl-5 text-foreground/80">
              <li>Email address</li>
              <li>Subscription date and status</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold tracking-tight">d) Member account data</h3>
            <p className="text-foreground/80">
              When you create or claim a member account, we process:
            </p>
            <ul className="list-disc space-y-1 pl-5 text-foreground/80">
              <li>Name</li>
              <li>Email address</li>
              <li>ICF membership information (member ID, credentials, membership status)</li>
              <li>
                Account authentication data (e.g., login credentials managed through our
                authentication provider)
              </li>
              <li>Profile preferences and settings</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold tracking-tight">
              e) Coach directory profile data
            </h3>
            <p className="text-foreground/80">
              For members whose profiles appear in the public "Find a Coach" directory, we process
              and publish:
            </p>
            <ul className="list-disc space-y-1 pl-5 text-foreground/80">
              <li>Name and credentials</li>
              <li>Photograph</li>
              <li>Biography and coaching specialties</li>
              <li>Contact information (as made public by the member)</li>
              <li>Languages spoken</li>
              <li>Location / region</li>
              <li>Coaching focus areas</li>
              <li>
                Links to external profiles (e.g., website, LinkedIn), if provided by the member
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold tracking-tight">f) Event registration data</h3>
            <p className="text-foreground/80">When you register for an event, we process:</p>
            <ul className="list-disc space-y-1 pl-5 text-foreground/80">
              <li>Name</li>
              <li>Email address</li>
              <li>Registration status and payment information, if applicable</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold tracking-tight">g) Staff and CMS user data</h3>
            <p className="text-foreground/80">
              For staff and authorised users of the CMS and administration tools, we process:
            </p>
            <ul className="list-disc space-y-1 pl-5 text-foreground/80">
              <li>Name and email address</li>
              <li>Role and access permissions</li>
              <li>Authentication data</li>
              <li>Activity logs within the CMS</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold tracking-tight">
              h) Data from ICF Global integration
            </h3>
            <p className="text-foreground/80">
              We receive member data from the International Coaching Federation (ICF Global) through
              an automated nightly synchronisation. This includes:
            </p>
            <ul className="list-disc space-y-1 pl-5 text-foreground/80">
              <li>Member identification data</li>
              <li>Membership status and credentials</li>
            </ul>
            <p className="text-foreground/80">
              This data is processed to maintain accurate member records and directory profiles.
            </p>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold tracking-tight">
            4. For what purposes and on what legal basis do we process your data?
          </h2>
          <p className="text-foreground/80">We process personal data for the following purposes:</p>
          <Table
            headers={["Purpose", "Categories of data"]}
            rows={[
              [
                "Technical operation, security, and maintenance of the website",
                "Technical data (IP, browser, device, logs)",
              ],
              ["Responding to enquiries and communications", "Contact data"],
              [
                "Managing membership and member accounts",
                "Member account data, ICF Global integration data",
              ],
              ["Publishing coach directory profiles", "Coach directory profile data"],
              ["Organising events and managing registrations", "Event registration data"],
              [
                "Sending newsletters and association communications",
                "Newsletter subscription data",
              ],
              [
                "Administering content, member management, and ICF integration",
                "Staff/CMS user data, ICF Global integration data",
              ],
              ["Meeting legal and regulatory obligations", "Various, as required"],
            ]}
          />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold tracking-tight">
              Legal framework under Swiss law
            </h3>
            <p className="text-foreground/80">
              Under the Swiss Data Protection Act (DSG), the processing of personal data by private
              parties is generally permissible as long as it complies with the principles of Art. 6
              DSG (lawfulness, good faith, proportionality, purpose limitation, transparency, data
              accuracy, and data security) and does not violate the personality rights of the data
              subject.
            </p>
            <p className="text-foreground/80">
              Where processing could infringe personality rights, it may be justified by:
            </p>
            <ul className="list-disc space-y-1 pl-5 text-foreground/80">
              <li>the data subject's consent,</li>
              <li>a legal obligation, or</li>
              <li>an overriding private or public interest (Art. 31 DSG).</li>
            </ul>
            <p className="text-foreground/80">For the processing activities described above:</p>
            <ul className="list-disc space-y-1 pl-5 text-foreground/80">
              <li>
                <strong>Newsletter subscriptions</strong> are based on your active consent. You may
                unsubscribe at any time.
              </li>
              <li>
                <strong>Coach directory profiles</strong> are published as part of the member's
                participation in the association, subject to the member's visibility settings.
              </li>
              <li>
                <strong>Technical data processing</strong> is necessary for the operation and
                security of the website.
              </li>
              <li>
                <strong>Member data and ICF Global integration</strong> serve the fulfilment of the
                membership relationship and the association's purpose.
              </li>
              <li>
                <strong>Event registration data</strong> is processed to organise events and manage
                participation.
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold tracking-tight">Where the GDPR also applies</h3>
            <p className="text-foreground/80">
              Where the processing also affects individuals in the European Economic Area and the
              GDPR applies, the relevant legal bases include: consent (Art. 6 para. 1 lit. a GDPR),
              contractual necessity (Art. 6 para. 1 lit. b GDPR), legal obligation (Art. 6 para. 1
              lit. c GDPR), and legitimate interests (Art. 6 para. 1 lit. f GDPR).
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            4a. Where do we obtain your personal data from?
          </h2>
          <p className="text-foreground/80">We obtain personal data from the following sources:</p>
          <ul className="list-disc space-y-1 pl-5 text-foreground/80">
            <li>
              <strong>Directly from you</strong> — when you contact us, subscribe to the newsletter,
              register for an event, create or manage a member account, or edit your coach directory
              profile.
            </li>
            <li>
              <strong>From ICF Global</strong> — through the automated nightly member data
              synchronisation (see Section 3h).
            </li>
            <li>
              <strong>From technical systems</strong> — technical data collected automatically when
              you visit the website (see Section 3a).
            </li>
          </ul>
          <p className="text-foreground/80">
            Where we obtain personal data that was not collected directly from you (Art. 19 para. 3
            DSG), we inform you about the source of the data and the categories of data processed.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold tracking-tight">5. Who receives your data?</h2>
          <p className="text-foreground/80">
            We share personal data with the following categories of recipients:
          </p>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold tracking-tight">
              a) Hosting and infrastructure providers
            </h3>
            <ul className="list-disc space-y-1 pl-5 text-foreground/80">
              <li>
                <strong>Supabase</strong> — provides the database, authentication, file storage, and
                real-time infrastructure for our website. Supabase is accessed through Lovable
                Cloud, meaning Supabase is a sub-processor of Lovable, not a direct processor of ICF
                Switzerland. Personal data stored in Supabase is processed under Lovable's data
                processing agreement.
              </li>
              <li>
                <strong>Cloudflare</strong> — provides the edge runtime and content delivery network
                (CDN) for the current website deployment. The site is being migrated from Cloudflare
                to Lovable.
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold tracking-tight">
              b) Website platform and hosting — Lovable
            </h3>
            <p className="text-foreground/80">
              The The Switzerland Chapter of ICF website is hosted and operated on the <strong>Lovable</strong>{" "}
              platform (Lovable Labs Incorporated, a US company). Lovable provides the web
              application hosting, development tools, and deployment infrastructure for
              coachingfederation.ch. The site is being migrated from a previous Cloudflare-based
              deployment to Lovable.
            </p>
            <p className="text-foreground/80">
              Lovable processes personal data as a <strong>data processor</strong> on behalf of ICF
              Switzerland. Key details from{" "}
              <a
                href="https://lovable.dev/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-4 hover:text-primary/80"
              >
                Lovable's Privacy Policy
              </a>{" "}
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
                <strong>DPO contact:</strong>{" "}
                <a
                  href="mailto:dpo@lovable.dev"
                  className="text-primary underline underline-offset-4 hover:text-primary/80"
                >
                  dpo@lovable.dev
                </a>
              </li>
              <li>
                <strong>Role:</strong> Lovable processes Customer Data (website content, user data,
                application data) as a data processor. Lovable also collects Service Data (usage
                telemetry, IP addresses, browser data, error logs) as an independent controller for
                its own security, billing, analytics, and product-improvement purposes.
              </li>
              <li>
                <strong>Hosting infrastructure:</strong> Lovable Cloud stores and processes all
                Customer Data — including the website's database, authentication, file storage, and
                application data — on Supabase infrastructure. Supabase is a sub-processor of
                Lovable, accessed through Lovable Cloud. The Switzerland Chapter of ICF does not have a direct
                contractual relationship with Supabase. If Lovable's AI Gateway is used, data may
                also be transmitted to third-party AI providers (OpenAI, Google Gemini, models via
                OpenRouter).
              </li>
              <li>
                <strong>Sub-processors:</strong> Lovable engages sub-processors including Supabase
                (hosting), Stripe (payments), PostHog and Google Analytics (analytics for the
                Lovable platform), TikTok, Facebook/Meta, and Google Ads (marketing for the Lovable
                platform). The full list is available at{" "}
                <a
                  href="https://trust.lovable.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline underline-offset-4 hover:text-primary/80"
                >
                  trust.lovable.dev
                </a>
                .
              </li>
              <li>
                <strong>International transfers:</strong> Lovable may transfer Personal Data to the
                United States. Lovable safeguards these transfers through EU Standard Contractual
                Clauses (Module 2, Controller-to-Processor), the UK International Data Transfer
                Addendum, and a Swiss Addendum adapting the SCCs to the revised Swiss FADP, naming
                the FDPIC as the competent authority.
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
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold tracking-tight">
              c) Email and communication providers
            </h3>
            <p className="text-foreground/80">
              Newsletters and transactional emails are sent via the provider selected for ICF
              Switzerland's communications.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold tracking-tight">
              d) Analytics providers (if applicable)
            </h3>
            <p className="text-foreground/80">
              No third-party analytics or tracking tools are currently used on the public website.
              If any are added, they will be listed here with details of the data collected and
              processing location.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold tracking-tight">e) ICF Global</h3>
            <p className="text-foreground/80">
              Member data is exchanged with ICF Global through an automated integration. This
              includes receiving member data from ICF Global and potentially sending profile updates
              back.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold tracking-tight">
              f) Payment providers (if applicable)
            </h3>
            <p className="text-foreground/80">
              If event registration or other services involve payments, the relevant payment
              provider will be listed here with its processing location.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold tracking-tight">g) Internal access</h3>
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
            <h3 className="text-lg font-semibold tracking-tight">h) Other third-party services</h3>
            <p className="text-foreground/80">
              Fonts are self-hosted (Nunito Sans for headlines, Plus Jakarta Sans for body text) —
              no external font requests are made.
            </p>
            <p className="text-foreground/80">
              The following third-party services may be used on the website:
            </p>
            <ul className="list-disc space-y-1 pl-5 text-foreground/80">
              <li>Embedded maps (e.g., Google Maps, Mapbox)</li>
              <li>Video embeds (e.g., YouTube, Vimeo)</li>
              <li>Social media embeds or plugins (e.g., LinkedIn, X/Twitter, Facebook)</li>
              <li>
                CAPTCHA / bot protection (e.g., Google reCAPTCHA, hCaptcha, Cloudflare Turnstile)
              </li>
              <li>Image services (e.g., Unsplash API used by the CMS image picker)</li>
              <li>Newsletter tracking pixels (open / click tracking)</li>
            </ul>
            <p className="text-foreground/80">
              No analytics or tracking tools were detected on the Lovable-hosted demo as of July
              2026. If analytics are added before launch, they must be listed here with their data
              processing details. Lovable's own platform analytics (PostHog, Google Analytics,
              TikTok, Facebook/Meta, Google Ads) apply to the Lovable editor at lovable.dev, not to
              visitors of coachingfederation.ch — unless Lovable injects tracking into deployed
              sites.
            </p>
            <p className="text-foreground/80">We do not sell personal data to third parties.</p>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold tracking-tight">
            6. Is data transferred outside Switzerland?
          </h2>
          <p className="text-foreground/80">
            Personal data processed in connection with our website may be transferred outside
            Switzerland. This includes transfers to countries within the European Economic Area
            (EEA) and to the United States.
          </p>
          <p className="text-foreground/80">The following transfers are known or expected:</p>
          <Table
            headers={["Recipient", "Country / region", "Safeguard"]}
            rows={[
              [
                "Lovable (Lovable Labs Inc.)",
                "United States (Delaware)",
                "EU SCCs Module 2 (Controller-to-Processor), Swiss Addendum to the revised FADP, UK Addendum. See Lovable Privacy Policy",
              ],
              [
                "Lovable sub-processors",
                "Various (see trust.lovable.dev)",
                "Contractual obligations equivalent to Lovable's DPAs",
              ],
              [
                "Supabase (via Lovable Cloud)",
                "Region selected in Lovable Cloud project",
                "Sub-processor of Lovable; covered by Lovable's DPA and SCCs",
              ],
              ["Cloudflare (if retained post-migration)", "Global network", "To be confirmed"],
              ["Newsletter/email provider", "To be confirmed", "To be confirmed"],
              ["ICF Global", "To be confirmed", "To be confirmed"],
            ]}
          />
          <p className="text-foreground/80">
            Where data is transferred to countries that do not have an adequate level of data
            protection under Swiss law, we ensure appropriate safeguards are in place, including:
          </p>
          <ul className="list-disc space-y-1 pl-5 text-foreground/80">
            <li>Standard Contractual Clauses (SCCs) or equivalent contractual guarantees</li>
            <li>
              The Swiss Addendum to the SCCs (as used by Lovable, naming the FDPIC as competent
              authority)
            </li>
            <li>Binding corporate rules (where applicable)</li>
            <li>Specific exceptions under Art. 16 para. 2 DSG</li>
          </ul>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold tracking-tight">7. How long do we store your data?</h2>
          <p className="text-foreground/80">
            We retain personal data only for as long as is necessary to fulfil the purposes for
            which it was collected, or as long as required by law. The specific retention periods
            are:
          </p>
          <Table
            headers={["Category", "Retention period / criteria"]}
            rows={[
              [
                "Technical data (logs)",
                "Up to 90 days for access logs; longer for security logs where required",
              ],
              [
                "Contact enquiries",
                "For the duration of the enquiry and 12 months thereafter for follow-up",
              ],
              [
                "Newsletter subscriptions",
                "Until you unsubscribe; suppression list retained to prevent re-subscription without consent",
              ],
              [
                "Member account data",
                "For the duration of ICF membership; deleted or anonymised 30 days after membership ends",
              ],
              [
                "Coach directory profiles",
                "For as long as the member maintains a public profile; removed when the member deactivates their profile or membership ends",
              ],
              [
                "Event registration data",
                "For the duration of the event and 12 months thereafter for accounting and follow-up",
              ],
              [
                "CMS/staff user data",
                "For the duration of the user's role; deleted 30 days after access is revoked",
              ],
              [
                "ICF Global integration data",
                "Synchronised nightly; retained according to membership status",
              ],
            ]}
          />
          <p className="text-foreground/80">
            Where legal or regulatory obligations require longer retention (e.g., accounting records
            under Swiss tax and commercial law), data is retained for the legally required period.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold tracking-tight">8. Cookies and similar technologies</h2>
          <p className="text-foreground/80">
            Our website uses cookies and similar technologies for technical purposes. The EDÖB
            provides guidance on the use of cookies and similar technologies under the DSG and the
            Telecommunications Act (TCA) ({" "}
            <a
              href="https://www.edoeb.admin.ch/dam/de/sd-web/brLL9rM3ny9d/Leitfaden%20des%20ED%C3%96B%20betreffend%20Datenbearbeitungen%20mittels%20Cookies%20und%20%C3%A4hnlichen%20Technologien%20V.%201.1%20vom%2006.10.2025_DE.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-4 hover:text-primary/80"
            >
              EDÖB cookie guidelines
            </a>
            ).
          </p>
          <h3 className="text-lg font-semibold tracking-tight">Cookies we use</h3>
          <Table
            headers={["Cookie / technology", "Purpose", "Duration", "Consent"]}
            rows={[
              [
                "Session cookies",
                "Essential for website functionality (e.g., login, language selection)",
                "Session",
                "Not required",
              ],
              [
                "Authentication cookies",
                "User login and session management",
                "Duration of session",
                "Not required",
              ],
              [
                "Analytics cookies",
                "Only if analytics are added before launch",
                "To be confirmed",
                "May be required depending on configuration and applicable law",
              ],
            ]}
          />
          <h3 className="text-lg font-semibold tracking-tight">Managing cookies</h3>
          <p className="text-foreground/80">
            You can control and delete cookies through your browser settings. Please note that
            disabling essential cookies may affect the functionality of the website.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            9. What are your data protection rights?
          </h2>
          <p className="text-foreground/80">
            Under the Swiss Data Protection Act (DSG), you have the following rights regarding your
            personal data:
          </p>
          <ul className="list-disc space-y-2 pl-5 text-foreground/80">
            <li>
              <strong>Right to information (Auskunftsrecht)</strong> — You may request information
              about whether we process personal data about you and, if so, what data is processed
              (Art. 25 DSG).
            </li>
            <li>
              <strong>Right to rectification (Recht auf Berichtigung)</strong> — You may request the
              correction of inaccurate or incomplete personal data (Art. 32 DSG).
            </li>
            <li>
              <strong>Right to erasure (Recht auf Löschung)</strong> — You may request the deletion
              of your personal data, subject to legal retention obligations and other exceptions
              (Art. 32 DSG).
            </li>
            <li>
              <strong>Right to object (Widerspruchsrecht)</strong> — You may object to the
              processing of your personal data in certain circumstances, particularly where
              processing is based on an overriding interest (Art. 31 DSG) or, where the GDPR
              applies, on legitimate interests (Art. 21 GDPR).
            </li>
            <li>
              <strong>Right to data portability</strong> — You may request that we provide your
              personal data in a structured, commonly used, and machine-readable format (Art. 28
              DSG).
            </li>
            <li>
              <strong>Right to withdraw consent</strong> — Where processing is based on your
              consent, you may withdraw consent at any time. This does not affect the lawfulness of
              processing carried out before withdrawal.
            </li>
            <li>
              <strong>Right to lodge a complaint</strong> — You have the right to lodge a complaint
              with the Swiss Federal Data Protection and Information Commissioner (FDPIC / EDÖB):
            </li>
          </ul>
          <div className="rounded-2xl border border-border/70 bg-card p-6 text-foreground/80">
            <p className="font-semibold text-foreground">
              Eidgenössischer Datenschutz- und Öffentlichkeitsbeauftragter (EDÖB)
            </p>
            <p className="mt-2">Feldeggweg 1</p>
            <p>3003 Bern</p>
            <p>Switzerland</p>
            <p className="mt-2">
              Website:{" "}
              <a
                href="https://www.edoeb.admin.ch"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-4 hover:text-primary/80"
              >
                www.edoeb.admin.ch
              </a>
            </p>
          </div>
          <p className="text-foreground/80">
            To exercise any of these rights, please contact us at{" "}
            <a
              href="mailto:office@coachingfederation.ch"
              className="text-primary underline underline-offset-4 hover:text-primary/80"
            >
              office@coachingfederation.ch
            </a>
            . We will respond to your request within 30 days. In complex cases, this period may be
            extended; we will inform you of any extension and the reasons for it.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">10. Automated individual decisions</h2>
          <p className="text-foreground/80">
            We do not make decisions based solely on automated processing that produce legal effects
            or significantly affect you (Art. 21 DSG). In particular:
          </p>
          <ul className="list-disc space-y-1 pl-5 text-foreground/80">
            <li>
              The coach directory search and filtering is a tool to help visitors find coaches; it
              does not make automated decisions about individuals.
            </li>
            <li>Member account creation and profile management involve human oversight.</li>
            <li>
              No profiling is carried out that would produce legal or similarly significant effects
              on you.
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">11. How do we protect your data?</h2>
          <p className="text-foreground/80">
            We implement appropriate technical and organisational measures to protect personal data
            against unauthorised access, loss, destruction, or alteration. These measures include:
          </p>
          <ul className="list-disc space-y-1 pl-5 text-foreground/80">
            <li>Encrypted data transmission (TLS/SSL)</li>
            <li>Role-based access controls and authentication</li>
            <li>Regular security reviews of our systems</li>
            <li>Data stored in a managed database with row-level security policies</li>
          </ul>
          <p className="text-foreground/80">
            If a data breach occurs that is likely to result in a high risk to your rights and
            freedoms, we will notify the FDPIC (EDÖB) as soon as possible, in accordance with Art.
            24 DSG.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">12. Data of children</h2>
          <p className="text-foreground/80">
            Our website is not directed at children under 16. We do not knowingly collect personal
            data from children under 16. If you believe we have collected personal data from a
            child, please contact us and we will take steps to delete the data.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">13. Changes to this privacy policy</h2>
          <p className="text-foreground/80">
            We may update this privacy policy from time to time to reflect changes in our data
            processing practices, legal requirements, or the services we offer. The current version
            will always be available on this page. We recommend that you review this page
            periodically.
          </p>
          <p className="text-foreground/80">
            The date of the last update will be indicated at the bottom of this page.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">14. Contact</h2>
          <p className="text-foreground/80">
            If you have any questions about this privacy policy or our data processing practices,
            please contact:
          </p>
          <div className="rounded-2xl border border-border/70 bg-card p-6 text-foreground/80">
            <p className="font-semibold text-foreground">
              International Coach Federation (ICF) Switzerland
            </p>
            <p className="mt-2">Weitegasse 6</p>
            <p>9320 Arbon</p>
            <p>Switzerland</p>
            <p className="mt-2">
              Email:{" "}
              <a
                href="mailto:office@coachingfederation.ch"
                className="text-primary underline underline-offset-4 hover:text-primary/80"
              >
                office@coachingfederation.ch
              </a>
            </p>
          </div>
        </section>

        <p className="pt-8 text-sm text-muted-foreground">Last updated: [Date of publication]</p>
      </div>
    </LegalPageShell>
  );
}
