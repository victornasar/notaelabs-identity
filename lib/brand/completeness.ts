/**
 * Whether a brand is a complete brand book: each of the nine parts in
 * `parts` is either there in full or marked not applicable with a reason.
 * Node only: it reads the brand's work/ and images/ folders. Used by
 * `pnpm check-brand`, the last gate of /brand.
 */

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { parts, type Brand, type Part } from "./schema";

export type PartReport =
  | { part: Part; status: "complete" }
  | { part: Part; status: "missing"; missing: string[] }
  | { part: Part; status: "not applicable"; reason: string };

/** Credits for the reference photographs, one per file in `images/`. */
export type ImageCredit = { file: string; photographer: string; source: string; license: string };

const root = process.cwd();

// The least a professional book shows of each list.
const least = { values: 3, voiceLines: 3, rewrites: 2, misuse: 4, grounds: 2, scale: 4, references: 6, applications: 4 };

function need(out: string[], ok: unknown, what: string) {
  if (!ok) out.push(what);
}

function count(out: string[], list: unknown[] | undefined, min: number, what: string) {
  const n = list?.length ?? 0;
  if (n < min) out.push(`${what}: ${n} of at least ${min}.`);
}

const checks: Record<Part, (brand: Brand) => string[]> = {
  strategy(brand) {
    const out: string[] = [];
    const { story, category } = brand;
    need(out, brand.positioning?.trim(), "positioning.");
    need(out, story?.mission?.trim(), "story.mission.");
    need(out, story?.vision?.trim(), "story.vision.");
    count(out, story?.values, least.values, "story.values");
    need(out, story?.audience?.trim(), "story.audience.");
    count(out, story?.personality, 2, "story.personality");
    const described = new Set((category.identities ?? []).map((i) => i.name));
    for (const name of category.competitors) {
      need(out, described.has(name), `category.identities: how ${name}'s identity looks.`);
    }
    return out;
  },

  "creative-direction"(brand) {
    const out: string[] = [];
    const work = join(root, "brands", brand.slug, "work");
    const routes = existsSync(join(work, "routes"))
      ? readdirSync(join(work, "routes")).filter((l) => existsSync(join(work, "routes", l, "route.ts")))
      : [];
    count(out, routes, 2, "routes in work/routes");
    const scores = join(work, "scores.md");
    need(out, existsSync(scores) && /^picked:\s*[abc]\s*$/m.test(readFileSync(scores, "utf8")), "a picked route in work/scores.md.");
    return out;
  },

  logo(brand) {
    const out: string[] = [];
    const { marks } = brand;
    need(out, marks.symbol, "marks.symbol, for icons and small spaces.");
    count(out, marks.alternates, 1, "marks.alternates (horizontal or stacked lockups)");
    count(out, marks.on, least.grounds, "marks.on (light and dark grounds)");
    count(out, marks.misuse, least.misuse, "marks.misuse");
    need(out, marks.minimumSize.print, "marks.minimumSize.print.");
    return out;
  },

  type(brand) {
    const out: string[] = [];
    const { scale, rules } = brand.type;
    count(out, scale.steps, least.scale, "type.scale.steps");
    for (const step of scale.steps.filter((s) => s.face === "display" && s.size > 40)) {
      need(out, step.mobileSize, `type.scale.${step.id}.mobileSize.`);
    }
    count(out, rules, 1, "type.rules");
    return out;
  },

  color(brand) {
    const out: string[] = [];
    for (const color of brand.colors) {
      need(out, color.cmyk, `colors.${color.name}.cmyk.`);
      if (color.role === "accent") need(out, color.pantone, `colors.${color.name}.pantone.`);
    }
    const pairs = brand.colors.flatMap((c) => c.pairs ?? []);
    need(out, pairs.some((p) => p.as === "text"), "a color pairing approved for text.");
    return out;
  },

  "graphic-language"(brand) {
    const out: string[] = [];
    count(out, brand.graphicLanguage?.elements, 1, "graphicLanguage.elements");
    count(out, brand.graphicLanguage?.layout, 1, "graphicLanguage.layout");
    return out;
  },

  photography(brand) {
    const out: string[] = [];
    const photo = brand.photography;
    if (!photo) return ["photography: style, subjects, lighting, composition, treatment, cropping, avoid, references."];
    count(out, photo.subjects, 1, "photography.subjects");
    count(out, photo.avoid, 1, "photography.avoid");
    count(out, photo.references, least.references, "photography.references");
    const dir = join(root, "brands", brand.slug, "images");
    const creditsFile = join(dir, "credits.json");
    const credits: ImageCredit[] = existsSync(creditsFile) ? JSON.parse(readFileSync(creditsFile, "utf8")) : [];
    for (const file of photo.references) {
      need(out, existsSync(join(dir, file)), `images/${file}.`);
      const credit = credits.find((c) => c.file === file);
      need(out, credit?.photographer && credit.source && credit.license, `images/credits.json entry for ${file}.`);
    }
    return out;
  },

  applications(brand) {
    const out: string[] = [];
    const kinds = new Set((brand.applications ?? []).map((a) => a.kind));
    count(out, [...kinds], least.applications, "applications (distinct kinds)");
    return out;
  },

  guidelines(brand) {
    const out: string[] = [];
    const { voice } = brand;
    count(out, voice?.traits, 2, "voice.traits");
    count(out, voice?.lines, least.voiceLines, "voice.lines (do and don't)");
    count(out, voice?.rewrites, least.rewrites, "voice.rewrites");
    return out;
  },
};

export function completeness(brand: Brand): PartReport[] {
  return parts.map((part) => {
    const reason = brand.notApplicable?.[part];
    if (reason !== undefined) {
      return reason.trim()
        ? { part, status: "not applicable", reason }
        : { part, status: "missing", missing: [`notApplicable.${part} needs a reason.`] };
    }
    const missing = checks[part](brand);
    return missing.length ? { part, status: "missing", missing } : { part, status: "complete" };
  });
}
