import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import heroImg from "@/assets/hero-coaching.jpg";
import leadershipImg from "@/assets/leadership-team.jpg";
import conversationImg from "@/assets/real-conversation.jpg";
import ensoImg from "@/assets/enso.png";

export const Route = createFileRoute("/")({
  component: Index,
});

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2" aria-label="ICF Switzerland home">
      <span className="grid h-10 w-10 place-items-center rounded-md bg-primary text-white">
        <span className="text-sm font-extrabold leading-none">ICF</span>
      </span>
      <span className="hidden text-xs leading-tight text-muted-foreground sm:block">
        Switzerland<br />Charter Chapter
      </span>
    </Link>
  );
}

function Nav() {
  const items = ["Find a Coach", "For Organisations", "For Coaches", "Insights", "Events", "About"];
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-6">
        <div className="flex items-center gap-10">
          <Logo />
          <nav className="hidden items-center gap-7 lg:flex">
            {items.map((i) => (
              <a key={i} href="#" className="text-sm text-foreground/80 transition hover:text-primary">{i}</a>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-3 text-xs font-medium text-muted-foreground md:flex">
            <button className="text-primary">EN</button>
            <button>DE</button>
            <button>FR</button>
            <button>IT</button>
          </div>
          <button aria-label="Search" className="hidden rounded-full p-2 text-foreground/70 hover:bg-secondary md:inline-flex">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
          </button>
          <a href="#" className="hidden text-sm font-medium text-foreground/80 hover:text-primary md:inline">Member Login</a>
          <a href="#" className="inline-flex items-center rounded-full bg-primary px-4 py-2 text-sm font-medium text-white transition hover:opacity-90">
            Find a Coach
          </a>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 pt-16 pb-20 md:grid-cols-2 md:items-center md:pt-24 md:pb-28">
        <div>
          <p className="mb-6 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            ICF Switzerland · Charter Chapter
          </p>
          <h1 className="text-5xl leading-[1.05] tracking-tight text-foreground md:text-6xl lg:text-7xl">
            Building a more <em className="not-italic text-primary">human</em> future through professional coaching.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Professional coaching helps individuals, leaders and organisations navigate complexity with greater clarity, confidence and purpose.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a href="#find-a-coach" className="inline-flex items-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-white transition hover:opacity-90">
              Find a coach →
            </a>
            <a href="#organisations" className="inline-flex items-center rounded-full border border-border bg-background px-6 py-3 text-sm font-medium text-foreground transition hover:border-primary">
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
            className="aspect-[5/4] w-full rounded-3xl object-cover shadow-[0_30px_80px_-40px_rgba(46,49,146,0.35)]"
          />
          <img src={ensoImg} alt="" aria-hidden className="pointer-events-none absolute -right-8 -top-10 h-40 w-40 opacity-70" />
        </div>
      </div>
    </section>
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
    <section id="find-a-coach" className="mx-auto max-w-7xl px-6 pb-20">
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {audiences.map((a) => (
          <a key={a.title + a.eyebrow} href="#" className="group flex flex-col rounded-2xl border border-border bg-card p-7 transition hover:-translate-y-1 hover:border-primary hover:shadow-lg">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{a.eyebrow}</p>
            <h3 className="mt-3 text-2xl font-semibold text-foreground">{a.title}</h3>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{a.desc}</p>
            <span className="mt-6 text-sm font-medium text-primary">{a.cta} →</span>
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
    <section className="relative bg-muted py-24">
      <img src={ensoImg} alt="" aria-hidden className="pointer-events-none absolute -right-16 top-10 h-72 w-72 opacity-40" />
      <div className="mx-auto max-w-7xl px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Why choose an ICF credentialed coach?</p>
        <div className="mt-4 grid gap-10 md:grid-cols-2 md:items-end">
          <h2 className="text-4xl leading-tight text-foreground md:text-5xl">
            Choosing a coach is an important decision.
          </h2>
          <p className="text-lg text-muted-foreground">
            ICF credentialed coaches commit to internationally recognised standards, ethics and continuous professional development.
          </p>
        </div>
        <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {pillars.map((p, i) => (
            <div key={p.title} className="relative">
              <div className="mb-5 flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent/15 text-primary text-sm font-bold">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="text-lg font-semibold text-foreground">{p.title}</h3>
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
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Coaching in action</p>
          <h2 className="mt-3 max-w-2xl text-4xl leading-tight text-foreground md:text-5xl">
            Building a more human future.
          </h2>
        </div>
        <a href="#" className="text-sm font-medium text-primary hover:underline">Explore all insights →</a>
      </div>
      <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {themes.map((t) => (
          <a key={t.tag} href="#" className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition hover:-translate-y-1 hover:shadow-lg">
            <div className="aspect-[4/3] w-full bg-muted" />
            <div className="p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">{t.tag}</p>
              <h3 className="mt-3 text-lg font-semibold leading-snug text-foreground">
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
      <div className="mx-auto grid max-w-7xl gap-14 px-6 py-24 md:grid-cols-2 md:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">For organisations</p>
          <h2 className="mt-4 text-4xl leading-tight md:text-5xl">
            Coaching transforms organisations.
          </h2>
          <p className="mt-5 max-w-lg text-lg text-white/80">
            Support leaders. Strengthen teams. Build coaching cultures that make healthier, more adaptive workplaces possible.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#" className="inline-flex items-center rounded-full bg-white px-6 py-3 text-sm font-medium text-primary transition hover:bg-white/90">
              Talk to us
            </a>
            <a href="#" className="inline-flex items-center rounded-full border border-white/30 px-6 py-3 text-sm font-medium text-white transition hover:bg-white/10">
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
          className="aspect-[5/4] w-full rounded-3xl object-cover shadow-2xl"
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
    <section className="mx-auto max-w-7xl px-6 py-24 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Communities</p>
      <h2 className="mx-auto mt-4 max-w-3xl text-4xl leading-tight text-foreground md:text-5xl">
        A coaching community across Switzerland.
      </h2>
      <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
        Across regions and languages, ICF Switzerland brings coaches together to learn, collaborate and contribute to the future of our profession.
      </p>
      <div className="mt-14 grid gap-8 text-left md:grid-cols-2 lg:grid-cols-4">
        {communities.map((c) => (
          <div key={c.city} className="rounded-2xl border border-border bg-card p-7">
            <h3 className="text-xl font-semibold text-foreground">{c.city}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{c.region}</p>
            <div className="mt-6 flex items-center gap-2 text-xs font-semibold tracking-wider text-primary">
              {c.langs.map((l, i) => (
                <span key={l} className="flex items-center gap-2">
                  {l}
                  {i < c.langs.length - 1 && <span className="text-muted-foreground">·</span>}
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
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Upcoming events</p>
            <h2 className="mt-3 text-4xl leading-tight text-foreground md:text-5xl">
              Connect. Learn. Grow.
            </h2>
          </div>
          <a href="#" className="text-sm font-medium text-primary hover:underline">View all events →</a>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {events.map((e) => (
            <a key={e.title} href="#" className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition hover:-translate-y-1 hover:shadow-lg">
              <div className="flex aspect-[16/10] items-center justify-center bg-gradient-to-br from-primary/10 via-accent/20/40 to-brand-cyan/20">
                <span className="text-3xl font-semibold text-primary/60">{e.city}</span>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <p className="text-xs font-medium tracking-wide text-muted-foreground">
                  {e.date} · {e.city}
                </p>
                <h3 className="mt-3 text-xl font-semibold leading-snug text-foreground">
                  {e.title}
                </h3>
                <div className="mt-5 flex flex-wrap items-center gap-2">
                  {e.tags.map((t) => (
                    <span key={t} className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-foreground/80">{t}</span>
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
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="grid gap-14 md:grid-cols-2 md:items-center">
        <img
          src={conversationImg}
          alt="A real coaching conversation"
          width={1400}
          height={1400}
          loading="lazy"
          className="aspect-square w-full rounded-3xl object-cover shadow-[0_30px_80px_-40px_rgba(46,49,146,0.35)]"
        />
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Why coaching?</p>
          <h2 className="mt-4 text-4xl leading-tight text-foreground md:text-5xl">
            Better conversations create better futures.
          </h2>
          <p className="mt-5 text-lg text-muted-foreground">
            Professional coaching empowers people to think more clearly, lead more effectively and navigate change with confidence.
          </p>
          <div className="mt-10 space-y-6">
            {values.map((v, i) => (
              <div key={v.title} className="flex gap-5 border-t border-border pt-6">
                <span className="text-xl font-semibold text-accent">
                  0{i + 1}
                </span>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">{v.title}</h3>
                  <p className="mt-2 text-muted-foreground">{v.desc}</p>
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
    <section className="mx-auto max-w-7xl px-6 py-24 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Research & partnerships</p>
      <h2 className="mx-auto mt-4 max-w-3xl text-4xl leading-tight text-foreground md:text-5xl">
        Connecting research, practice and leadership.
      </h2>
      <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
        We work alongside universities, professional bodies, researchers and corporate partners to strengthen coaching across Switzerland.
      </p>
      <div className="mt-14 grid grid-cols-2 gap-5 md:grid-cols-5">
        {["ETH Zürich", "HEC Lausanne", "USI Lugano", "SwissRe", "Nestlé"].map((p) => (
          <div key={p} className="grid h-20 place-items-center rounded-xl border border-border bg-card text-sm font-semibold text-foreground/70">
            {p}
          </div>
        ))}
      </div>
    </section>
  );
}

function Join() {
  return (
    <section className="relative overflow-hidden bg-primary text-white">
      <img src={ensoImg} alt="" aria-hidden className="pointer-events-none absolute -right-16 -top-10 h-96 w-96 opacity-30" />
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-24 md:grid-cols-[1.2fr_1fr] md:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Join ICF Switzerland</p>
          <h2 className="mt-4 text-4xl leading-tight md:text-5xl">
            A professional home for coaches.
          </h2>
          <p className="mt-5 max-w-lg text-lg text-white/80">
            Whether you are beginning your coaching journey or have decades of experience, ICF Switzerland offers a professional home built on excellence, ethics and belonging.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#" className="inline-flex items-center rounded-full bg-white px-6 py-3 text-sm font-medium text-primary transition hover:bg-white/90">
              Become a member
            </a>
            <a href="#" className="inline-flex items-center rounded-full border border-white/30 px-6 py-3 text-sm font-medium text-white transition hover:bg-white/10">
              Explore credentials
            </a>
          </div>
        </div>
        <div className="rounded-3xl border border-white/15 bg-white/5 p-8 backdrop-blur">
          <h3 className="text-2xl font-semibold">Stay connected.</h3>
          <p className="mt-3 text-white/80">
            Ideas, research and events shaping the future of coaching — in your inbox.
          </p>
          <form className="mt-6 flex flex-col gap-3 sm:flex-row" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              required
              placeholder="Your email address"
              className="w-full rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm text-white placeholder:text-white/60 outline-none focus:border-white/60"
            />
            <button className="rounded-full bg-white px-6 py-3 text-sm font-medium text-primary transition hover:bg-white/90">
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
    <footer className="border-t border-border bg-muted/60">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-[1.2fr_repeat(4,minmax(0,1fr))]">
        <div>
          <Logo />
          <p className="mt-5 max-w-xs text-sm text-muted-foreground">
            Building a more human future through professional coaching.
          </p>
        </div>
        {footerCols.map((col) => (
          <div key={col.title}>
            <h4 className="text-sm font-semibold text-foreground">{col.title}</h4>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {col.links.map((l) => (
                <li key={l}><a href="#" className="hover:text-primary">{l}</a></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-6 text-xs text-muted-foreground">
          <p>© 2026 ICF Switzerland Charter Chapter</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-primary">Deutsch</a>
            <a href="#" className="hover:text-primary">Français</a>
            <a href="#" className="hover:text-primary">Italiano</a>
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-primary">Privacy</a>
            <a href="#" className="hover:text-primary">Code of Ethics</a>
            <a href="#" className="hover:text-primary">Imprint</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <main>
        <Hero />
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
