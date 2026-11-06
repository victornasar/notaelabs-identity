/**
 * Route B, Cut-off. Wordmark from Big Shoulders (opsz 72, wght 800) in capitals;
 * the hyphen becomes a beam of light falling from a cut-off. The symbol is the
 * fitting and its beam.
 *   node brands/okonkwo/work/routes/b/build.mjs
 */
import { writeFileSync } from "node:fs";
import { bounds, loadFont, moveBy, setText, shapes, toSvg } from "../../../../../scripts/lib/outline.ts";

const here = new URL(".", import.meta.url).pathname;
const fonts = here + "../../../fonts/";
const display = loadFont(fonts + "big-shoulders/BigShoulders[opsz,wght].ttf", { opsz: 72, wght: 800 });
const text = loadFont(fonts + "chivo/Chivo[wght].ttf", { wght: 500 });

const run = setText(display, "OKONKWO-MARCHETTI", { size: 1000, tracking: 0.012 });
const cap = run.capHeight;

// Change 1: the hyphen becomes a beam, a trapezoid from 0.6 cap height to the
// baseline, 0.1 cap wide at its flat top (the cut-off) and 0.36 cap at its foot,
// short enough that it can't be read as an A.
const i = run.glyphs.findIndex((g) => g.char === "-");
const left = bounds(run.glyphs[i - 1].commands).x2;
const right = bounds(run.glyphs[i + 1].commands).x1;
const GAP = cap * 0.12;
const TOP = cap * 0.1;
const FOOT = cap * 0.36;
const RISE = cap * 0.6;
const cx = left + GAP + FOOT / 2;
run.glyphs[i].commands = shapes.polygon([
  [cx - TOP / 2, -RISE],
  [cx + TOP / 2, -RISE],
  [cx + FOOT / 2, 0],
  [cx - FOOT / 2, 0],
]);
const shift = cx + FOOT / 2 + GAP - right;
for (const g of run.glyphs.slice(i + 1)) g.commands = moveBy(g.commands, shift);
const wordmark = run.glyphs.map((g) => g.commands);
writeFileSync(here + "marks/wordmark.svg", toSvg(wordmark));

// Symbol on a 24-unit grid: the fitting (a bar), a 2-unit gap, then the beam
// widening from 6 to 20 units. Nothing thinner than 3 units.
const fitting = shapes.rect(8, 2, 8, 3);
const beam = shapes.polygon([[9, 7], [15, 7], [22, 22], [2, 22]]);
writeFileSync(here + "marks/symbol.svg", toSvg([fitting, beam]));

// Lockup: symbol at the height of wordmark plus descriptor, then the two lines.
// The descriptor is sized so it spans the wordmark's width exactly.
const wb = bounds(wordmark.flat());
const probe = setText(text, "ARCHITECTURAL LIGHTING STUDIO", { size: 1000, tracking: 0.12 });
const pb = bounds(probe.glyphs.flatMap((g) => g.commands));
const desc = setText(text, "ARCHITECTURAL LIGHTING STUDIO", { size: (1000 * (wb.x2 - wb.x1)) / (pb.x2 - pb.x1), tracking: 0.12 });
const db = bounds(desc.glyphs.flatMap((g) => g.commands));
const descLine = desc.glyphs.map((g) => moveBy(g.commands, wb.x1 - db.x1, cap * 0.32 + desc.capHeight));
const total = cap * 0.32 + desc.capHeight;
const s = (total + cap) / 20;
const sym = [fitting, beam].map((p) =>
  p.map((c) => (c.type === "Z" ? c : { ...c, x: wb.x1 - cap * 0.5 - (24 - c.x) * s, y: -cap + (c.y - 2) * s })),
);
writeFileSync(here + "marks/lockup.svg", toSvg([...sym, ...wordmark, ...descLine]));
console.log("route b: wordmark, symbol, lockup");
