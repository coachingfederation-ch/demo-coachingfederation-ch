/**
 * Imprint section of the Privacy page (provider, address, contact, legal notices).
 * Exports: ImprintSection. Rendered by src/pages/Privacy.tsx inside the Privacy Policy section.
 */
import { ExternalLink, MailLink } from "./shared";

export function ImprintSection() {
  return (
    <>
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
            The content of this website has been prepared with the greatest possible care. However,
            The Switzerland Chapter of ICF does not guarantee the accuracy, completeness, or
            timeliness of the information provided. Liability claims against The Switzerland Chapter
            of ICF arising from material or immaterial damage caused by the use or non-use of the
            information provided or by the use of incorrect or incomplete information are excluded,
            to the extent permitted by Swiss law.
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
            The content and works published on this website — including text, images, graphics, and
            design elements — are subject to Swiss copyright law. Reproduction, processing,
            distribution, and any form of commercial use of the content beyond the scope of
            copyright law require the written consent of The Switzerland Chapter of ICF or the
            respective copyright holder, where applicable.
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold tracking-tight">Applicable law</h3>
          <p className="text-foreground/80">
            This imprint and all legal relations arising from the use of this website are subject to
            Swiss law.
          </p>
        </div>
      </section>
    </>
  );
}
