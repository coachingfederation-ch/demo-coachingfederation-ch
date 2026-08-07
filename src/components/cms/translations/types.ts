/**
 * Shared types for the CMS translation panels: the presentational per-locale
 * row shape rendered by TranslationLocaleList, plus the field descriptor
 * shape consumed by GenericTranslationsPanel.
 */
export interface TranslationLocaleItem {
  locale: string;
  badgeLabel: string;
  badgeClassName: string;
  translateLabel: string;
  onTranslate: () => void;
  translating: boolean;
  translateDisabled: boolean;
  showOpenToggle: boolean;
  isOpen: boolean;
  onToggleOpen: () => void;
  openLabel: string;
  closeLabel: string;
  editor?: import("react").ReactNode;
}

export interface TranslationFieldConfig<F extends string = string> {
  key: F;
  label: string;
  /** "rich" renders the standard formatting toolbar (long-form fields). */
  type: "input" | "textarea" | "markdown" | "rich";
  rows?: number;
}
