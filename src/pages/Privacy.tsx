import { LegalPageShell } from "./LegalPageShell";
import { Info } from "lucide-react";

function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary underline underline-offset-4 hover:text-primary/80"
    >
      {children}
    </a>
  );
}

function MailLink({ address }: { address: string }) {
  return (
    <a
      href={`mailto:${address}`}
      className="text-primary underline underline-offset-4 hover:text-primary/80"
    >
      {address}
    </a>
  );
}

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

function InfoCallout({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-muted/50 p-5">
      <div className="flex items-start gap-3">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
        <div className="text-foreground/80">{children}</div>
      </div>
    </div>
  );
}

export default function PrivacyPage() {
  return (
    <LegalPageShell pageKey="privacy">
      <div className="space-y-12">
        <section className="space-y-6">
          <h1 className="text-3xl font-bold tracking-tight">
            The Switzerland Chapter of ICF — Imprint &amp; Privacy Policy (Draft)
          </h1>
          <InfoCallout>
            <p className="font-semibold text-foreground">
              Status: Draft for legal review — not yet approved for publication.
            </p>
            <p className="mt-2">
              <strong>Master language:</strong> English. DE / FR / IT translations to be produced
              from the approved English master.
            </p>
            <p className="mt-1">
              <strong>Prepared:</strong> July 2026
            </p>
            <p className="mt-1">
              <strong>Legal basis:</strong> Swiss Federal Act on Data Protection (DSG, SR 235.1,
              revised version in force since 1 September 2023); Federal Act against Unfair
              Competition (UWG, SR 241), Art. 3 para. 1 let. s.
            </p>
            <p className="mt-1">
              <strong>Sources:</strong> UID register extract (CHE-205.048.647, dated 28 July 2026);{" "}
              <ExternalLink href="https://www.edoeb.admin.ch/en/privacy-statements-on-the-internet">
                EDÖB — Privacy statements on the internet
              </ExternalLink>
              ;{" "}
              <ExternalLink href="https://www.edoeb.admin.ch/de/datenschutz-in-vereinen">
                EDÖB — Datenschutz in Vereinen
              </ExternalLink>
              ;{" "}
              <ExternalLink href="https://www.edoeb.admin.ch/dam/de/sd-web/brLL9rM3ny9d/Leitfaden%20des%20ED%C3%96B%20betreffend%20Datenbearbeitungen%20mittels%20Cookies%20und%20%C3%A4hnlichen%20Technologien%20V.%201.1%20vom%2006.10.2025_DE.pdf">
                EDÖB — Leitfaden Cookies
              </ExternalLink>
              ;{" "}
              <ExternalLink href="https://lovable.dev/privacy">Lovable Privacy Policy</ExternalLink>{" "}
              (last updated April 2026);{" "}
              <ExternalLink href="https://trust.lovable.dev">Lovable sub-processor list</ExternalLink>.
            </p>
          </InfoCallout>
        </section>

        <hr className="border-border/70" />

        <section className="space-y-8">
          <h2 className="text-2xl font-bold tracking-tight">Imprint</h2>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold tracking-tight">Provider</h3>
            <div className="space-y-2 text-foreground/80">
              <p className="font-semibold text-foreground">The Switzerland Chapter of ICF</p>
              <p>Legal form: Association (Verein) under Swiss law</p>
              <p>UID: CHE-205.048.647</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold tracking-tight">Address</h3>
            <address className="not-italic text-foreground/80">
              Weitegasse 6
              <br />
              9320 Arbon
              <br />
              Switzerland
            </address>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold tracking-tight">Contact</h3>
            <div className="space-y-2 text-foreground/80">
              <p>
                Email: <MailLink address="office@coachingfederation.ch" />
              </p>
              <p>
                Website:{" "}
                <ExternalLink href="https://www.coachingfederation.ch">
                  www.coachingfederation.ch
                </ExternalLink>
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold tracking-tight">Responsible for content</h3>
            <p className="text-foreground/80">
              The Board of The Switzerland Chapter of ICF is responsible for the content of this
              website in accordance with Swiss law.
            </p>
            <p className="text-foreground/80">
              Contact: <MailLink address="office@coachingfederation.ch" />
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold tracking-tight">Liability for content</h3>
            <p className="text-foreground/80">
              The content of this website has been prepared with the greatest possible care.
              However, The Switzerland Chapter of ICF does not guarantee the accuracy, completeness,
              or timeliness of the information provided. Liability claims against The Switzerland
              Chapter of ICF arising from material or immaterial damage caused by the use or non-use
              of the information provided or by the use of incorrect or incomplete information are
              excluded, to the extent permitted by Swiss law.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold tracking-tight">Liability for links</h3>
            <p className="text-foreground/80">
              This website may contain links to external third-party websites over whose content The
              Switzerland Chapter of ICF has no influence. The Switzerland Chapter of ICF therefore
              accepts no liability for the content of external sites. The respective provider or
              operator of the linked sites is always responsible for their content.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold tracking-tight">Copyright</h3>
            <p className="text-foreground/80">
              The content and works published on this website — including text, images, graphics,
              and design elements — are subject to Swiss copyright law. Reproduction, processing,
              distribution, and any form of commercial use of the content beyond the scope of
              copyright law require the written consent of The Switzerland Chapter of ICF or the
              respective copyright holder, where applicable.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold tracking-tight">Applicable law</h3>
            <p className="text-foreground/80">
              This imprint and all legal relations arising from the use of this website are subject
              to Swiss law.
            </p>
          </div>
        </section>

        <hr className="border-border/70" />

        <section className="space-y-8">
          <h2 className="text-2xl font-bold tracking-tight">Privacy Policy</h2>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold tracking-tight">1. Who is responsible?</h3>
            <p className="text-foreground/80">
              The controller responsible for the processing of personal data on this website is:
            </p>
            <div className="space-y-2 text-foreground/80">
              <p className="font-semibold text-foreground">The Switzerland Chapter of ICF</p>
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
              Email: <MailLink address="office@coachingfederation.ch" />
            </p>
            <p className="text-foreground/80">
              For any questions regarding data protection, you may contact us at the email address
              above.
            </p>
            <InfoCallout>
              <p>
                <strong>Item to confirm before publishing:</strong> If The Switzerland Chapter of
                ICF designates a Data Protection Adviser (Datenschutzberater) under Art. 14 DPO, or
                a specific contact for data protection matters, their name and contact details
                should be inserted here.
              </p>
            </InfoCallout>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold tracking-tight">
              2. What is this privacy policy about?
            </h3>
            <p className="text-foreground/80">
              This privacy policy describes how The Switzerland Chapter of ICF (&quot;we&quot;,
              &quot;the association&quot;) processes personal data on and in connection with the
              website{" "}
              <ExternalLink href="https://www.coachingfederation.ch">
                www.coachingfederation.ch
              </ExternalLink>
              . It applies to:
            </p>
            <ul className="list-disc space-y-1 pl-5 text-foreground/80">
              <li>
                <strong>Public website</strong> — homepage, events listings, blog
                (&quot;Insights&quot;), about pages, coach directory
              </li>
              <li>
                <strong>Coach directory</strong> (&quot;Find a Coach&quot;) — public profiles of ICF
                members
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
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-semibold tracking-tight">
              3. What personal data do we process?
            </h3>
            <p className="text-foreground/80">
              We process the following categories of personal data:
            </p>

            <div className="space-y-4">
              <h4 className="text-base font-semibold tracking-tight">
                a) Technical data (all website visitors)
              </h4>
              <p className="text-foreground/80">
                When you visit our website, we and our hosting platform Lovable automatically
                process technical data that your browser transmits:
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
                <ExternalLink href="https://lovable.dev/privacy">
                  Lovable&apos;s Privacy Policy
                </ExternalLink>
                . Lovable retains this log data for up to 90 days.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="text-base font-semibold tracking-tight">b) Contact and enquiry data</h4>
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
              <h4 className="text-base font-semibold tracking-tight">
                c) Newsletter subscription data
              </h4>
              <p className="text-foreground/80">
                When you subscribe to our newsletter via the website, we process:
              </p>
              <ul className="list-disc space-y-1 pl-5 text-foreground/80">
                <li>Email address</li>
                <li>Subscription date and status</li>
                <li>
                  [Confirm: any additional fields collected at signup, e.g., name, interests]
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-base font-semibold tracking-tight">d) Member account data</h4>
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
              <h4 className="text-base font-semibold tracking-tight">
                e) Coach directory profile data
              </h4>
              <p className="text-foreground/80">
                For members whose profiles appear in the public &quot;Find a Coach&quot; directory, we
                process and publish:
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
              <InfoCallout>
                <p>
                  <strong>Item to confirm before publishing:</strong> Verify the exact opt-in /
                  opt-out mechanism for directory profile visibility. Do members explicitly consent
                  to publication, is it a default that can be deactivated, or is it tied to ICF
                  membership status? The privacy policy must accurately describe the actual
                  mechanism. Mark this section with the confirmed behaviour before publishing.
                </p>
              </InfoCallout>
            </div>

            <div className="space-y-4">
              <h4 className="text-base font-semibold tracking-tight">f) Event registration data</h4>
              <p className="text-foreground/80">When you register for an event, we process:</p>
              <ul className="list-disc space-y-1 pl-5 text-foreground/80">
                <li>Name</li>
                <li>Email address</li>
                <li>
                  [Confirm: additional registration fields, e.g., organisation, dietary
                  requirements, accessibility needs]
                </li>
                <li>Registration status and payment information, if applicable</li>
              </ul>
              <InfoCallout>
                <p>
                  <strong>Sensitive data in event registration:</strong> If dietary requirements or
                  accessibility needs are collected, these may reveal information about health,
                  religion, or other sensitive personal data under Art. 5 lit. c DSG. If collected,
                  the following must apply: the fields are voluntary, used solely for event
                  organisation, access-restricted to event organisers, and deleted shortly after
                  the event unless retention is legally required. This should be explicitly stated
                  in the final policy.
                </p>
              </InfoCallout>
            </div>

            <div className="space-y-4">
              <h4 className="text-base font-semibold tracking-tight">g) Staff and CMS user data</h4>
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
              <h4 className="text-base font-semibold tracking-tight">
                h) Data from ICF Global integration
              </h4>
              <p className="text-foreground/80">
                We receive member data from the International Coaching Federation (ICF Global)
                through an automated nightly synchronisation. This includes:
              </p>
              <ul className="list-disc space-y-1 pl-5 text-foreground/80">
                <li>Member identification data</li>
                <li>Membership status and credentials</li>
                <li>[Confirm: the exact data fields received from ICF Global]</li>
              </ul>
              <p className="text-foreground/80">
                This data is processed to maintain accurate member records and directory profiles.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-semibold tracking-tight">
              4. For what purposes and on what legal basis do we process your data?
            </h3>
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
              <h4 className="text-base font-semibold tracking-tight">
                Legal framework under Swiss law
              </h4>
              <p className="text-foreground/80">
                Under the Swiss Data Protection Act (DSG), the processing of personal data by
                private parties is generally permissible as long as it complies with the principles
                of Art. 6 DSG (lawfulness, good faith, proportionality, purpose limitation,
                transparency, data accuracy, and data security) and does not violate the personality
                rights of the data subject.
              </p>
              <p className="text-foreground/80">
                Where processing could infringe personality rights, it may be justified by:
              </p>
              <ul className="list-disc space-y-1 pl-5 text-foreground/80">
                <li>the data subject&apos;s consent,</li>
                <li>a legal obligation, or</li>
                <li>an overriding private or public interest (Art. 31 DSG).</li>
              </ul>
              <p className="text-foreground/80">
                For the processing activities described above:
              </p>
              <ul className="list-disc space-y-1 pl-5 text-foreground/80">
                <li>
                  <strong>Newsletter subscriptions</strong> are based on your active consent. You may
                  unsubscribe at any time.
                </li>
                <li>
                  <strong>Coach directory profiles</strong> are published as part of the member&apos;s
                  participation in the association, subject to the member&apos;s visibility settings.
                  [Confirm: the exact consent / opt-in mechanism]
                </li>
                <li>
                  <strong>Technical data processing</strong> is necessary for the operation and
                  security of the website.
                </li>
                <li>
                  <strong>Member data and ICF Global integration</strong> serve the fulfilment of the
                  membership relationship and the association&apos;s purpose.
                </li>
                <li>
                  <strong>Event registration data</strong> is processed to organise events and
                  manage participation.
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-base font-semibold tracking-tight">Where the GDPR also applies</h4>
              <p className="text-foreground/80">
                Where the processing also affects individuals in the European Economic Area and the
                GDPR applies, the relevant legal bases include: consent (Art. 6 para. 1 lit. a
                GDPR), contractual necessity (Art. 6 para. 1 lit. b GDPR), legal obligation (Art. 6
                para. 1 lit. c GDPR), and legitimate interests (Art. 6 para. 1 lit. f GDPR).
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold tracking-tight">
              4a. Where do we obtain your personal data from?
            </h3>
            <p className="text-foreground/80">
              We obtain personal data from the following sources:
            </p>
            <ul className="list-disc space-y-1 pl-5 text-foreground/80">
              <li>
                <strong>Directly from you</strong> — when you contact us, subscribe to the
                newsletter, register for an event, create or manage a member account, or edit your
                coach directory profile.
              </li>
              <li>
                <strong>From ICF Global</strong> — through the automated nightly member data
                synchronisation (see Section 3h).
              </li>
              <li>
                <strong>From technical systems</strong> — technical data collected automatically
                when you visit the website (see Section 3a).
              </li>
              <li>
                <strong>From service providers</strong> — [Confirm: if any data is received from
                event platforms, payment providers, or other third-party services.]
              </li>
            </ul>
            <p className="text-foreground/80">
              Where we obtain personal data that was not collected directly from you (Art. 19 para.
              3 DSG), we inform you about the source of the data and the categories of data
              processed.
            </p>
          </div>

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
                  The Switzerland Chapter of ICF. Personal data stored in Supabase is processed under
                  Lovable&apos;s data processing agreement. Data residency: Europe (Ireland) — the
                  Lovable Cloud project is configured to store data in the EU (Ireland) region. The
                  EU/EEA is recognised as having an adequate level of data protection under Swiss law.
                </li>
                <li>
                  <strong>Cloudflare</strong> — provides the edge runtime and content delivery network
                  (CDN) for the current website deployment. The site is being migrated from
                  Cloudflare to Lovable. [Confirm: whether Cloudflare services (CDN, WAF, DNS) will
                  remain in front of the Lovable deployment or will be fully retired after migration.
                  If retained, list which Cloudflare services remain and their data processing
                  locations.]
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-base font-semibold tracking-tight">
                b) Website platform and hosting — Lovable
              </h4>
              <p className="text-foreground/80">
                The Switzerland Chapter of ICF website is hosted and operated on the{" "}
                <strong>Lovable</strong> platform (Lovable Labs Incorporated, a US company).
                Lovable provides the web application hosting, development tools, and deployment
                infrastructure for coachingfederation.ch. The site is being migrated from a
                previous Cloudflare-based deployment to Lovable.
              </p>
              <p className="text-foreground/80">
                Lovable processes personal data as a <strong>data processor</strong> on behalf of The
                Switzerland Chapter of ICF. Key details from{" "}
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
                  <strong>DPO contact:</strong>{" "}
                  <MailLink address="dpo@lovable.dev" />
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
                  Customer Data — including the website&apos;s database, authentication, file storage,
                  and application data — on Supabase infrastructure. Supabase is a sub-processor of
                  Lovable, accessed through Lovable Cloud. The Switzerland Chapter of ICF does not
                  have a direct contractual relationship with Supabase. If Lovable&apos;s AI Gateway is
                  used, data may also be transmitted to third-party AI providers (OpenAI, Google
                  Gemini, models via OpenRouter).
                </li>
                <li>
                  <strong>Sub-processors:</strong> Lovable engages sub-processors including Supabase
                  (hosting), Stripe (payments), PostHog and Google Analytics (analytics for the
                  Lovable platform), TikTok, Facebook/Meta, and Google Ads (marketing for the
                  Lovable platform). The full list is available at{" "}
                  <ExternalLink href="https://trust.lovable.dev">trust.lovable.dev</ExternalLink>.
                </li>
                <li>
                  <strong>International transfers:</strong> Lovable may transfer Personal Data to the
                  United States. Lovable safeguards these transfers through EU Standard Contractual
                  Clauses (Module 2, Controller-to-Processor), the UK International Data Transfer
                  Addendum, and a Swiss Addendum adapting the SCCs to the revised Swiss FADP,
                  naming the FDPIC as the competent authority.
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
                    <strong>Migration status</strong> — Confirm whether the migration from Cloudflare
                    to Lovable is complete. During the transition, both platforms may process data.
                    Update the privacy policy to reflect the final production setup once migration is
                    complete.
                  </li>
                  <li>
                    <strong>Lovable Cloud vs. direct Supabase</strong> — Confirmed: Supabase is
                    accessed through Lovable Cloud. Supabase is a sub-processor of Lovable, and The
                    Switzerland Chapter of ICF does not have a direct contractual relationship with
                    Supabase. Data residency: Europe (Ireland) — the EU/EEA is recognised as adequate
                    under Swiss law.
                  </li>
                  <li>
                    <strong>AI Gateway</strong> — Confirm whether Lovable&apos;s AI Gateway is used on the
                    live site. If so, data may be transmitted to OpenAI, Google, and OpenRouter.
                  </li>
                  <li>
                    <strong>Lovable cookies on live site</strong> — Conduct a cookie audit on the live
                    coachingfederation.ch site once migrated to Lovable to determine whether any
                    Lovable platform cookies (PostHog, Google Analytics, TikTok, Facebook/Meta,
                    Google Ads) are present.
                  </li>
                  <li>
                    <strong>Cloudflare retirement</strong> — If Cloudflare is being retired, confirm
                    that no Cloudflare services remain active (CDN, WAF, DNS) or list which
                    Cloudflare services are still used in front of the Lovable deployment.
                  </li>
                  <li>
                    <strong>Sub-processor review</strong> — Review Lovable&apos;s full sub-processor list at{" "}
                    <ExternalLink href="https://trust.lovable.dev">
                      https://trust.lovable.dev
                    </ExternalLink>{" "}
                    and ensure alignment with The Switzerland Chapter of ICF&apos;s data processing needs.
                  </li>
                  <li>
                    <strong>DPA</strong> — Ensure a Data Processing Agreement is in place with Lovable.
                    If on a Free/Pro plan, request a DPA or upgrade to a plan that includes one.
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
                Plausible, Fathom, Vercel Analytics, or other. If none are used, state &quot;We do not
                use third-party analytics or tracking tools.&quot; If any are used, list the provider,
                what data is collected, and the processing location.]
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="text-base font-semibold tracking-tight">e) ICF Global</h4>
              <p className="text-foreground/80">
                Member data is exchanged with ICF Global through an automated integration. This
                includes receiving member data from ICF Global and potentially sending profile updates
                back. [Confirm: the direction of data flow and the specific data shared with ICF
                Global, and where ICF Global processes this data.]
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
                Fonts are self-hosted (Quicksand for headlines, Plus Jakarta Sans for body text) — no
                external font requests are made.
              </p>
              <p className="text-foreground/80">
                The following third-party services may be used on the website:
              </p>
              <ul className="list-disc space-y-1 pl-5 text-foreground/80">
                <li>[Confirm: Embedded maps (e.g., Google Maps, Mapbox)]</li>
                <li>[Confirm: Video embeds (e.g., YouTube, Vimeo)]</li>
                <li>[Confirm: Social media embeds or plugins (e.g., LinkedIn, X/Twitter, Facebook)]</li>
                <li>
                  [Confirm: CAPTCHA / bot protection (e.g., Google reCAPTCHA, hCaptcha, Cloudflare
                  Turnstile)]
                </li>
                <li>[Confirm: Image services (e.g., Unsplash API used by the CMS image picker)]</li>
                <li>[Confirm: Newsletter tracking pixels (open / click tracking)]</li>
              </ul>
              <p className="text-foreground/80">
                <strong>Note on analytics:</strong> No analytics or tracking tools were detected on the
                Lovable-hosted demo as of July 2026. If analytics are added before launch, they must
                be listed here with their data processing details. Lovable&apos;s own platform analytics
                (PostHog, Google Analytics, TikTok, Facebook/Meta, Google Ads) apply to the Lovable
                editor at lovable.dev, not to visitors of coachingfederation.ch — unless Lovable
                injects tracking into deployed sites. [Confirm: whether Lovable injects any
                platform-level tracking into deployed sites.]
              </p>
              <p className="text-foreground/80">We do not sell personal data to third parties.</p>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-semibold tracking-tight">
              6. Is data transferred outside Switzerland?
            </h3>
            <p className="text-foreground/80">
              Personal data processed in connection with our website may be transferred outside
              Switzerland. The following transfers are known or expected:
            </p>
            <p className="text-foreground/80">
              <strong>Customer data</strong> (member accounts, coach profiles, event registrations,
              newsletter subscriptions) is stored in Supabase&apos;s Europe (Ireland) region via Lovable
              Cloud. The EU/EEA is recognised as having an adequate level of data protection under
              Swiss law (Art. 16 para. 1 DSG), so no additional safeguards are required for this
              storage.
            </p>
            <p className="text-foreground/80">
              However, Lovable Labs Inc. (a US company) has processor access to this data, and
              Lovable&apos;s Service Data (technical logs, usage telemetry) is processed in the United
              States. These transfers are covered by the safeguards listed below.
            </p>
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
                  "Contractual obligations equivalent to Lovable&apos;s DPAs",
                ],
                [
                  "Supabase (via Lovable Cloud)",
                  "Europe (Ireland)",
                  "Sub-processor of Lovable; covered by Lovable&apos;s DPA. EU/EEA recognised as adequate under Swiss DSG",
                ],
                [
                  "Cloudflare (if retained post-migration)",
                  "Global network",
                  "[Confirm: transfer mechanism]",
                ],
                ["Newsletter/email provider", "[Confirm]", "[Confirm]"],
                ["ICF Global", "[Confirm]", "[Confirm]"],
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
            <InfoCallout>
              <p>
                <strong>Item to confirm before publishing:</strong> The specific countries to which
                personal data may be transferred must be listed here, along with the safeguards
                applied for each transfer. Key services to verify:
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Supabase: data residency region</li>
                <li>Cloudflare: data processing locations and any applicable transfer mechanisms</li>
                <li>
                  Lovable (if still active): transfers to the United States; Lovable uses EU SCCs
                  (Module 2), UK Addendum, and Swiss Addendum — see{" "}
                  <ExternalLink href="https://lovable.dev/privacy">
                    Lovable Privacy Policy
                  </ExternalLink>
                </li>
                <li>
                  Lovable sub-processors: review the list at{" "}
                  <ExternalLink href="https://trust.lovable.dev">
                    https://trust.lovable.dev
                  </ExternalLink>{" "}
                  for additional transfer locations
                </li>
                <li>Newsletter/email provider: processing location</li>
                <li>Analytics provider (if any): processing location</li>
                <li>ICF Global: where member data is stored and processed</li>
                <li>Payment provider (if any): processing location</li>
              </ul>
            </InfoCallout>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-semibold tracking-tight">
              7. How long do we store your data?
            </h3>
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
                  "[Confirm: e.g., 30–90 days for access logs; longer for security logs]",
                ],
                [
                  "Contact enquiries",
                  "For the duration of the enquiry and [Confirm: e.g., 12 months] thereafter for follow-up",
                ],
                [
                  "Newsletter subscriptions",
                  "Until you unsubscribe; suppression list retained to prevent re-subscription without consent",
                ],
                [
                  "Member account data",
                  "For the duration of ICF membership; deleted or anonymised [Confirm: e.g., 30 days] after membership ends",
                ],
                [
                  "Coach directory profiles",
                  "For as long as the member maintains a public profile; removed when the member deactivates their profile or membership ends",
                ],
                [
                  "Event registration data",
                  "For the duration of the event and [Confirm: e.g., 12 months] thereafter for accounting and follow-up",
                ],
                [
                  "CMS/staff user data",
                  "For the duration of the user&apos;s role; deleted [Confirm: e.g., 30 days] after access is revoked",
                ],
                [
                  "ICF Global integration data",
                  "Synchronised nightly; retained according to membership status",
                ],
              ]}
            />
            <p className="text-foreground/80">
              Where legal or regulatory obligations require longer retention (e.g., accounting
              records under Swiss tax and commercial law), data is retained for the legally required
              period.
            </p>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-semibold tracking-tight">
              8. Cookies and similar technologies
            </h3>
            <p className="text-foreground/80">
              Our website uses cookies and similar technologies for technical purposes. The EDÖB
              provides guidance on the use of cookies and similar technologies under the DSG and the
              Telecommunications Act (TCA) ({" "}
              <ExternalLink href="https://www.edoeb.admin.ch/dam/de/sd-web/brLL9rM3ny9d/Leitfaden%20des%20ED%C3%96B%20betreffend%20Datenbearbeitungen%20mittels%20Cookies%20und%20%C3%A4hnlichen%20Technologien%20V.%201.1%20vom%2006.10.2025_DE.pdf">
                EDÖB cookie guidelines
              </ExternalLink>
              ).
            </p>
            <InfoCallout>
              <p>
                <strong>Item to confirm before publishing:</strong> Some features described in this
                privacy policy may be gated or not yet active at launch (e.g., member account
                claiming, member-facing email). The final published policy must accurately reflect
                only the features that are live. Remove or adjust sections for features that are not
                yet active. The EDÖB warns against vague formulations such as &quot;we may process data
                in such or such a way&quot; — the policy must match actual data processing.
              </p>
            </InfoCallout>

            <h4 className="text-base font-semibold tracking-tight">Cookies we use</h4>
            <Table
              headers={["Cookie / technology", "Purpose", "Duration", "Consent"]}
              rows={[
                [
                  "[Confirm: Session cookies]",
                  "Essential for website functionality (e.g., login, language selection)",
                  "Session",
                  "Not required",
                ],
                [
                  "[Confirm: Authentication cookies]",
                  "User login and session management",
                  "[Confirm: duration]",
                  "Not required",
                ],
                [
                  "[Confirm: Analytics cookies]",
                  "[Confirm: if analytics are added before launch]",
                  "[Confirm: duration]",
                  "May be required depending on configuration and applicable law; The Switzerland Chapter of ICF will request consent where required",
                ],
                [
                  "[Confirm: Any other cookies]",
                  "[Confirm: purpose]",
                  "[Confirm: duration]",
                  "[Confirm]",
                ],
              ]}
            />

            <h4 className="text-base font-semibold tracking-tight">Managing cookies</h4>
            <p className="text-foreground/80">
              You can control and delete cookies through your browser settings. Please note that
              disabling essential cookies may affect the functionality of the website.
            </p>
            <InfoCallout>
              <p>
                <strong>Item to confirm before publishing:</strong> A complete cookie audit must be
                conducted to list all cookies and similar technologies actually set by the website,
                including those set by third-party services. If consent is required for non-essential
                cookies, a consent management mechanism must be implemented and described here.
              </p>
            </InfoCallout>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold tracking-tight">
              9. What are your data protection rights?
            </h3>
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
                <strong>Right to rectification (Recht auf Berichtigung)</strong> — You may request
                the correction of inaccurate or incomplete personal data (Art. 32 DSG).
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
                <ExternalLink href="https://www.edoeb.admin.ch">www.edoeb.admin.ch</ExternalLink>
              </p>
            </div>
            <p className="text-foreground/80">
              To exercise any of these rights, please contact us at{" "}
              <MailLink address="office@coachingfederation.ch" />. We will respond to your request
              within 30 days. In complex cases, this period may be extended; we will inform you of any
              extension and the reasons for it.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold tracking-tight">
              10. Automated individual decisions
            </h3>
            <p className="text-foreground/80">
              We do not make decisions based solely on automated processing that produce legal
              effects or significantly affect you (Art. 21 DSG). In particular:
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
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold tracking-tight">11. How do we protect your data?</h3>
            <p className="text-foreground/80">
              We implement appropriate technical and organisational measures to protect personal data
              against unauthorised access, loss, destruction, or alteration. These measures include:
            </p>
            <ul className="list-disc space-y-1 pl-5 text-foreground/80">
              <li>Encrypted data transmission (TLS/SSL)</li>
              <li>Role-based access controls and authentication</li>
              <li>Regular security reviews of our systems</li>
              <li>Data stored in a managed database with row-level security policies</li>
              <li>
                [Confirm: any additional specific security measures, e.g., penetration testing, audit
                certifications, incident response procedures]
              </li>
            </ul>
            <p className="text-foreground/80">
              If a data breach occurs that is likely to result in a high risk to your rights and
              freedoms, we will notify the FDPIC (EDÖB) as soon as possible, in accordance with Art.
              24 DSG.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold tracking-tight">12. Data of children</h3>
            <p className="text-foreground/80">
              Our website is not directed at children under 16. We do not knowingly collect personal
              data from children under 16. If you believe we have collected personal data from a
              child, please contact us and we will take steps to delete the data.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold tracking-tight">
              13. Changes to this privacy policy
            </h3>
            <p className="text-foreground/80">
              We may update this privacy policy from time to time to reflect changes in our data
              processing practices, legal requirements, or the services we offer. The current
              version will always be available on this page. We recommend that you review this page
              periodically.
            </p>
            <p className="text-foreground/80">
              The date of the last update will be indicated at the bottom of this page.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold tracking-tight">14. Contact</h3>
            <p className="text-foreground/80">
              If you have any questions about this privacy policy or our data processing practices,
              please contact:
            </p>
            <div className="rounded-2xl border border-border/70 bg-card p-6 text-foreground/80">
              <p className="font-semibold text-foreground">The Switzerland Chapter of ICF</p>
              <p className="mt-2">Weitegasse 6</p>
              <p>9320 Arbon</p>
              <p>Switzerland</p>
              <p className="mt-2">
                Email: <MailLink address="office@coachingfederation.ch" />
              </p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">Last updated: [Date of publication]</p>
        </section>

        <hr className="border-border/70" />

        <section className="space-y-8">
          <h2 className="text-2xl font-bold tracking-tight">
            Appendix: Items to confirm before publishing
          </h2>
          <p className="text-foreground/80">
            The following items are marked with [Confirm:] placeholders throughout this document. They
            must be verified and completed before the privacy policy is published:
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
                listed as responsible for content in the Imprint? Currently, &quot;The Board&quot; is used
                generically.
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
                <strong>Cloudflare — migration status</strong> — The site is migrating from Cloudflare
                to Lovable. Confirm whether Cloudflare services (CDN, WAF, DNS) will remain in front
                of the Lovable deployment or be fully retired. If retained, list which services
                remain and their data processing locations.
              </li>
              <li>
                <strong>Newsletter/email provider</strong> — Confirm which service is used for the
                newsletter signup visible in the website footer. Name the provider and its data
                processing location.
              </li>
              <li>
                <strong>Analytics/tracking</strong> — Confirm whether any analytics or tracking tools
                are used on the live coachingfederation.ch site, including any inherited from
                Lovable&apos;s platform (PostHog, Google Analytics, TikTok, Facebook/Meta, Google Ads). If
                none are used, state &quot;We do not use third-party analytics or tracking tools.&quot;
              </li>
              <li>
                <strong>Payment provider</strong> — If event registrations or other services involve
                payments, name the payment provider (e.g., Stripe, PayPal, TWINT) and its processing
                location. Note: Lovable uses Stripe as a sub-processor for its own billing.
              </li>
              <li>
                <strong>ICF Global data flow</strong> — Confirm the exact data fields exchanged with
                ICF Global, the direction of data flow, and where ICF Global stores and processes this
                data.
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
                    Whether Lovable&apos;s AI Gateway is used on the live site (transmits data to OpenAI,
                    Google, OpenRouter)
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
                <strong>Embedded third-party services</strong> — As of July 2026, no analytics, social
                media embeds, maps, video embeds, or CAPTCHA services were detected on the demo.
                Fonts are self-hosted (Quicksand + Plus Jakarta Sans). Verify whether any additional
                third-party services are added before launch (maps, videos, social plugins,
                CAPTCHA, Unsplash API, newsletter tracking pixels).
              </li>
              <li>
                <strong>Gated / inactive features</strong> — Confirm which features are actually live
                at launch (the repo notes that member account claiming and member-facing email are
                &quot;built but gated off&quot;). Remove or adjust privacy policy sections for features that
                are not yet active.
              </li>
              <li>
                <strong>Cookie consent banner</strong> — No cookie consent mechanism was detected on
                the Lovable-hosted demo. Fonts are self-hosted, removing the primary driver for
                consent. A consent banner should still be implemented before launch if any
                non-essential cookies are used. Conduct a final cookie audit once the site is live on
                Lovable.
              </li>
              <li>
                <strong>Footer legal links</strong> — The demo site already has disabled &quot;Privacy&quot;,
                &quot;Imprint&quot;, and &quot;Code of Ethics&quot; links in the footer (marked &quot;Coming soon&quot;). Ensure
                these link to the published pages once the content is finalized.
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
                <strong>Event registration fields</strong> — The demo shows events with date, location,
                language, and topic. Confirm all fields collected during event registration (name,
                email, organisation, dietary requirements, accessibility, etc.).
              </li>
              <li>
                <strong>ICF Global integration fields</strong> — Confirm the exact data fields received
                in the nightly sync.
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
                <strong>CMS/staff data</strong> — Confirm the retention period after access is revoked.
              </li>
            </ol>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold tracking-tight">E. Cookies</h3>
            <ol className="list-decimal space-y-2 pl-5 text-foreground/80">
              <li>
                <strong>Cookie audit</strong> — Conduct a complete audit of all cookies and similar
                technologies set by the website and any third-party services once the site is live on
                Lovable. As of the July 2026 demo, no third-party cookies or tracking were detected
                and fonts are self-hosted. List all cookies in the cookie table in Section 8.
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
                <strong>Association statutes</strong> — Verify that the data processing described here
                aligns with the association&apos;s statutes (Statuten) regarding member data, as the
                board is responsible under association law.
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
      </div>
    </LegalPageShell>
  );
}
