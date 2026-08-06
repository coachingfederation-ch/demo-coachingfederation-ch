/**
 * Privacy policy section 6: international data transfers outside Switzerland.
 * Exports: DataTransfersSection. Rendered by src/pages/Privacy.tsx inside the Privacy Policy section.
 */
import { ExternalLink, InfoCallout, Table } from "./shared";

export function DataTransfersSection() {
  return (
    <>
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
              newsletter subscriptions) is stored in Supabase&apos;s Europe (Ireland) region via
              Lovable Cloud. The EU/EEA is recognised as having an adequate level of data protection
              under Swiss law (Art. 16 para. 1 DSG), so no additional safeguards are required for
              this storage.
            </p>
            <p className="text-foreground/80">
              However, Lovable Labs Inc. (a US company) has processor access to this data, and
              Lovable&apos;s Service Data (technical logs, usage telemetry) is processed in the
              United States. These transfers are covered by the safeguards listed below.
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
                <li>
                  Cloudflare: data processing locations and any applicable transfer mechanisms
                </li>
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

    </>
  );
}
