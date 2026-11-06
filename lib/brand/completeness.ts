/**
 * Whether a brand is a complete brand book: each section in `parts` is either
 * there in full or marked not applicable with a reason. Used by
 * `pnpm check-brand`, the last gate of /brand.
 */

import { parts, physicalKinds, type Brand, type Part } from "./schema";

export type PartReport =
  | { part: Part; status: "complete" }
  | { part: Part; status: "missing"; missing: string[] }
  | { part: Part; status: "not applicable"; reason: string };

// The least a professional book shows of each list.
const least = { voiceLines: 3, misuse: 4, grounds: 2, scale: 4, physical: 2, digital: 2 };

function need(out: string[], ok: unknown, what: string) {
  if (!ok) out.push(what);
}

function count(out: string[], list: unknown[] | undefined, min: number, what: string) {
  const n = list?.length ?? 0;
  if (n < min) out.push(`${what}: ${n} of at least ${min}.`);
}

const checks: Record<Part, (brand: Brand) => string[]> = {
  intro(brand) {
    const out: string[] = [];
    need(out, brand.positioning?.trim(), "positioning.");
    need(out, brand.story?.mission?.trim(), "story.mission.");
    return out;
  },

  wordmark(brand) {
    const out: string[] = [];
    need(out, brand.marks.primary.meaning?.trim(), "marks.primary.meaning: what the wordmark means.");
    need(out, brand.type.wordmark, "type.wordmark: the font it was drawn from and what changed.");
    count(out, brand.marks.misuse, least.misuse, "marks.misuse");
    return out;
  },

  "logo-mark"(brand) {
    const out: string[] = [];
    const { symbol } = brand.marks;
    need(out, symbol, "marks.symbol.");
    need(out, symbol?.meaning?.trim(), "marks.symbol.meaning: what the mark represents.");
    count(out, brand.marks.on, least.grounds, "marks.on (light and dark grounds)");
    need(out, brand.marks.minimumSize.print, "marks.minimumSize.print.");
    return out;
  },

  "graphic-device"(brand) {
    const out: string[] = [];
    const { device } = brand;
    if (!device) return ["device: the brand's one graphic device and its applications."];
    count(out, device.rules, 1, "device.rules");
    const kinds = new Set(device.applications.map((a) => a.kind));
    count(out, [...kinds].filter((k) => physicalKinds.includes(k)), least.physical, "device.applications (physical)");
    count(out, [...kinds].filter((k) => !physicalKinds.includes(k)), least.digital, "device.applications (digital)");
    return out;
  },

  colors(brand) {
    const out: string[] = [];
    for (const color of brand.colors) {
      need(out, color.cmyk, `colors.${color.name}.cmyk.`);
      if (color.role === "accent") need(out, color.pantone, `colors.${color.name}.pantone.`);
    }
    const pairs = brand.colors.flatMap((c) => c.pairs ?? []);
    need(out, pairs.some((p) => p.as === "text"), "a color pairing approved for text.");
    return out;
  },

  typography(brand) {
    const out: string[] = [];
    const { scale, fit } = brand.type;
    need(out, fit?.trim(), "type.fit: why the faces fit the brand.");
    count(out, scale.steps, least.scale, "type.scale.steps");
    for (const step of scale.steps.filter((s) => s.face === "display" && s.size > 40)) {
      need(out, step.mobileSize, `type.scale.${step.id}.mobileSize.`);
    }
    return out;
  },

  closing(brand) {
    const out: string[] = [];
    count(out, brand.voice?.lines, least.voiceLines, "voice.lines (write this, not that)");
    need(out, brand.voice?.signoff?.trim(), "voice.signoff.");
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
