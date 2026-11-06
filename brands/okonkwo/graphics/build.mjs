/**
 * Okonkwo-Marchetti's graphic device, the pool row, drawn from the strategy's
 * primitives: pool (a 3:1 ellipse) and interval (a gap one pool wide). A
 * single-color SVG on a 2400 × 900 field; the page sets its ground and ink.
 *   node brands/okonkwo/graphics/build.mjs
 */
import { writeFileSync } from "node:fs";

const here = new URL(".", import.meta.url).pathname;
const W = 2400;
const H = 900;
const svg = (body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">${body}</svg>\n`;
const r = (n) => Math.round(n * 10) / 10;
const ellipse = (cx, cy, rx, ry) => `<ellipse cx="${r(cx)}" cy="${r(cy)}" rx="${r(rx)}" ry="${r(ry)}" fill="#000"/>`;

// Pool row: 3:1 pools, each one pool-width apart, running off both edges.
const POOL = 300;
const pools = [];
// Centered on both edges, so a half pool is cut off at each.
for (let cx = 0; cx <= W; cx += POOL * 2) pools.push(ellipse(cx, H / 2, POOL / 2, POOL / 6));
writeFileSync(here + "pool-row.svg", svg(pools.join("")));

console.log("graphics: pool-row");
