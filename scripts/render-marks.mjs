/**
 * Renders every mark of a route (or any folder with a marks/ subfolder) to PNG,
 * so a person or an agent can look at what was drawn before anyone else does.
 *
 *   node scripts/render-marks.mjs brands/<slug>/work/routes/<a|b|c>
 *
 * Writes renders/<mark>-16.png, -64.png and -512.png (black on white), and
 * renders/review.png: each mark at 16px enlarged 8× with hard pixels, then at
 * 64px and 512px, on light and dark grounds. Read review.png to judge 16px.
 */
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { Resvg } from "@resvg/resvg-js";

const dir = process.argv[2];
if (!dir) {
  console.error("usage: node scripts/render-marks.mjs <folder with marks/>");
  process.exit(1);
}
const marksDir = join(dir, "marks");
const out = join(dir, "renders");
mkdirSync(out, { recursive: true });

const recolor = (svg, color) =>
  svg.replace(/(fill|stroke)="(?!none)[^"]*"/g, `$1="${color}"`).replace(/currentColor/g, color);

// Height-fitted render, so a wide wordmark is 16px tall, like it would be in a header.
function png(svg, height, color = "#000", background = "#fff") {
  return new Resvg(recolor(svg, color), { fitTo: { mode: "height", value: height }, background })
    .render()
    .asPng();
}

const marks = readdirSync(marksDir).filter((f) => f.endsWith(".svg")).sort();
const rows = [];
for (const file of marks) {
  const svg = readFileSync(join(marksDir, file), "utf8");
  const stem = file.replace(/\.svg$/, "");
  for (const size of [16, 64, 512]) writeFileSync(join(out, `${stem}-${size}.png`), png(svg, size));
  rows.push({ stem, svg });
}

// The review sheet: each mark gets two lines, light ground then dark ground.
const SCALE = 8;
const pad = 24;
const items = [];
let y = pad;
let width = 0;
for (const { stem, svg } of rows) {
  const [, , w, h] = svg.match(/viewBox="([^"]+)"/)[1].split(/\s+/).map(Number);
  const ratio = w / h;
  items.push(`<text x="${pad}" y="${y + 22}" font-family="monospace" font-size="24">${stem}: 16px ×${SCALE}, 64px, 128px</text>`);
  y += 40;
  for (const [ground, ink] of [["#fff", "#000"], ["#111", "#fff"]]) {
    let x = pad;
    const small = png(svg, 16, ink, ground).toString("base64");
    const sw = Math.round(16 * ratio) * SCALE;
    items.push(
      `<image x="${x}" y="${y}" width="${sw}" height="${16 * SCALE}" style="image-rendering:optimizeSpeed" href="data:image/png;base64,${small}"/>`,
    );
    x += sw + pad;
    for (const size of [64, 128]) {
      const fw = size * ratio;
      items.push(`<rect x="${x}" y="${y}" width="${fw + 16}" height="${size + 16}" fill="${ground}"/>`);
      items.push(
        `<g transform="translate(${x + 8} ${y + 8}) scale(${size / h})">${recolor(svg, ink).replace(/^[\s\S]*?<svg[^>]*>|<\/svg>\s*$/g, "")}</g>`,
      );
      x += fw + 16 + pad;
    }
    width = Math.max(width, x);
    y += 16 * SCALE + pad;
  }
}
const sheet = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${y}"><rect width="100%" height="100%" fill="#e8e8e8"/>${items.join("")}</svg>`;
writeFileSync(
  join(out, "review.png"),
  new Resvg(sheet, { font: { loadSystemFonts: true }, fitTo: { mode: "original" } }).render().asPng(),
);
console.log(`rendered ${marks.length} marks to ${out}/ (read review.png)`);
