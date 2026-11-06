/**
 * Draws the test brand's wordmark: the three surnames from Familjen Grotesk,
 * set as they come. Run from the repository root:
 *
 *   node --import ./scripts/lib/ts-paths.ts brands/fixture-sparse/build.ts
 */
import { writeFileSync } from "node:fs";
import { loadFont, setText, toSvg } from "../../scripts/lib/outline";

const here = new URL(".", import.meta.url);
const font = loadFont(new URL("fonts/familjen-grotesk/FamiljenGrotesk[wght].ttf", here).pathname, { wght: 600 });
const run = setText(font, "Halvorsen Abernathy Nakamura", { size: 1000, tracking: -0.01 });
writeFileSync(new URL("marks/wordmark.svg", here), toSvg(run));
console.log("fixture-sparse: wordmark");
