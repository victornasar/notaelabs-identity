/**
 * The book's sections, in order: the one list the page, its nav and
 * `pnpm check-brand` all read. Each section says what a brand must give it.
 *
 * Required sections are in every book. An optional one is either there in
 * full or left out with a reason in `brand.notApplicable`, so "left out on
 * purpose" can't be confused with "forgotten".
 */
import { physicalKinds, type Brand } from "./schema";

// The least a professional book shows of each list.
const least = { voiceLines: 3, misuse: 4, grounds: 2, scale: 4, physical: 2, digital: 2 };

function need(out: string[], ok: unknown, what: string) {
  if (!ok) out.push(what);
}

function count(out: string[], list: readonly unknown[] | undefined, min: number, what: string) {
  const n = list?.length ?? 0;
  if (n < min) out.push(`${what}: ${n} of at least ${min}.`);
}

type Section = {
  id: string;
  /** The nav label and the section's eyebrow. */
  label: string;
  /** In the nav, numbered. The cover is not. */
  nav: boolean;
  optional: boolean;
  /** Whether the brand has this section at all. */
  has: (brand: Brand) => boolean;
  /** What the brand still lacks for it, as fields to fill. Empty when complete. */
  missing: (brand: Brand) => string[];
};

export const sections = [
  {
    id: "cover",
    label: "Cover",
    nav: false,
    optional: false,
    has: () => true,
    missing(brand) {
      const out: string[] = [];
      need(out, brand.positioning.trim(), "positioning.");
      need(out, brand.story?.mission?.trim(), "story.mission.");
      return out;
    },
  },
  {
    id: "marks",
    label: "Marks",
    nav: true,
    optional: false,
    has: () => true,
    missing(brand) {
      const out: string[] = [];
      const { primary, symbol, misuse, on, minimumSize } = brand.marks;
      need(out, primary.meaning?.trim(), "marks.primary.meaning: what the wordmark means.");
      need(out, brand.type.wordmark, "type.wordmark: the font it was drawn from and what changed.");
      count(out, misuse, least.misuse, "marks.misuse");
      count(out, on, least.grounds, "marks.on (light and dark grounds)");
      need(out, minimumSize.print, "marks.minimumSize.print.");
      // A symbol is optional, but one that exists says what it represents.
      if (symbol) need(out, symbol.meaning?.trim(), "marks.symbol.meaning: what the mark represents.");
      return out;
    },
  },
  {
    id: "color",
    label: "Color",
    nav: true,
    optional: false,
    has: () => true,
    missing(brand) {
      const out: string[] = [];
      for (const color of brand.colors) {
        need(out, color.cmyk, `colors.${color.name}.cmyk.`);
        if (color.role === "accent") need(out, color.pantone, `colors.${color.name}.pantone.`);
      }
      need(out, brand.colors.flatMap((c) => c.pairs ?? []).some((p) => p.as === "text"), "a color pairing approved for text.");
      return out;
    },
  },
  {
    id: "type",
    label: "Type",
    nav: true,
    optional: false,
    has: () => true,
    missing(brand) {
      const out: string[] = [];
      const { scale, fit } = brand.type;
      need(out, fit?.trim(), "type.fit: why the faces fit the brand.");
      count(out, scale.steps, least.scale, "type.scale.steps");
      for (const step of scale.steps.filter((s) => s.face === "display" && s.size > 40)) {
        need(out, step.mobileSize, `type.scale.${step.id}.mobileSize.`);
      }
      return out;
    },
  },
  {
    id: "imagery",
    label: "Imagery",
    nav: true,
    optional: true,
    has: (brand) => Boolean(brand.device),
    missing(brand) {
      const { device } = brand;
      if (!device) return ["device: the brand's one graphic device and where it goes."];
      const out: string[] = [];
      count(out, device.rules, 1, "device.rules");
      const kinds = [...new Set(device.applications.map((a) => a.kind))];
      count(out, kinds.filter((k) => physicalKinds.includes(k)), least.physical, "device.applications (physical)");
      count(out, kinds.filter((k) => !physicalKinds.includes(k)), least.digital, "device.applications (digital)");
      return out;
    },
  },
  {
    id: "voice",
    label: "Voice",
    nav: true,
    optional: true,
    has: (brand) => Boolean(brand.voice),
    missing(brand) {
      const out: string[] = [];
      count(out, brand.voice?.lines, least.voiceLines, "voice.lines (write this, not that)");
      need(out, brand.voice?.signoff?.trim(), "voice.signoff.");
      return out;
    },
  },
] as const satisfies readonly Section[];

type Entry = (typeof sections)[number];
type NavEntry = Extract<Entry, { nav: true }>;

export type SectionId = Entry["id"];
export type NavSectionId = NavEntry["id"];
export type OptionalSectionId = Extract<Entry, { optional: true }>["id"];

export type SectionReport =
  | { id: SectionId; status: "complete" }
  | { id: SectionId; status: "missing"; missing: string[] }
  | { id: SectionId; status: "not applicable"; reason: string };

/** Whether the brand is a complete book, section by section. */
export function completeness(brand: Brand): SectionReport[] {
  return sections.map((section): SectionReport => {
    const { id } = section;
    const reason = section.optional ? brand.notApplicable?.[section.id] : undefined;
    if (reason !== undefined && !section.has(brand)) {
      return reason.trim()
        ? { id, status: "not applicable", reason }
        : { id, status: "missing", missing: [`notApplicable.${id} needs a reason.`] };
    }
    if (reason !== undefined) {
      return { id, status: "missing", missing: [`notApplicable.${id} is set, but the brand has this section.`] };
    }
    const missing = section.missing(brand);
    return missing.length ? { id, status: "missing", missing } : { id, status: "complete" };
  });
}

/** The sections a brand's page shows, numbered as the nav numbers them. */
export function pageSections(brand: Brand) {
  return sections
    .filter((s): s is NavEntry => s.nav && s.has(brand))
    .map((s, i) => ({ id: s.id, label: s.label, number: String(i + 1).padStart(2, "0") }));
}
export type PageSection = ReturnType<typeof pageSections>[number];
