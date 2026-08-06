/**
 * Generic vocabulary-chips section (regions, languages, formats,
 * specialisations, client types) used by the Member Area profile editor.
 * Consumed by MemberProfileEditor.tsx.
 */
import { vocabLabel, type VocabRow } from "@/lib/vocabularies";
import { Chips, Section } from "./shared";

export function FacetSection({
  title,
  note,
  rows,
  selected,
  onToggle,
  locale,
}: {
  title: string;
  note?: string;
  rows: VocabRow[];
  selected: string[];
  onToggle: (id: string) => void;
  locale: Parameters<typeof vocabLabel>[1];
}) {
  return (
    <Section title={title} note={note}>
      <Chips rows={rows} selected={selected} onToggle={onToggle} locale={locale} />
    </Section>
  );
}
