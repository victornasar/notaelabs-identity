/**
 * Finds the font file and the Figma name for each weight a brand's faces use.
 * Figma lists a font by the family and style in its name table, and a
 * variable font by its named instances, so both are read from the file.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { parse } from "opentype.js/dist/opentype.mjs";
import type { BundleFont } from "../../lib/figma/bundle";
import type { Brand, TypeStyle } from "../../lib/brand/schema";

type Named = { family: string; styles: { style: string; weight: number }[] };

function readNames(path: string): Named & { italic: boolean } {
  const bytes = readFileSync(path);
  const font = parse(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
  const names = font.names.windows ?? font.names.macintosh ?? {};
  const en = (key: string) => (names as Record<string, { en?: string } | undefined>)[key]?.en;
  const family = en("preferredFamily") ?? en("fontFamily") ?? "";
  const subfamily = en("preferredSubfamily") ?? en("fontSubfamily") ?? "Regular";
  const italic = /italic|oblique/i.test(subfamily);

  const fvar = font.tables.fvar;
  if (!fvar) return { family, italic, styles: [{ style: subfamily, weight: font.tables.os2?.usWeightClass ?? 400 }] };

  // A named instance counts only at the default of every other axis, such as opsz.
  const defaults = Object.fromEntries(fvar.axes.map((a) => [a.tag, a.defaultValue]));
  const styles = fvar.instances
    .filter((i) => Object.entries(i.coordinates).every(([tag, v]) => tag === "wght" || v === defaults[tag]))
    .map((i) => ({ style: i.name.en ?? "", weight: i.coordinates.wght ?? defaults.wght ?? 400 }));
  return { family, italic, styles };
}

/**
 * Resolves every weight of every face the scale uses. Returns the fonts found
 * and, as problems, each face or weight the brand's font folder can't supply.
 */
export function resolveFonts(root: string, brand: Brand): { fonts: BundleFont[]; problems: string[] } {
  const fonts: BundleFont[] = [];
  const problems: string[] = [];
  const used = new Map<TypeStyle["face"], Set<number>>();
  for (const step of brand.type.scale.steps) used.set(step.face, (used.get(step.face) ?? new Set()).add(step.weight));

  for (const [face, weights] of used) {
    const spec = brand.type[face];
    if (!spec) continue; // schema.ts reports a step on a missing face.
    const dir = join(root, "brands", brand.slug, "fonts", spec.library);
    const files = existsSync(dir) ? readdirSync(dir).filter((f) => /\.(ttf|otf)$/i.test(f)) : [];
    const upright = files.map((f) => ({ file: join(dir, f), ...readNames(join(dir, f)) })).find((n) => !n.italic);
    if (!upright) {
      problems.push(`type.${face}: no upright font file in ${relative(root, dir)}/.`);
      continue;
    }
    for (const weight of [...weights].sort((a, b) => a - b)) {
      const match = upright.styles.find((s) => s.weight === weight);
      if (match) fonts.push({ face, weight, family: upright.family, style: match.style, file: relative(root, upright.file) });
      else problems.push(`type.${face}: ${relative(root, upright.file)} has no weight ${weight}.`);
    }
  }
  return { fonts, problems };
}
