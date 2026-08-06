/**
 * Privacy policy section 3: categories of personal data processed.
 * Exports: DataProcessingSection. Rendered by src/pages/Privacy.tsx inside the Privacy Policy section.
 */
import { ExternalLink, InfoCallout } from "./shared";

export function DataProcessingSection() {
  return (
    <>
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
              <h4 className="text-base font-semibold tracking-tight">
                b) Contact and enquiry data
              </h4>
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
                <li>[Confirm: any additional fields collected at signup, e.g., name, interests]</li>
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
                For members whose profiles appear in the public &quot;Find a Coach&quot; directory,
                we process and publish:
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
                  organisation, access-restricted to event organisers, and deleted shortly after the
                  event unless retention is legally required. This should be explicitly stated in
                  the final policy.
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

    </>
  );
}
