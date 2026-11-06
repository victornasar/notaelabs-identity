/**
 * Okonkwo-Marchetti's graphic language, drawn from the strategy's primitives:
 * pool (a 3:1 ellipse), interval (a gap one pool wide), cone (the symbol's beam
 * angle) and cut-off (one hard horizontal edge). Single-color SVGs on a 2400 × 900
 * field; the page sets their ground and ink.
 *   node brands/okonkwo/graphics/build.mjs
 */
import { writeFileSync } from "node:fs";

const here = new URL(".", import.meta.url).pathname;
const W = 2400;
const H = 900;
const svg = (body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">${body}</svg>\n`;
const r = (n) => Math.round(n * 10) / 10;
const ellipse = (cx, cy, rx, ry, paint = 'fill="#000"') =>
  `<ellipse cx="${r(cx)}" cy="${r(cy)}" rx="${r(rx)}" ry="${r(ry)}" ${paint}/>`;

// The beam's spread, from the lamp symbol: 7 units out for every 15 down.
const SPREAD = 7 / 15;

// Pool row: 3:1 pools, each one pool-width apart, running off both edges.
const POOL = 300;
const pools = [];
for (let cx = POOL / 2; cx < W + POOL; cx += POOL * 2) pools.push(ellipse(cx, H / 2, POOL / 2, POOL / 6));
writeFileSync(here + "pool-row.svg", svg(pools.join("")));

// Beam and pool: a beam leaves the top edge (the cut-off), stops at a second
// cut-off, and its pool lies below on the ground, apart from it, so the two never
// merge into one cone-and-brim silhouette.
const top = 120;
const drop = 470;
const gap = 50;
const foot = top + 2 * SPREAD * drop;
const poolW = foot * 1.2;
const cx = W / 2;
const poolY = drop + gap + poolW / 6;
writeFileSync(
  here + "beam-and-pool.svg",
  svg(
    `<path fill="#000" d="M${r(cx - top / 2)} 0H${r(cx + top / 2)}L${r(cx + foot / 2)} ${drop}H${r(cx - foot / 2)}Z"/>` +
      ellipse(cx, poolY, poolW / 2, poolW / 6),
  ),
);

// Cut-off field: Sodium hangs from the top edge and stops at one hard line.
writeFileSync(here + "cut-off-field.svg", svg(`<rect width="${W}" height="${H * 0.58}" fill="#000"/>`));

// The walk: one pool per step at the interval; the current one is lit, the rest outlined.
const STEP = 180;
const count = 6;
const start = (W - (count * STEP + (count - 1) * STEP)) / 2 + STEP / 2;
const walk = Array.from({ length: count }, (_, i) =>
  i === 2
    ? ellipse(start + i * STEP * 2, H / 2, STEP / 2, STEP / 6)
    : ellipse(start + i * STEP * 2, H / 2, STEP / 2 - 3, STEP / 6 - 3, 'fill="none" stroke="#000" stroke-width="6"'),
);
writeFileSync(here + "walk.svg", svg(walk.join("")));
console.log("graphics: pool-row, beam-and-pool, cut-off-field, walk");
