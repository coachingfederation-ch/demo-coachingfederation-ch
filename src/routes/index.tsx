import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import heroImg from "@/assets/hero-coaching.jpg";
import leadershipImg from "@/assets/leadership-team.jpg";
import conversationImg from "@/assets/real-conversation.jpg";
import ensoImg from "@/assets/enso.png";
import icfLogo from "@/assets/icf-switzerland-charter-chapter.png.asset.json";

export const Route = createFileRoute("/")({
  component: Index,
});

const CARD_SHADOW =
  "shadow-[0_1px_2px_rgba(20,20,60,0.04),0_8px_20px_-14px_rgba(20,20,60,0.08)]";

function Logo({ variant = "hero" }: { variant?: "hero" | "footer" }) {
  return (
    <Link to="/" aria-label="ICF Switzerland home" className="inline-flex">
      <img
        src={icfLogo.url}
        alt="ICF Switzerland Charter Chapter"
        className={variant === "hero" ? "h-20 w-auto -ml-3 -mt-2" : "h-10 w-auto"}
      />
    </Link>
  );
}

function HeroHeader() {
  const items = ["Find a Coach", "For Organisations", "For Coaches", "Insights", "Events", "About"];
  const langs = ["en", "de", "fr", "it"];
  return (
    <header className="bg-hero text-hero-foreground">
      <div className="mx-auto max-w-7xl px-8 pt-6 pb-16">
        <div className="mb-10 flex flex-wrap items-start justify-between gap-4">
          <Logo />
          <div className="flex flex-wrap items-center gap-3">
            <nav
              aria-label="Primary"
              className="hidden items-center rounded-full bg-white/10 p-1 text-[11px] font-semibold lg:inline-flex"
            >
              {items.map((i, idx) => (
                <a
                  key={i}
                  href="#"
                  className={
                    "inline-flex h-7 items-center rounded-full px-3 transition " +
                    (idx === 0
                      ? "bg-white text-primary shadow-sm"
                      : "text-white/80 hover:text-white")
                  }
                >
                  {i}
                </a>
              ))}
            </nav>
            <div
              role="group"
              aria-label="Language"
              className="inline-flex items-center rounded-full bg-white/10 p-0.5 text-[11px] font-semibold"
            >
              {langs.map((l, i) => (
                <button
                  key={l}
                  className={
                    "inline-flex h-6 items-center rounded-full px-2.5 uppercase tracking-wider " +
                    (i === 0 ? "bg-white text-primary shadow-sm" : "text-white/80")
                  }
                >
                  {l}
                </button>
              ))}
            </div>
            <a
              href="#"
              className="inline-flex h-8 items-center rounded-full bg-accent px-4 text-[11px] font-semibold uppercase tracking-wider text-accent-foreground transition hover:opacity-90"
            >
              Find a Coach
            </a>
          </div>
        </div>

        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <div className="max-w-2xl">
            <p className="eyebrow !text-accent">ICF Switzerland · Charter Chapter</p>
            <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl">
              Building a more <span className="text-accent">human</span> future through
              professional coaching.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/75">
              Professional coaching helps individuals, leaders and organisations navigate
              complexity with greater clarity, confidence and purpose.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#find-a-coach"
                className="inline-flex h-10 items-center rounded-full bg-white px-5 text-sm font-semibold text-primary transition hover:bg-white/90"
              >
                Find a coach →
              </a>
              <a
                href="#organisations"
                className="inline-flex h-10 items-center rounded-full border border-white/30 px-5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                For organisations
              </a>
            </div>
          </div>
          <div className="relative">
            <img
              src={heroImg}
              alt="Two professionals in a coaching conversation"
              width={1600}
              height={1200}
              className="aspect-[5/4] w-full rounded-2xl object-cover"
            />
            <img
              src={ensoImg}
              alt=""
              aria-hidden
              className="pointer-events-none absolute -right-8 -top-10 h-40 w-40 opacity-40"
            />
          </div>
        </div>
      </div>
    </header>
  );
}

const audiences = [
  { eyebrow: "I'm looking for", title: "A Coach", desc: "Find a trusted ICF credentialed coach.", cta: "Find a Coach" },
  { eyebrow: "I represent", title: "An Organisation", desc: "Discover how coaching develops leaders and organisations.", cta: "For Organisations" },
  { eyebrow: "I am", title: "A Coach", desc: "Grow your practice through community, learning and professional standards.", cta: "For Coaches" },
  { eyebrow: "I'm curious", title: "About Coaching", desc: "Learn what coaching is and why it matters.", cta: "Discover Coaching" },
];

function Audiences() {
  return (
    <section id="find-a-coach" className="mx-auto -mt-8 max-w-7xl px-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {audiences.map((a) => (
          <a
            key={a.title + a.eyebrow}
            href="#"
            className={
              "group flex flex-col rounded-2xl border border-border/70 bg-card p-6 transition hover:-translate-y-0.5 hover:border-chip-active-border " +
              CARD_SHADOW
            }
          >
            <p className="section-label">{a.eyebrow}</p>
            <h3 className="mt-2 text-lg font-semibold tracking-tight text-foreground">{a.title}</h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{a.desc}</p>
            <span className="mt-6 text-sm font-semibold text-primary">{a.cta} →</span>
          </a>
        ))}
      </div>
    </section>
  );
}

const pillars = [
  { title: "Ethics", desc: "Bound by the ICF Code of Ethics in every engagement." },
  { title: "Credentials", desc: "ACC, PCC and MCC — earned, assessed and renewed." },
  { title: "Experience", desc: "Documented coaching hours behind every credential." },
  { title: "Development", desc: "Ongoing professional development to stay credentialed." },
];

function WhyCredentialed() {
  return (
    <section className="relative bg-muted py-24 mt-16">
      <img src={ensoImg} alt="" aria-hidden className="pointer-events-none absolute -right-16 top-10 h-72 w-72 opacity-40" />
      <div className="mx-auto max-w-7xl px-8">
        <p className="eyebrow">Why choose an ICF credentialed coach?</p>
        <div className="mt-4 grid gap-10 md:grid-cols-2 md:items-end">
          <h2 className="text-3xl font-bold leading-tight tracking-tight text-foreground md:text-4xl">
            Choosing a coach is an important decision.
          </h2>
          <p className="text-base leading-relaxed text-muted-foreground">
            ICF credentialed coaches commit to internationally recognised standards, ethics and continuous professional development.
          </p>
        </div>
        <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {pillars.map((p, i) => (
            <div key={p.title} className="relative">
              <div className="mb-5 flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent/15 btn-mono font-bold">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="text-lg font-semibold tracking-tight text-foreground">{p.title}</h3>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const themes = [
  { tag: "Future of Work", title: "How coaching prepares people for what work becomes next" },
  { tag: "Leadership", title: "Better conversations create better leaders" },
  { tag: "AI & Coaching", title: "Why trusted human conversations matter more than ever" },
  { tag: "Diversity & Inclusion", title: "Coaching that welcomes every perspective" },
];

function CoachingInAction() {
  return (
    <section className="mx-auto max-w-7xl px-8 py-24">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow">Coaching in action</p>
          <h2 className="mt-3 max-w-2xl text-3xl font-bold leading-tight tracking-tight text-foreground md:text-4xl">
            Building a more human future.
          </h2>
        </div>
        <a href="#" className="text-sm font-semibold text-primary hover:underline">Explore all insights →</a>
      </div>
      <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {themes.map((t) => (
          <a
            key={t.tag}
            href="#"
            className={
              "group flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card transition hover:-translate-y-0.5 " +
              CARD_SHADOW
            }
          >
            <div className="aspect-[4/3] w-full bg-gradient-to-br from-primary/10 via-accent/15 to-accent/30" />
            <div className="p-6">
              <p className="section-label">{t.tag}</p>
              <h3 className="mt-2 text-base font-semibold leading-snug tracking-tight text-foreground">
                {t.title}
              </h3>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

function ForOrganisations() {
  return (
    <section id="organisations" className="bg-primary text-white">
      <div className="mx-auto grid max-w-7xl gap-14 px-8 py-24 md:grid-cols-2 md:items-center">
        <div>
          <p className="eyebrow !text-accent">For organisations</p>
          <h2 className="mt-3 text-3xl font-bold leading-tight tracking-tight md:text-4xl">
            Coaching transforms organisations.
          </h2>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-white/75">
            Support leaders. Strengthen teams. Build coaching cultures that make healthier, more adaptive workplaces possible.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#" className="inline-flex h-10 items-center rounded-full bg-white px-5 text-sm font-semibold text-primary transition hover:bg-white/90">
              Talk to us
            </a>
            <a href="#" className="inline-flex h-10 items-center rounded-full border border-white/30 px-5 text-sm font-semibold text-white transition hover:bg-white/10">
              Case studies
            </a>
          </div>
        </div>
        <img
          src={leadershipImg}
          alt="Leadership team at work"
          width={1600}
          height={1200}
          loading="lazy"
          className="aspect-[5/4] w-full rounded-2xl object-cover"
        />
      </div>
    </section>
  );
}

const communities = [
  { city: "Zürich", region: "German-speaking Switzerland", langs: ["DE", "EN"] },
  { city: "Lausanne & Genève", region: "Romandie", langs: ["FR", "EN"] },
  { city: "Lugano", region: "Ticino", langs: ["IT", "EN"] },
  { city: "Online", region: "Events, mentoring & volunteering", langs: ["DE", "FR", "IT", "EN"] },
];

function Communities() {
  return (
    <section className="mx-auto max-w-7xl px-8 py-24 text-center">
      <p className="eyebrow">Communities</p>
      <h2 className="mx-auto mt-3 max-w-3xl text-3xl font-bold leading-tight tracking-tight text-foreground md:text-4xl">
        A coaching community across Switzerland.
      </h2>
      <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
        Across regions and languages, ICF Switzerland brings coaches together to learn, collaborate and contribute to the future of our profession.
      </p>
      <div className="mt-14 grid gap-4 text-left md:grid-cols-2 lg:grid-cols-4">
        {communities.map((c) => (
          <div
            key={c.city}
            className={"rounded-2xl border border-border/70 bg-card p-6 " + CARD_SHADOW}
          >
            <h3 className="text-lg font-semibold tracking-tight text-foreground">{c.city}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{c.region}</p>
            <div className="mt-6 flex flex-wrap items-center gap-2">
              {c.langs.map((l) => (
                <span
                  key={l}
                  className="inline-flex items-center rounded-full border border-border/70 bg-chip px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-chip-foreground"
                >
                  {l}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

const events = [
  { date: "Thu 17 Sep 2026", city: "Zürich", title: "Coaching Perspectives Conference 2026", tags: ["EN · DE", "Leadership"] },
  { date: "Tue 6 Oct 2026", city: "Online", title: "AI & Coaching: What Stays Human?", tags: ["EN", "Webinar"] },
  { date: "Thu 12 Nov 2026", city: "Lausanne", title: "Soirée Coaching: Bâtir une culture de coaching", tags: ["FR", "Networking"] },
];

function Events() {
  return (
    <section className="bg-muted py-24">
      <div className="mx-auto max-w-7xl px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow">Upcoming events</p>
            <h2 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-foreground md:text-4xl">
              Connect. Learn. Grow.
            </h2>
          </div>
          <a href="#" className="text-sm font-semibold text-primary hover:underline">View all events →</a>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {events.map((e) => (
            <a
              key={e.title}
              href="#"
              className={
                "group flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card transition hover:-translate-y-0.5 " +
                CARD_SHADOW
              }
            >
              <div className="flex aspect-[16/10] items-center justify-center bg-gradient-to-br from-primary/10 via-accent/20 to-accent/30">
                <span className="text-2xl font-bold tracking-tight text-primary/60">{e.city}</span>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <p className="btn-mono !text-muted-foreground">
                  {e.date} · {e.city}
                </p>
                <h3 className="mt-3 text-lg font-semibold leading-snug tracking-tight text-foreground">
                  {e.title}
                </h3>
                <div className="mt-5 flex flex-wrap items-center gap-2">
                  {e.tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center rounded-full border border-border/70 bg-chip px-2.5 py-1 text-[11px] font-semibold text-chip-foreground"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

const values = [
  { title: "Think differently", desc: "Coaching creates space to challenge assumptions and see new options." },
  { title: "Lead better", desc: "Leaders who are coached listen deeper, decide faster and grow their people." },
  { title: "Unlock potential", desc: "Individuals and teams reach for what matters most, with support and accountability." },
];

function WhyCoaching() {
  return (
    <section className="mx-auto max-w-7xl px-8 py-24">
      <div className="grid gap-14 md:grid-cols-2 md:items-center">
        <img
          src={conversationImg}
          alt="A real coaching conversation"
          width={1400}
          height={1400}
          loading="lazy"
          className="aspect-square w-full rounded-2xl object-cover"
        />
        <div>
          <p className="eyebrow">Why coaching?</p>
          <h2 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-foreground md:text-4xl">
            Better conversations create better futures.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground">
            Professional coaching empowers people to think more clearly, lead more effectively and navigate change with confidence.
          </p>
          <div className="mt-10 space-y-6">
            {values.map((v, i) => (
              <div key={v.title} className="flex gap-5 border-t border-border/70 pt-6">
                <span className="btn-mono text-lg font-bold !text-accent">
                  0{i + 1}
                </span>
                <div>
                  <h3 className="text-lg font-semibold tracking-tight text-foreground">{v.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Research() {
  return (
    <section className="mx-auto max-w-7xl px-8 py-24 text-center">
      <p className="eyebrow">Research & partnerships</p>
      <h2 className="mx-auto mt-3 max-w-3xl text-3xl font-bold leading-tight tracking-tight text-foreground md:text-4xl">
        Connecting research, practice and leadership.
      </h2>
      <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
        We work alongside universities, professional bodies, researchers and corporate partners to strengthen coaching across Switzerland.
      </p>
      <div className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-5">
        {["ETH Zürich", "HEC Lausanne", "USI Lugano", "SwissRe", "Nestlé"].map((p) => (
          <div
            key={p}
            className={
              "grid h-20 place-items-center rounded-2xl border border-border/70 bg-card text-sm font-semibold text-foreground/70 " +
              CARD_SHADOW
            }
          >
            {p}
          </div>
        ))}
      </div>
    </section>
  );
}

function Join() {
  return (
    <section className="relative overflow-hidden bg-hero text-hero-foreground">
      <img src={ensoImg} alt="" aria-hidden className="pointer-events-none absolute -right-16 -top-10 h-96 w-96 opacity-30" />
      <div className="mx-auto grid max-w-7xl gap-10 px-8 py-24 md:grid-cols-[1.2fr_1fr] md:items-center">
        <div>
          <p className="eyebrow !text-accent">Join ICF Switzerland</p>
          <h2 className="mt-3 text-3xl font-bold leading-tight tracking-tight md:text-4xl">
            A professional home for coaches.
          </h2>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-white/75">
            Whether you are beginning your coaching journey or have decades of experience, ICF Switzerland offers a professional home built on excellence, ethics and belonging.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#" className="inline-flex h-10 items-center rounded-full bg-white px-5 text-sm font-semibold text-primary transition hover:bg-white/90">
              Become a member
            </a>
            <a href="#" className="inline-flex h-10 items-center rounded-full border border-white/30 px-5 text-sm font-semibold text-white transition hover:bg-white/10">
              Explore credentials
            </a>
          </div>
        </div>
        <div className="rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur">
          <h3 className="text-xl font-semibold tracking-tight">Stay connected.</h3>
          <p className="mt-2 text-sm leading-relaxed text-white/75">
            Ideas, research and events shaping the future of coaching — in your inbox.
          </p>
          <form className="mt-5 flex flex-col gap-2 sm:flex-row" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              required
              placeholder="Your email address"
              className="h-10 w-full rounded-full border border-white/20 bg-white/10 px-4 text-sm text-white placeholder:text-white/60 outline-none focus:border-white/60"
            />
            <button className="h-10 rounded-full bg-white px-5 text-sm font-semibold text-primary transition hover:bg-white/90">
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

const footerCols = [
  { title: "Coaching", links: ["Coach Directory", "Why an ICF Coach?", "What is Coaching?", "FAQs"] },
  { title: "For Organisations", links: ["Why Coaching?", "Executive Coaching", "Team Coaching", "Case Studies"] },
  { title: "For Coaches", links: ["Membership", "Credentials", "Communities", "Mentoring & Supervision"] },
  { title: "About", links: ["Our Vision", "Board", "Partnerships", "Contact"] },
];

function Footer() {
  return (
    <footer className="bg-hero text-hero-foreground">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-3 px-8 py-6 text-xs sm:flex-row sm:items-center">
        <p className="text-white/70">© {new Date().getFullYear()} ICF Switzerland — Charter Chapter</p>
        <nav aria-label="Footer" className="flex flex-wrap items-center gap-4">
          {["Coach Directory", "For Organisations", "For Coaches", "Insights", "Events", "Privacy", "Code of Ethics", "Imprint"].map((l) => (
            <a key={l} href="#" className="text-white/80 hover:text-white">{l}</a>
          ))}
        </nav>
      </div>
    </footer>
  );
}

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <HeroHeader />
      <main>
        <Audiences />
        <WhyCredentialed />
        <CoachingInAction />
        <ForOrganisations />
        <Communities />
        <Events />
        <WhyCoaching />
        <Research />
        <Join />
      </main>
      <Footer />
    </div>
  );
}
