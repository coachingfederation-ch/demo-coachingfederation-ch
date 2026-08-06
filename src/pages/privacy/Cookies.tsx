/**
 * Privacy policy section 8: cookies and similar technologies.
 * Exports: CookiesSection. Rendered by src/pages/Privacy.tsx inside the Privacy Policy section.
 */
import { ExternalLink, InfoCallout, Table } from "./shared";

export function CookiesSection() {
  return (
    <>
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
            privacy policy may be gated or not yet active at launch (e.g., member account claiming,
            member-facing email). The final published policy must accurately reflect only the
            features that are live. Remove or adjust sections for features that are not yet active.
            The EDÖB warns against vague formulations such as &quot;we may process data in such or
            such a way&quot; — the policy must match actual data processing.
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
    </>
  );
}
