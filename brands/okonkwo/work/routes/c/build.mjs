/**
 * Route C, Dusk. Wordmark from Familjen Grotesk (wght 620). The symbol is a
 * beam drawn in three steps, one per color temperature in kelvin-steps.
 *   node brands/okonkwo/work/routes/c/build.mjs
 */
import { writeFileSync } from "node:fs";
import { bounds, loadFont, moveBy, setText, shapes, toSvg } from "../../../../../scripts/lib/outline.mjs";

const here = new URL(".", import.meta.url).pathname;
const fonts = here + "../../../fonts/";
const display = loadFont(fonts + "familjen-grotesk/FamiljenGrotesk[wght].ttf", { wght: 620 });

const run = setText(display, "Okonkwo-Marchetti", { size: 1000, tracking: -0.022 });
const cap = run.capHeight;

// Change 1: the hyphen is redrawn as a step, a bar at the stem's weight and
// 0.42 cap long, sitting at the x-height's midline, so it matches a step of the symbol.
const i = run.glyphs.findIndex((g) => g.char === "-");
const hb = bounds(run.glyphs[i].commands);
const stem = (() => {
  const l = setText(display, "l", { size: 1000 }).glyphs[0].commands;
  const b = bounds(l);
  return b.x2 - b.x1;
})();
const LEN = cap * 0.42;
const mid = (hb.y1 + hb.y2) / 2;
const grow = LEN - (hb.x2 - hb.x1);
run.glyphs[i].commands = shapes.rect(hb.x1, mid - stem / 2, LEN, stem);
for (const g of run.glyphs.slice(i + 1)) g.commands = moveBy(g.commands, grow);

// Change 2: k–w and w–o pairs closed by 14 units each, so the two w's stop
// opening holes in the rhythm.
for (const [a, b] of [["k", "w"], ["w", "o"]]) {
  for (let j = 0; j < run.glyphs.length - 1; j++) {
    if (run.glyphs[j].char === a && run.glyphs[j + 1].char === b) {
      for (const g of run.glyphs.slice(j + 1)) g.commands = moveBy(g.commands, -14);
    }
  }
}
const wordmark = run.glyphs.map((g) => g.commands);
writeFileSync(here + "marks/wordmark.svg", toSvg(wordmark));

// Symbol on a 24-unit grid: three steps widening downward, 4 units tall with
// 2.5-unit gaps; the light gets wider and warmer as it reaches the ground.
const steps = [
  shapes.rect(8, 3, 8, 4),
  shapes.rect(5, 9.5, 14, 4),
  shapes.rect(2, 16, 20, 5),
];
writeFileSync(here + "marks/symbol.svg", toSvg(steps));

// Lockup: symbol to the left at the wordmark's cap height plus descender room.
const wb = bounds(wordmark.flat());
const s = (wb.y2 - wb.y1) / 18;
const sym = steps.map((p) =>
  p.map((c) => (c.type === "Z" ? c : { ...c, x: wb.x1 - cap * 0.45 - (22 - c.x) * s, y: wb.y1 + (c.y - 3) * s })),
);
writeFileSync(here + "marks/lockup.svg", toSvg([...sym, ...wordmark]));
console.log("route c: wordmark, symbol, lockup");
