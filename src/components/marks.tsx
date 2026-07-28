import c1 from "@/assets/marks/CircularMark01.svg?raw";
import c2 from "@/assets/marks/CircularMark02.svg?raw";
import a1 from "@/assets/marks/Arrow01.svg?raw";
import a2 from "@/assets/marks/Arrow02.svg?raw";
import s1 from "@/assets/marks/Star01.svg?raw";
import as1 from "@/assets/marks/Asterisk01.svg?raw";
import as3 from "@/assets/marks/Asterisk03.svg?raw";

// Strip the inlined <style> fill so we can recolor via currentColor.
const normalize = (svg: string) =>
  svg
    .replace(/<\?xml[^?]*\?>/, "")
    .replace(/<style>[\s\S]*?<\/style>/g, "")
    .replace(/<defs>[\s\S]*?<\/defs>/g, "")
    .replace(/class="cls-1"/g, 'fill="currentColor"')
    .replace(/<svg /, '<svg width="100%" height="100%" preserveAspectRatio="xMidYMid meet" ');

const marks = {
  circular1: normalize(c1),
  circular2: normalize(c2),
  arrow1: normalize(a1),
  arrow2: normalize(a2),
  star: normalize(s1),
  asterisk1: normalize(as1),
  asterisk3: normalize(as3),
} as const;

export type MarkName = keyof typeof marks;

export function Mark({ name, className }: { name: MarkName; className?: string }) {
  return (
    <span
      aria-hidden
      className={"inline-flex items-center justify-center " + (className ?? "")}
      dangerouslySetInnerHTML={{ __html: marks[name] }}
    />
  );
}
