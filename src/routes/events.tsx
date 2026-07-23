import { createFileRoute } from "@tanstack/react-router";
import { Mark, type MarkName } from "@/components/marks";
import { CompactHero, SiteFooter, CARD_SHADOW } from "@/components/site-chrome";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Events — ICF Switzerland" },
      { name: "description", content: "Conferences, webinars and community gatherings for coaches and organisations across Switzerland." },
      { property: "og:title", content: "Events — ICF Switzerland" },
      { property: "og:description", content: "Conferences, webinars and community gatherings for coaches and organisations across Switzerland." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EventsPage,
});

const featured = {
  date: "Thu 17 Sep 2026",
  city: "Zürich",
  title: "Coaching Perspectives Conference 2026",
  desc: "A full-day gathering of coaches, leaders and researchers exploring the future of professional coaching in Switzerland.",
  tags: ["EN · DE", "Conference", "In-person"],
  bg: "bg-mark-cream",
  fg: "text-mark-indigo",
  mark: "arrow1" as MarkName,
};

const upcoming: { date: string; city: string; title: string; tags: string[]; bg: string; fg: string; mark: MarkName }[] = [
  { date: "Tue 6 Oct 2026", city: "Online", title: "AI & Coaching: What Stays Human?", tags: ["EN", "Webinar"], bg: "bg-mark-indigo", fg: "text-mark-yellow", mark: "asterisk3" },
  { date: "Thu 12 Nov 2026", city: "Lausanne", title: "Soirée Coaching: Bâtir une culture de coaching", tags: ["FR", "Networking"], bg: "bg-mark-yellow", fg: "text-mark-indigo", mark: "arrow2" },
  { date: "Wed 25 Nov 2026", city: "Lugano", title: "Coaching e leadership consapevole", tags: ["IT", "Community"], bg: "bg-mark-blue", fg: "text-mark-cream", mark: "circular2" },
  { date: "Thu 10 Dec 2026", city: "Online", title: "Mentor Coaching Circle", tags: ["EN", "Mentoring"], bg: "bg-mark-cream", fg: "text-mark-indigo", mark: "circular1" },
  { date: "Wed 20 Jan 2027", city: "Zürich", title: "New Year Kickoff: Coaching in 2027", tags: ["DE · EN", "Networking"], bg: "bg-mark-indigo", fg: "text-mark-cream", mark: "star" },
  { date: "Thu 11 Feb 2027", city: "Geneva", title: "Team Coaching Masterclass", tags: ["EN", "Workshop"], bg: "bg-mark-yellow", fg: "text-mark-indigo", mark: "asterisk1" },
];

const past = [
  { date: "Thu 6 Mar 2025", city: "Zürich", title: "Coaching Perspectives Conference 2025" },
  { date: "Wed 19 Feb 2025", city: "Online", title: "Ethics in Practice: A Coaching Dialogue" },
  { date: "Thu 30 Jan 2025", city: "Lausanne", title: "Coaching et transformation culturelle" },
];

function EventsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <CompactHero
        eyebrow="Events"
        title={<>Connect, learn and <span className="text-accent">grow</span> together.</>}
        lede="Conferences, webinars and community gatherings for coaches and organisations across Switzerland."
      />
      <main>
        <section className="mx-auto max-w-7xl px-8 py-16">
          <p className="eyebrow">Featured event</p>
          <a href="#" className={"group mt-6 grid overflow-hidden rounded-2xl border border-border/70 bg-card transition hover:-translate-y-0.5 md:grid-cols-2 " + CARD_SHADOW}>
            <div className={"grid aspect-[4/3] w-full place-items-center md:aspect-auto " + featured.bg + " " + featured.fg}>
              <Mark name={featured.mark} className="h-1/2 w-1/2" />
            </div>
            <div className="flex flex-col justify-center p-10">
              <p className="btn-mono !text-muted-foreground">{featured.date} · {featured.city}</p>
              <h2 className="mt-3 text-2xl font-bold leading-tight tracking-tight md:text-3xl">{featured.title}</h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">{featured.desc}</p>
              <div className="mt-6 flex flex-wrap items-center gap-2">
                {featured.tags.map((t) => (
                  <span key={t} className="inline-flex items-center rounded-full border border-border/70 bg-chip px-2.5 py-1 text-[11px] font-semibold text-chip-foreground">{t}</span>
                ))}
              </div>
            </div>
          </a>
        </section>

        <section className="bg-muted py-24">
          <div className="mx-auto max-w-7xl px-8">
            <p className="eyebrow">Upcoming</p>
            <h2 className="mt-3 max-w-2xl text-3xl font-bold leading-tight tracking-tight md:text-4xl">
              What's coming up.
            </h2>
            <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {upcoming.map((e) => (
                <a key={e.title} href="#" className={"group flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card transition hover:-translate-y-0.5 " + CARD_SHADOW}>
                  <div className={"grid aspect-[16/10] w-full place-items-center " + e.bg + " " + e.fg}>
                    <Mark name={e.mark} className="h-3/5 w-3/5" />
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <p className="btn-mono !text-muted-foreground">{e.date} · {e.city}</p>
                    <h3 className="mt-3 text-lg font-semibold leading-snug tracking-tight">{e.title}</h3>
                    <div className="mt-5 flex flex-wrap items-center gap-2">
                      {e.tags.map((t) => (
                        <span key={t} className="inline-flex items-center rounded-full border border-border/70 bg-chip px-2.5 py-1 text-[11px] font-semibold text-chip-foreground">{t}</span>
                      ))}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-8 py-24">
          <p className="eyebrow">Past events</p>
          <ul className="mt-8 divide-y divide-border/70 border-y border-border/70">
            {past.map((e) => (
              <li key={e.title} className="flex flex-col gap-1 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="btn-mono !text-muted-foreground">{e.date} · {e.city}</p>
                  <p className="mt-1 text-base font-semibold tracking-tight">{e.title}</p>
                </div>
                <a href="#" className="text-sm font-semibold text-primary hover:underline">Recap →</a>
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-hero text-hero-foreground">
          <div className="mx-auto max-w-7xl px-8 py-20 text-center">
            <p className="eyebrow !text-accent">Contribute</p>
            <h2 className="mx-auto mt-3 max-w-2xl text-3xl font-bold leading-tight tracking-tight md:text-4xl">
              Have an event to propose?
            </h2>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <a href="#" className="inline-flex h-10 items-center rounded-full bg-white px-5 text-sm font-semibold text-primary transition hover:bg-white/90">Propose an event</a>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}