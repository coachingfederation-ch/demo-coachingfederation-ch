import { Link } from "@tanstack/react-router";
import icfLogo from "@/assets/icf-switzerland-charter-chapter.png.asset.json";

const navItems = [
  { label: "Home", to: "/" },
  { label: "For Organisations", to: "/for-organisations" },
  { label: "For Coaches", to: "/for-coaches" },
  { label: "Insights", to: "/insights" },
  { label: "Events", to: "/events" },
  { label: "About", to: "/about" },
] as const;

const langs = ["en", "de", "fr", "it"];

export function Logo({ variant = "hero" }: { variant?: "hero" | "compact" }) {
  return (
    <Link to="/" aria-label="ICF Switzerland home" className="inline-flex">
      <img
        src={icfLogo.url}
        alt="ICF Switzerland Charter Chapter"
        className={variant === "hero" ? "h-24 w-auto" : "h-16 w-auto"}
      />
    </Link>
  );
}

export function SiteNav() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <nav
        aria-label="Primary"
        className="hidden items-center rounded-full bg-white/10 p-1 text-[11px] font-semibold lg:inline-flex"
      >
        {navItems.map((i) => (
          <Link
            key={i.to}
            to={i.to}
            activeOptions={{ exact: true }}
            className="inline-flex h-7 items-center rounded-full px-3 text-white/80 transition hover:text-white data-[status=active]:bg-white data-[status=active]:text-primary data-[status=active]:shadow-sm"
          >
            {i.label}
          </Link>
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
        href="#find-a-coach"
        className="inline-flex h-8 items-center rounded-full bg-accent px-4 text-[11px] font-semibold uppercase tracking-wider text-accent-foreground transition hover:opacity-90"
      >
        Find a Coach
      </a>
    </div>
  );
}

export function SiteHeaderBar({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={
        "flex flex-wrap items-start justify-between gap-4 " + (compact ? "mb-0" : "mb-10")
      }
    >
      <Logo variant={compact ? "compact" : "hero"} />
      <SiteNav />
    </div>
  );
}

export function CompactHero({
  eyebrow,
  title,
  lede,
  ctaLabel,
  ctaHref = "#",
}: {
  eyebrow: string;
  title: React.ReactNode;
  lede: string;
  ctaLabel?: string;
  ctaHref?: string;
}) {
  return (
    <header className="bg-hero text-hero-foreground">
      <div className="mx-auto max-w-7xl px-8 pt-6 pb-20">
        <SiteHeaderBar compact />
        <div className="mt-14 max-w-3xl">
          <p className="eyebrow !text-accent">{eyebrow}</p>
          <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/75">{lede}</p>
          {ctaLabel && (
            <div className="mt-8">
              <a
                href={ctaHref}
                className="inline-flex h-10 items-center rounded-full bg-white px-5 text-sm font-semibold text-primary transition hover:bg-white/90"
              >
                {ctaLabel} →
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-hero text-hero-foreground">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-3 px-8 py-6 text-xs sm:flex-row sm:items-center">
        <p className="text-white/70">© {new Date().getFullYear()} ICF Switzerland — Charter Chapter</p>
        <nav aria-label="Footer" className="flex flex-wrap items-center gap-4">
          <Link to="/for-organisations" className="text-white/80 hover:text-white">For Organisations</Link>
          <Link to="/for-coaches" className="text-white/80 hover:text-white">For Coaches</Link>
          <Link to="/insights" className="text-white/80 hover:text-white">Insights</Link>
          <Link to="/events" className="text-white/80 hover:text-white">Events</Link>
          <Link to="/about" className="text-white/80 hover:text-white">About</Link>
          <a href="#" className="text-white/80 hover:text-white">Privacy</a>
          <a href="#" className="text-white/80 hover:text-white">Code of Ethics</a>
          <a href="#" className="text-white/80 hover:text-white">Imprint</a>
        </nav>
      </div>
    </footer>
  );
}

export const CARD_SHADOW =
  "shadow-[0_1px_2px_rgba(20,20,60,0.04),0_8px_20px_-14px_rgba(20,20,60,0.08)]";