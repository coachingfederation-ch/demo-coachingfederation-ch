/**
 * Shared types for the CMS/member translation panels: the presentational
 * per-locale row shape rendered by TranslationLocaleList, plus the field
 * descriptor shape consumed by GenericTranslationsPanel.
 */
import type { ReactNode } from "react";

export interface TranslationLocaleItem {
  locale: string;
  rowClassName?: string;
  badgeLabel: string;
  badgeClassName: string;
  hint?: ReactNode;
  actionsClassName?: string;
  translateLabel: string;
  translateTitle?: string;
  onTranslate: () => void;
  translating: boolean;
  translateDisabled: boolean;
  showOpenToggle: boolean;
  isOpen: boolean;
  onToggleOpen: () => void;
  openLabel: string;
  closeLabel: string;
  extraActions?: ReactNode;
  editor?: ReactNode;
}

export interface TranslationFieldConfig<F extends string = string> {
  key: F;
  label: string;
  type: "input" | "textarea" | "markdown";
  rows?: number;
}
