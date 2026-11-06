/**
 * Everything the dev-only /routes page shows for one brand: the strategy, each
 * route with its gate results, its marks as inline SVG, its fonts, and its
 * scores. SVGs, scores and font files are read from disk on every request so a
 * re-render shows up on refresh.
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { routeSets } from "@/brands/routes.generated";
import { routeProblems } from "./gates";
import type { Route } from "./route";
import type { Face } from "./schema";

const brandsDir = join(process.cwd(), "brands");

export const boardSlugs = Object.keys(routeSets);

// Single-color marks take their color from CSS, as in scripts/brands.ts.
function inlineSvg(path: string) {
  if (!existsSync(path)) return null;
  return readFileSync(path, "utf8")
    .replace(/<\?xml[^>]*\?>\s*/, "")
    .replace(/\s(width|height)="[^"]*"/g, "")
    .replace(/(fill|stroke)="(?!none)[^"]*"/g, '$1="currentColor"')
    .replace("<svg ", '<svg aria-hidden="true" focusable="false" ')
    .trim();
}

type LibraryFamily = { id: string; weights?: [number, number]; sha256?: Record<string, string> };

export type FontFace = { family: string; src: string; weight: string; style: "normal" | "italic" };

/** @font-face rules for a face, served by app/routes/[slug]/fonts. */
function fontFaces(slug: string, face: Face, library: LibraryFamily[]): FontFace[] {
  const family = library.find((f) => f.id === face.library);
  if (!family?.sha256) return [];
  const [min, max] = family.weights ?? [400, 400];
  return Object.keys(family.sha256)
    .filter((file) => /\.(ttf|otf)$/i.test(file))
    .map((file) => ({
      family: `lib-${family.id}`,
      src: `/routes/${slug}/fonts/${family.id}/${encodeURIComponent(file)}`,
      weight: min === max ? `${min}` : `${min} ${max}`,
      style: /italic/i.test(file) ? "italic" : "normal",
    }));
}

export type Score = { criterion: string; score: number | null; evidence: string };

/** Reads one route's section of work/scores.md, in the format the brand-score skill writes. */
function scoresFor(markdown: string, letter: string) {
  const section = markdown.split(/^## /m).find((s) => s.startsWith(`Route ${letter.toUpperCase()}`));
  if (!section) return null;
  const rows: Score[] = section
    .split("\n")
    .filter((line) => /^\|/.test(line) && !/^\|\s*-/.test(line) && !/^\|\s*Criterion/i.test(line))
    .flatMap((line) => {
      const [criterion, score, evidence] = line.split("|").slice(1, -1).map((cell) => cell.trim());
      // A row the brand-score skill didn't write in full is not a score.
      if (criterion === undefined || score === undefined || evidence === undefined) return [];
      return [{ criterion, score: /^\d$/.test(score) ? Number(score) : null, evidence }];
    });
  const pick = (label: string) => section.match(new RegExp(`\\*\\*${label}:\\*\\*\\s*([^*]+)`))?.[1]?.trim();
  return { rows, strongest: pick("Strongest"), weakest: pick("Weakest") };
}

export type BoardRoute = ReturnType<typeof boardRoute>;

function boardRoute(slug: string, route: Route, problems: string[], library: LibraryFamily[], scores: string) {
  const dir = join(brandsDir, slug, "work", "routes", route.letter, "marks");
  const marks = [route.marks.primary, route.marks.symbol, ...(route.marks.alternates ?? [])].filter(
    (m) => m !== undefined,
  );
  const svg = Object.fromEntries(marks.map((m) => [m.file, inlineSvg(join(dir, m.file))]));
  const { display, text, mono } = route.type;
  const faces = [display, text, ...(mono ? [mono] : [])];
  return {
    route,
    problems,
    svg,
    fonts: faces.flatMap((face) => fontFaces(slug, face, library)),
    family: (face: "display" | "text" | "mono") => {
      const chosen = route.type[face] ?? text;
      return `"lib-${chosen.library}", system-ui, sans-serif`;
    },
    color: (name: string) => route.colors.find((c) => c.name === name)?.hex ?? "#000",
    scores: scoresFor(scores, route.letter),
  };
}

export function getBoard(slug: string) {
  const set = routeSets[slug];
  if (!set) return null;
  const library: LibraryFamily[] = JSON.parse(
    readFileSync(join(process.cwd(), "fonts", "library.json"), "utf8"),
  ).families;
  const scoresPath = join(brandsDir, slug, "work", "scores.md");
  const scores = existsSync(scoresPath) ? readFileSync(scoresPath, "utf8") : "";
  return {
    slug,
    strategy: set.strategy,
    routes: set.routes.map((route) =>
      boardRoute(slug, route, routeProblems(slug, set.strategy, route), library, scores),
    ),
    picked: scores.match(/^picked:\s*([abc])\s*$/m)?.[1] ?? null,
  };
}

/** Font files a board may serve: only those in a brand's fonts/ folder. */
export function fontFile(slug: string, parts: string[]) {
  if (!boardSlugs.includes(slug) || parts.some((p) => p === ".." || p.includes("/"))) return null;
  const path = join(brandsDir, slug, "fonts", ...parts);
  return /\.(ttf|otf)$/i.test(path) && existsSync(path) ? readFileSync(path) : null;
}
