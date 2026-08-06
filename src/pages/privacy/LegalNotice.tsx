/**
 * Top intro section of the Privacy page: title and draft-status callout.
 * Exports: LegalNoticeSection. Rendered by src/pages/Privacy.tsx inside the Privacy Policy section.
 */
import { ExternalLink, InfoCallout } from "./shared";

export function LegalNoticeSection() {
  return (
    <>
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
              <ExternalLink href="https://trust.lovable.dev">
                Lovable sub-processor list
              </ExternalLink>
              .
            </p>
          </InfoCallout>
        </section>
    </>
  );
}
