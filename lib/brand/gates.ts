/**
 * The gates a route must pass before the client sees it. Node only: it reads
 * fonts/library.json, the brand's font files and the route's SVGs and renders.
 * Used by `pnpm check-route` and by the local /routes page.
 */

import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { toOklch } from "./color";
import type { Route } from "./route";
import { problems, type BrandColor, type Face, type Strategy, type WordmarkSource } from "./schema";

type LibraryFamily = {
  id: string;
  family: string;
  status: "candidate" | "approved" | "rejected";
  decision?: string;
  weights?: [number, number];
  sha256?: Record<string, string>;
};
type Library = { excluded: { family: string }[]; families: LibraryFamily[] };

// Next and the scripts both run from the repository root.
const root = process.cwd();
const library = (): Library => JSON.parse(readFileSync(join(root, "fonts", "library.json"), "utf8"));
const sha256 = (path: string) => createHash("sha256").update(readFileSync(path)).digest("hex");

function overridden(strategy: Strategy, rule: string) {
  return strategy.overrides?.some((o) => o.rule === rule) ?? false;
}

/** Real, licensed, approved, present and unaltered. */
export function fontProblems(slug: string, strategy: Strategy, faces: (Face | WordmarkSource)[]): string[] {
  const { excluded, families } = library();
  const out: string[] = [];
  for (const face of faces) {
    const family = families.find((f) => f.id === face.library);
    if (!family) {
      out.push(`"${face.library}" is not in fonts/library.json. Never invent or rename a typeface.`);
      continue;
    }
    if (family.family !== face.family) {
      out.push(`${face.library} is called "${family.family}", not "${face.family}".`);
    }
    const isExcluded = excluded.some((e) =>
      e.family.split("/").some((name) => family.family.startsWith(name.replace(/\(all\)/, "").trim())),
    );
    if (isExcluded && !overridden(strategy, `excluded-font:${family.id}`)) {
      out.push(`${family.family} is excluded; it needs an "excluded-font:${family.id}" override in strategy.ts.`);
    }
    if (family.status !== "approved" && !overridden(strategy, `${family.status}-font:${family.id}`)) {
      out.push(`${family.family} is ${family.status}${family.decision ? `: ${family.decision}` : ""}.`);
    }
    if ("weights" in face && family.weights) {
      const [min, max] = family.weights;
      for (const weight of face.weights) {
        if (weight < min || weight > max) out.push(`${family.family} has no weight ${weight} (${min}–${max}).`);
      }
    }
    const dir = join(root, "brands", slug, "fonts", family.id);
    for (const [file, hash] of Object.entries(family.sha256 ?? {})) {
      const path = join(dir, file);
      if (!existsSync(path)) {
        out.push(`brands/${slug}/fonts/${family.id}/${file} is missing; run \`pnpm fonts add ${family.id} ${slug}\`.`);
      } else if (sha256(path) !== hash) {
        out.push(`brands/${slug}/fonts/${family.id}/${file} does not match its pinned hash.`);
      }
    }
  }
  return out;
}

/** OKLCH lightness, chroma and hue, as numbers. */
export function lch(hex: string) {
  const [l, c, h] = toOklch(hex).match(/[\d.]+/g)!.map(Number);
  return { l: l / 100, c, h };
}

const isOffWhite = (hex: string) => lch(hex).l > 0.93 && lch(hex).c < 0.03;
const isNearBlack = (hex: string) => lch(hex).l < 0.28 && lch(hex).c < 0.03;
const isSaturatedBlue = (hex: string) => {
  const { c, h } = lch(hex);
  return c > 0.1 && h >= 235 && h <= 285;
};
const isBluePurple = (hex: string) => {
  const { c, h } = lch(hex);
  return c > 0.06 && h >= 235 && h <= 330;
};

/** The two looks banned without the client's written override. */
export function banProblems(strategy: Strategy, colors: BrandColor[], svgs: string[]): string[] {
  const out: string[] = [];
  const hexes = colors.map((c) => c.hex);
  if (
    hexes.some(isOffWhite) &&
    hexes.some(isNearBlack) &&
    hexes.some(isSaturatedBlue) &&
    !overridden(strategy, "palette-ban")
  ) {
    out.push("Off-white, near-black and a saturated blue: the banned default palette.");
  }
  for (const svg of svgs) {
    for (const gradient of svg.match(/<(linear|radial)Gradient[\s\S]*?<\/\1Gradient>/g) ?? []) {
      const stops = [...gradient.matchAll(/stop-color[=:]\s*"?(#[0-9a-f]{3,6})/gi)].map((m) => m[1]);
      if (stops.filter(isBluePurple).length > 0 && !overridden(strategy, "gradient-ban")) {
        out.push(`A blue-purple gradient (${stops.join(" → ")}): banned.`);
      }
    }
  }
  return out;
}

const svgFiles = (dir: string) =>
  existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith(".svg")).map((f) => join(dir, f)) : [];

/** Every reason a route goes back before the client sees it. Empty means it may be shown. */
export function routeProblems(slug: string, strategy: Strategy, route: Route): string[] {
  const dir = join(root, "brands", slug, "work", "routes", route.letter);
  const label = `route ${route.letter.toUpperCase()}`;
  const marks = [route.marks.primary, route.marks.symbol, ...(route.marks.alternates ?? [])].filter(
    (m) => m !== undefined,
  );
  const out = problems(label, strategy, route);

  const { display, text, mono, wordmark } = route.type;
  const faces = [display, text, ...(mono ? [mono] : []), ...(wordmark ? [wordmark] : [])];
  out.push(...fontProblems(slug, strategy, faces).map((p) => `${label}: ${p}`));
  if (!wordmark) out.push(`${label}: type.wordmark must name the library font the wordmark started from.`);

  for (const mark of marks) {
    const svg = join(dir, "marks", mark.file);
    if (!existsSync(svg)) out.push(`${label}: marks/${mark.file} is missing.`);
    else if (/<text[\s>]/.test(readFileSync(svg, "utf8"))) {
      out.push(`${label}: marks/${mark.file} contains live <text>; marks are outlines.`);
    }
    const stem = mark.file.replace(/\.svg$/, "");
    for (const size of [16, 64]) {
      if (!existsSync(join(dir, "renders", `${stem}-${size}.png`))) {
        out.push(`${label}: renders/${stem}-${size}.png is missing; run \`pnpm render-marks brands/${slug}/work/routes/${route.letter}\`.`);
      }
    }
  }
  for (const [key, { readable, saw }] of Object.entries(route.review)) {
    if (!saw.trim()) out.push(`${label}: review.${key} is empty; look at the renders and write what you saw.`);
    if (!readable) out.push(`${label}: unreadable ${key === "at16" ? "at 16px" : key === "at64" ? "at 64px" : "as a lockup"}: ${saw}`);
  }

  const { tile, hero, card } = route.applications;
  for (const [where, surface] of Object.entries({ tile, hero, card })) {
    for (const name of [surface.ground, surface.ink]) {
      if (!route.colors.some((c) => c.name === name)) out.push(`${label}: applications.${where} uses "${name}", not a route color.`);
    }
    const ink = route.colors.find((c) => c.name === surface.ink);
    const used = ink?.pairs?.some((p) => p.on === surface.ground);
    if (ink && !used) out.push(`${label}: applications.${where} sets ${surface.ink} on ${surface.ground}, a pairing the palette doesn't list.`);
  }
  if (!marks.some((m) => m.file === tile.mark)) out.push(`${label}: applications.tile.mark "${tile.mark}" is not a route mark.`);

  const svgs = [...svgFiles(join(dir, "marks")), ...svgFiles(dir)].map((f) => readFileSync(f, "utf8"));
  out.push(...banProblems(strategy, route.colors, svgs).map((p) => `${label}: ${p}`));
  return out;
}
