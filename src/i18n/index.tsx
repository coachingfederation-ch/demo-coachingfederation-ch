import { Link, useRouterState } from "@tanstack/react-router";
import type { ComponentProps, ReactNode } from "react";
import {
  DEFAULT_LOCALE,
  LOCALES,
  type Locale,
  localizePath,
  parseLocalePath,
  SITE_URL,
} from "./config";

type Dict = Record<string, unknown>;

const modules = import.meta.glob<{ default: Dict }>("./locales/*/*.json", { eager: true });

const dictionaries: Record<string, Dict> = Object.fromEntries(LOCALES.map((l) => [l, {} as Dict]));

for (const [path, mod] of Object.entries(modules)) {
  const match = path.match(/\.\/locales\/([^/]+)\/([^/]+)\.json$/);
  if (!match) continue;
  const [, locale, ns] = match;
  if (!dictionaries[locale]) dictionaries[locale] = {};
  dictionaries[locale][ns] = mod.default;
}

function lookup(dict: Dict | undefined, key: string): unknown {
  if (!dict) return undefined;
  let node: unknown = dict;
  for (const part of key.split(".")) {
    if (node === null || typeof node !== "object") return undefined;
    node = (node as Record<string, unknown>)[part];
  }
  return node;
}

/** Resolve a key for a locale, falling back to English, then the key itself. */
export function translate(locale: Locale, key: string): unknown {
  const value = lookup(dictionaries[locale], key);
  if (value !== undefined) return value;
  return lookup(dictionaries[DEFAULT_LOCALE], key);
}

export function makeT(locale: Locale) {
  function t(key: string): string {
    const value = translate(locale, key);
    return typeof value === "string" ? value : key;
  }
  function tList<T = Record<string, string>>(key: string): T[] {
    const value = translate(locale, key);
    return Array.isArray(value) ? (value as T[]) : [];
  }
  return { t, tList };
}

export function useLocale(): Locale {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return parseLocalePath(pathname).locale;
}

/** Current canonical (locale-stripped) path, e.g. "/about". */
export function useCanonicalPath(): string {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return parseLocalePath(pathname).path;
}

export function useI18n() {
  const locale = useLocale();
  const { t, tList } = makeT(locale);
  return {
    locale,
    t,
    tList,
    localePath: (path: string) => localizePath(path, locale),
  };
}

type LocaleLinkProps = Omit<ComponentProps<typeof Link>, "to" | "params"> & {
  to: string;
  children?: ReactNode;
};

/** <Link> that keeps the visitor inside the active language. */
export function LocaleLink({ to, ...rest }: LocaleLinkProps) {
  const locale = useLocale();
  if (locale === DEFAULT_LOCALE) {
    return <Link to={to as never} {...(rest as object)} />;
  }
  const target = to === "/" ? "/$locale" : `/$locale${to}`;
  return <Link to={target as never} params={{ locale } as never} {...(rest as object)} />;
}

/** hreflang + canonical link tags for a canonical path. */
export function localeLinkTags(path: string, locale: Locale) {
  return [
    { rel: "canonical", href: `${SITE_URL}${localizePath(path, locale)}` },
    ...LOCALES.map((l) => ({
      rel: "alternate",
      hrefLang: l === "en" ? "en" : `${l}-CH`,
      href: `${SITE_URL}${localizePath(path, l)}`,
    })),
    { rel: "alternate", hrefLang: "x-default", href: `${SITE_URL}${localizePath(path, "en")}` },
  ];
}

/** Standard head() meta for a localized page. */
export function localeMeta(locale: Locale, path: string, titleKey: string, descKey: string) {
  const { t } = makeT(locale);
  const title = t(titleKey);
  const description = t(descKey);
  return [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:url", content: `${SITE_URL}${localizePath(path, locale)}` },
    { property: "og:locale", content: locale },
    { name: "twitter:card", content: "summary_large_image" },
  ];
}
