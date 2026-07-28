import { LegalPageShell } from "./LegalPageShell";

export default function ImprintPage() {
  return (
    <LegalPageShell pageKey="imprint">
      <section className="space-y-8">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">Provider</h2>
          <div className="space-y-2 text-foreground/80">
            <p className="font-semibold text-foreground">
              International Coach Federation (ICF) Switzerland
            </p>
            <p>Switzerland Chapter of ICF</p>
            <p>Legal form: Association (Verein) under Swiss law</p>
            <p>UID: CHE-205.048.647</p>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">Address</h2>
          <address className="not-italic text-foreground/80">
            Weitegasse 6
            <br />
            9320 Arbon
            <br />
            Switzerland
          </address>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">Contact</h2>
          <div className="space-y-2 text-foreground/80">
            <p>
              Email:{" "}
              <a
                href="mailto:office@coachingfederation.ch"
                className="text-primary underline underline-offset-4 hover:text-primary/80"
              >
                office@coachingfederation.ch
              </a>
            </p>
            <p>
              Website:{" "}
              <a
                href="https://www.coachingfederation.ch"
                className="text-primary underline underline-offset-4 hover:text-primary/80"
              >
                www.coachingfederation.ch
              </a>
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">Responsible for content</h2>
          <p className="text-foreground/80">
            The Board of International Coach Federation (ICF) Switzerland is responsible for the
            content of this website in accordance with Swiss law.
          </p>
          <p className="text-foreground/80">
            Contact:{" "}
            <a
              href="mailto:office@coachingfederation.ch"
              className="text-primary underline underline-offset-4 hover:text-primary/80"
            >
              office@coachingfederation.ch
            </a>
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">Liability for content</h2>
          <p className="text-foreground/80">
            The content of this website has been prepared with the greatest possible care. However,
            ICF Switzerland does not guarantee the accuracy, completeness, or timeliness of the
            information provided. Liability claims against ICF Switzerland arising from material or
            immaterial damage caused by the use or non-use of the information provided or by the use
            of incorrect or incomplete information are excluded, to the extent permitted by Swiss
            law.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">Liability for links</h2>
          <p className="text-foreground/80">
            This website may contain links to external third-party websites over whose content ICF
            Switzerland has no influence. ICF Switzerland therefore accepts no liability for the
            content of external sites. The respective provider or operator of the linked sites is
            always responsible for their content.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">Copyright</h2>
          <p className="text-foreground/80">
            The content and works published on this website — including text, images, graphics, and
            design elements — are subject to Swiss copyright law. Reproduction, processing,
            distribution, and any form of commercial use of the content beyond the scope of
            copyright law require the written consent of ICF Switzerland or the respective copyright
            holder, where applicable.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">Applicable law</h2>
          <p className="text-foreground/80">
            This imprint and all legal relations arising from the use of this website are subject to
            Swiss law.
          </p>
        </div>
      </section>
    </LegalPageShell>
  );
}
