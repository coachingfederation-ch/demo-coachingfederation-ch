import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import heroImg from "@/assets/hero-coaching.jpg";
import leadershipImg from "@/assets/leadership-team.jpg";
import { Mark, type MarkName } from "@/components/marks";
import { SiteHeaderBar, SiteFooter, CARD_SHADOW } from "@/components/site-chrome";

export const Route = createFileRoute("/")({
  component: Index,
});

function HeroHeader() {
  return (
    <header className="bg-hero text-hero-foreground">
      <div className="mx-auto max-w-7xl px-8 pt-6 pb-16">
        <div className="mb-10">
          <SiteHeaderBar />
        </div>

        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <div className="max-w-2xl">
            <p className="eyebrow !text-accent">ICF Switzerland · Charter Chapter</p>
            <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl">
              Building a more <span className="text-accent">human</span> future through professional coaching.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/75">
              Professional coaching helps individuals, leaders and organisations navigate complexity with greater
              clarity, confidence and purpose.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#find-a-coach"
                className="inline-flex h-10 items-center rounded-full bg-white px-5 text-sm font-semibold text-primary transition hover:bg-white/90"
              >
                Find a coach →
              </a>
              <Link
                to="/for-organisations"
                className="inline-flex h-10 items-center rounded-full border border-white/30 px-5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                For organisations
              </Link>
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
            <Mark
              name="asterisk1"
              className="pointer-events-none absolute -right-8 -top-10 h-40 w-40 text-mark-yellow"
            />
          </div>
        </div>
      </div>
    </header>
  );
}

const audiences = [
  { eyebrow: "I'm looking for", title: "A Coach", desc: "Find a trusted ICF credentialed coach.", cta: "Find a Coach" },
  {
    eyebrow: "I represent",
    title: "An Organisation",
    desc: "Discover how coaching develops leaders and organisations.",
    cta: "For Organisations",
  },
  {
    eyebrow: "I am",
    title: "A Coach",
    desc: "Grow your practice through community, learning and professional standards.",
    cta: "For Coaches",
  },
  {
    eyebrow: "I'm curious",
    title: "About Coaching",
    desc: "Learn what coaching is and why it matters.",
    cta: "Discover Coaching",
  },
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
      <Mark
        name="circular1"
        className="pointer-events-none absolute -right-16 top-10 h-72 w-72 text-mark-indigo opacity-30"
      />
      <div className="mx-auto max-w-7xl px-8">
        <p className="eyebrow">Why choose an ICF credentialed coach?</p>
        <div className="mt-4 grid gap-10 md:grid-cols-2 md:items-end">
          <h2 className="text-3xl font-bold leading-tight tracking-tight text-foreground md:text-4xl">
            Choosing a coach is an important decision.
          </h2>
          <p className="text-base leading-relaxed text-muted-foreground">
            ICF credentialed coaches commit to internationally recognised standards, ethics and continuous professional
            development.
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
  {
    tag: "Future of Work",
    title: "How coaching prepares people for what work becomes next",
    bg: "bg-mark-cream",
    fg: "text-mark-indigo",
    mark: "circular1" as MarkName,
  },
  {
    tag: "Leadership",
    title: "Better conversations create better leaders",
    bg: "bg-mark-indigo",
    fg: "text-mark-cream",
    mark: "star" as MarkName,
  },
  {
    tag: "AI & Coaching",
    title: "Why trusted human conversations matter more than ever",
    bg: "bg-mark-yellow",
    fg: "text-mark-indigo",
    mark: "asterisk1" as MarkName,
  },
  {
    tag: "Diversity & Inclusion",
    title: "Coaching that welcomes every perspective",
    bg: "bg-mark-blue",
    fg: "text-mark-cream",
    mark: "circular2" as MarkName,
  },
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
        <a href="#" className="text-sm font-semibold text-primary hover:underline">
          Explore all insights →
        </a>
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
            <div className={"grid aspect-[4/3] w-full place-items-center " + t.bg + " " + t.fg}>
              <Mark name={t.mark} className="h-1/2 w-1/2" />
            </div>
            <div className="p-6">
              <p className="section-label">{t.tag}</p>
              <h3 className="mt-2 text-base font-semibold leading-snug tracking-tight text-foreground">{t.title}</h3>
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
            Support leaders. Strengthen teams. Build coaching cultures that make healthier, more adaptive workplaces
            possible.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#"
              className="inline-flex h-10 items-center rounded-full bg-white px-5 text-sm font-semibold text-primary transition hover:bg-white/90"
            >
              Talk to us
            </a>
            <a
              href="#"
              className="inline-flex h-10 items-center rounded-full border border-white/30 px-5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
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
        Across regions and languages, ICF Switzerland brings coaches together to learn, collaborate and contribute to
        the future of our profession.
      </p>
      <div className="mt-14 grid gap-4 text-left md:grid-cols-2 lg:grid-cols-4">
        {communities.map((c) => (
          <div key={c.city} className={"rounded-2xl border border-border/70 bg-card p-6 " + CARD_SHADOW}>
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
  {
    date: "Thu 17 Sep 2026",
    city: "Zürich",
    title: "Coaching Perspectives Conference 2026",
    tags: ["EN · DE", "Leadership"],
    bg: "bg-mark-cream",
    fg: "text-mark-indigo",
    mark: "arrow1" as MarkName,
  },
  {
    date: "Tue 6 Oct 2026",
    city: "Online",
    title: "AI & Coaching: What Stays Human?",
    tags: ["EN", "Webinar"],
    bg: "bg-mark-indigo",
    fg: "text-mark-yellow",
    mark: "asterisk3" as MarkName,
  },
  {
    date: "Thu 12 Nov 2026",
    city: "Lausanne",
    title: "Soirée Coaching: Bâtir une culture de coaching",
    tags: ["FR", "Networking"],
    bg: "bg-mark-yellow",
    fg: "text-mark-indigo",
    mark: "arrow2" as MarkName,
  },
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
          <Link to="/events" className="text-sm font-semibold text-primary hover:underline">
            View all events →
          </Link>
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
              <div className={"grid aspect-[16/10] w-full place-items-center " + e.bg + " " + e.fg}>
                <Mark name={e.mark} className="h-3/5 w-3/5" />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <p className="btn-mono !text-muted-foreground">
                  {e.date} · {e.city}
                </p>
                <h3 className="mt-3 text-lg font-semibold leading-snug tracking-tight text-foreground">{e.title}</h3>
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

function Research() {
  return (
    <section className="mx-auto max-w-7xl px-8 py-24 text-center">
      <p className="eyebrow">Research & partnerships</p>
      <h2 className="mx-auto mt-3 max-w-3xl text-3xl font-bold leading-tight tracking-tight text-foreground md:text-4xl">
        Connecting research, practice and leadership.
      </h2>
      <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
        We work alongside universities, professional bodies, researchers and corporate partners to strengthen coaching
        across Switzerland.
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
      <Mark
        name="circular2"
        className="pointer-events-none absolute -right-16 -top-10 h-96 w-96 text-mark-cream opacity-40"
      />
      <div className="mx-auto grid max-w-7xl gap-10 px-8 py-24 md:grid-cols-[1.2fr_1fr] md:items-center">
        <div>
          <p className="eyebrow !text-accent">Join ICF Switzerland</p>
          <h2 className="mt-3 text-3xl font-bold leading-tight tracking-tight md:text-4xl">
            A professional home for coaches.
          </h2>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-white/75">
            Whether you are beginning your coaching journey or have decades of experience, ICF Switzerland offers a
            professional home built on excellence, ethics and belonging.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#"
              className="inline-flex h-10 items-center rounded-full bg-white px-5 text-sm font-semibold text-primary transition hover:bg-white/90"
            >
              Become a member
            </a>
            <a
              href="#"
              className="inline-flex h-10 items-center rounded-full border border-white/30 px-5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
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
        <Research />
        <Join />
      </main>
      <SiteFooter />
    </div>
  );
}
