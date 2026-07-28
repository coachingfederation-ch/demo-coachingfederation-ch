/**
 * Translate src/i18n/locales/en/*.json into de / fr / it via the Lovable AI Gateway.
 * Run with: bun run translate
 * Output is committed, so the running site never calls the AI gateway.
 */
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dir ?? process.cwd(), "..");
const LOCALES_DIR = join(ROOT, "src/i18n/locales");
const EN_DIR = join(LOCALES_DIR, "en");
const HASH_FILE = join(LOCALES_DIR, ".translation-hashes.json");
const TARGETS = ["de", "fr", "it"] as const;
const LANG_NAMES: Record<string, string> = {
  de: "Swiss Standard German (de-CH, never use ß)",
  fr: "Swiss French (fr-CH)",
  it: "Swiss Italian (it-CH)",
};
const MODEL = "google/gemini-3.6-flash";

const apiKey = process.env.LOVABLE_API_KEY;
if (!apiKey) {
  console.error("Missing LOVABLE_API_KEY");
  process.exit(1);
}

const hashes: Record<string, string> = existsSync(HASH_FILE)
  ? JSON.parse(readFileSync(HASH_FILE, "utf8"))
  : {};

async function translate(json: string, lang: string): Promise<string> {
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Lovable-API-Key": apiKey! },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: "system",
          content:
            "You translate website UI copy for ICF Switzerland, the Swiss chapter of the International Coaching Federation. " +
            `Translate every JSON string value into ${LANG_NAMES[lang]}. ` +
            "Rules: keep the JSON structure and all keys identical; translate only values; " +
            "keep the organisation name 'ICF Switzerland' and 'Charter Chapter' untranslated; " +
            "keep credential names ACC, PCC, MCC and language codes (DE, FR, IT, EN) unchanged; " +
            "keep Swiss place names (Zürich, Lausanne, Genève, Lugano, Romandie, Ticino) and partner names unchanged; " +
            "preserve arrows, punctuation, placeholders and leading/trailing symbols such as '→' or '←'; " +
            "use a professional, warm, member-driven tone; keep meta titles under 60 and meta descriptions under 160 characters. " +
            "Respond with JSON only.",
        },
        { role: "user", content: json },
      ],
      response_format: { type: "json_object" },
    }),
  });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.choices[0].message.content as string;
}

const files = readdirSync(EN_DIR).filter((f) => f.endsWith(".json"));

for (const file of files) {
  const source = readFileSync(join(EN_DIR, file), "utf8");
  const hash = createHash("sha256").update(source).digest("hex");

  for (const lang of TARGETS) {
    const outDir = join(LOCALES_DIR, lang);
    const outFile = join(outDir, file);
    const key = `${lang}/${file}`;
    if (hashes[key] === hash && existsSync(outFile)) {
      console.log(`skip  ${key}`);
      continue;
    }
    process.stdout.write(`write ${key} ... `);
    const raw = await translate(source, lang);
    const parsed = JSON.parse(raw.replace(/^```json\s*|\s*```$/g, ""));
    mkdirSync(outDir, { recursive: true });
    writeFileSync(outFile, JSON.stringify(parsed, null, 2) + "\n");
    hashes[key] = hash;
    console.log("ok");
  }
}

writeFileSync(HASH_FILE, JSON.stringify(hashes, null, 2) + "\n");
console.log("done");
