/**
 * Route A, Pool. Wordmark from Newsreader (opsz 72, wght 520); the hyphen
 * becomes a pool of light lying on the baseline between the two names.
 *   node brands/okonkwo/work/routes/a/build.mjs
 */
import { writeFileSync } from "node:fs";
import { bounds, loadFont, moveBy, setText, toSvg } from "../../../../../scripts/lib/outline.mjs";

const here = new URL(".", import.meta.url).pathname;
const fonts = here + "../../../fonts/";
const display = loadFont(fonts + "newsreader/Newsreader[opsz,wght].ttf", { opsz: 72, wght: 520 });
const text = loadFont(fonts + "libre-franklin/LibreFranklin[wght].ttf", { wght: 500 });

// A flat 3:1 ellipse centred on (cx, cy).
const pool = (cx, cy, width) => ellipse(cx, cy, width / 2, width / 6);
function ellipse(cx, cy, rx, ry) {
  const kx = 0.5522847498 * rx;
  const ky = 0.5522847498 * ry;
  return [
    { type: "M", x: cx + rx, y: cy },
    { type: "C", x1: cx + rx, y1: cy + ky, x2: cx + kx, y2: cy + ry, x: cx, y: cy + ry },
    { type: "C", x1: cx - kx, y1: cy + ry, x2: cx - rx, y2: cy + ky, x: cx - rx, y: cy },
    { type: "C", x1: cx - rx, y1: cy - ky, x2: cx - kx, y2: cy - ry, x: cx, y: cy - ry },
    { type: "C", x1: cx + kx, y1: cy - ry, x2: cx + rx, y2: cy - ky, x: cx + rx, y: cy },
    { type: "Z" },
  ];
}

const run = setText(display, "Okonkwo-Marchetti", { size: 1000, tracking: -0.012 });

// Change 1: the hyphen, the join between the partners, becomes a pool: a 3:1
// ellipse 1.6 times the hyphen's width, centred where the hyphen was.
const i = run.glyphs.findIndex((g) => g.char === "-");
const hb = bounds(run.glyphs[i].commands);
const POOL = (hb.x2 - hb.x1) * 1.6;
const growth = POOL - (hb.x2 - hb.x1);
run.glyphs[i].commands = pool((hb.x1 + hb.x2) / 2 + growth / 2, (hb.y1 + hb.y2) / 2, POOL);
for (const g of run.glyphs.slice(i + 1)) g.commands = moveBy(g.commands, growth);

const wordmark = run.glyphs.map((g) => g.commands);
writeFileSync(here + "marks/wordmark.svg", toSvg(wordmark));

// Symbol: the partners' initials joined by the pool, O·M, with tighter spacing
// so the three parts hold together as one shape at small sizes.
const mono = setText(display, "O-M", { size: 1000, tracking: -0.04 });
const mb = bounds(mono.glyphs[1].commands);
const MONO_POOL = (mb.x2 - mb.x1) * 1.4;
mono.glyphs[1].commands = pool((mb.x1 + mb.x2) / 2, (mb.y1 + mb.y2) / 2, MONO_POOL);
writeFileSync(here + "marks/symbol.svg", toSvg(mono));

// Lockup: wordmark over the descriptor, set in the text face and spaced to the wordmark's width.
const wb = bounds(wordmark.flat());
const desc = setText(text, "ARCHITECTURAL LIGHTING STUDIO", { size: 1000, tracking: 0.14 });
const db = bounds(desc.glyphs.flatMap((g) => g.commands));
const scale = (wb.x2 - wb.x1) / (db.x2 - db.x1) * 0.78;
const descPaths = desc.glyphs.map((g) =>
  g.commands.map((c) => {
    const n = { ...c };
    for (const [kx, ky] of [["x", "y"], ["x1", "y1"], ["x2", "y2"]]) {
      if (kx in n) [n[kx], n[ky]] = [wb.x1 + (n[kx] - db.x1) * scale, run.capHeight * 0.55 + (n[ky] - db.y2) * scale + (db.y2 - db.y1) * scale];
    }
    return n;
  }),
);
writeFileSync(here + "marks/lockup.svg", toSvg([...wordmark, ...descPaths]));
console.log("route a: wordmark, symbol, lockup");
