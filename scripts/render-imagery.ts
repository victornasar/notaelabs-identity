/**
 * Renders a brand's generated imagery to `brands/<slug>/images/<name>.png`, and a
 * contact sheet to `brands/<slug>/work/imagery.png` for review.
 *
 *   pnpm render-imagery <slug> [name] [--flat]
 *
 * Pass a name to render one image, after changing its seed. Scenes are drawn by
 * three.js in headless Chromium (lib/imagery/scene/scene.js); `--flat` draws hard
 * light as two-color vectors instead.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { Resvg } from "@resvg/resvg-js";
import { chromium } from "playwright";
import { hardLight } from "../lib/imagery/hard-light";
import type { Brand, BrandImage } from "../lib/brand/schema";

const args = process.argv.slice(2);
const flat = args.includes("--flat");
const [slug, only] = args.filter((a) => !a.startsWith("--"));
if (!slug) {
  console.error("usage: pnpm render-imagery <slug> [name] [--flat]");
  process.exit(1);
}
const root = process.cwd();
const dir = join(root, "brands", slug);
const brand: Brand = (await import(pathToFileURL(join(dir, "brand.ts")).href)).default;
if (!brand.imagery) {
  console.error(`brands/${slug}/brand.ts has no imagery; it is written at gate 7.`);
  process.exit(1);
}
const hex = (name: string) => brand.colors.find((c) => c.name === name)!.hex;
const symbol = readFileSync(join(dir, "marks", "symbol.svg"), "utf8");

// The scene page loads three.js and the scene module from disk, through a fake origin.
const files: Record<string, string> = {
  "/three.module.js": "node_modules/three/build/three.module.js",
  "/three.core.js": "node_modules/three/build/three.core.js",
  "/scene.js": "lib/imagery/scene/scene.js",
};
const page = `<!doctype html><html><body style="margin:0">
<script type="importmap">{"imports":{"three":"/three.module.js","three/addons/":"/addons/"}}</script>
<canvas id="gl"></canvas><canvas id="out"></canvas>
<script type="module">import "/scene.js"; window.ready = true;</script></body></html>`;
const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const tab = await browser.newPage();
await tab.route("http://scene.local/**", (route) => {
  const path = new URL(route.request().url()).pathname;
  const file = path === "/" ? null : path.startsWith("/addons/") ? `node_modules/three/examples/jsm/${path.slice(8)}` : files[path];
  if (!file) return route.fulfill({ contentType: "text/html", body: page });
  route.fulfill({ contentType: "text/javascript", body: readFileSync(join(root, file), "utf8") });
});
await tab.goto("http://scene.local/");
await tab.waitForFunction(() => (window as unknown as { ready?: boolean }).ready);

async function png(image: BrandImage): Promise<Buffer> {
  const colors = { ground: hex(image.ground), ink: hex(image.ink), surface: hex(image.surface ?? image.ground) };
  if (image.type === "hard-light" && flat) {
    const svg = hardLight({ width: image.width, height: image.height, seed: image.seed, ...colors });
    return new Resvg(svg).render().asPng();
  }
  if (image.type !== "hard-light" && image.type !== "symbol-render") throw new Error(`imagery.${image.name}: ${image.type} isn't built yet.`);
  await tab.setViewportSize({ width: image.width, height: image.height });
  const spec = { ...image, ...colors, spread: 7 / 15, symbol };
  await tab.evaluate((s) => (window as unknown as { render: (s: unknown) => Promise<string> }).render(s), spec);
  const data = await tab.evaluate(() => (document.getElementById("out") as HTMLCanvasElement).toDataURL("image/png"));
  return Buffer.from(data.split(",")[1], "base64");
}

mkdirSync(join(dir, "images"), { recursive: true });
const rendered = new Map<string, Buffer>();
for (const image of brand.imagery.images) {
  if (only && image.name !== only) continue;
  const data = await png(image);
  rendered.set(image.name, data);
  writeFileSync(join(dir, "images", `${image.name}.png`), data);
  console.log(`images/${image.name}.png  ${image.type}  ${image.width}×${image.height}  seed ${image.seed}`);
}
await browser.close();

// Contact sheet: every image at the same height, in rows, labeled.
const ROW = 360;
const PAD = 32;
const SHEET = 2400;
let x = PAD;
let y = PAD;
const cells: string[] = [];
for (const image of brand.imagery.images) {
  const w = Math.round((ROW * image.width) / image.height);
  if (x + w > SHEET - PAD) {
    x = PAD;
    y += ROW + 64;
  }
  const data = rendered.get(image.name) ?? readFileSync(join(dir, "images", `${image.name}.png`));
  cells.push(
    `<image x="${x}" y="${y}" width="${w}" height="${ROW}" href="data:image/png;base64,${data.toString("base64")}"/>`,
    `<text x="${x}" y="${y + ROW + 32}" font-family="monospace" font-size="22" fill="#333">${image.name} · ${image.type} · seed ${image.seed}</text>`,
  );
  x += w + PAD;
}
const height = y + ROW + 64;
const sheet = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SHEET} ${height}"><rect width="${SHEET}" height="${height}" fill="#e9e9e6"/>${cells.join("")}</svg>`;
writeFileSync(join(dir, "work", "imagery.png"), new Resvg(sheet, { fitTo: { mode: "width", value: SHEET } }).render().asPng());
console.log("work/imagery.png  contact sheet");
