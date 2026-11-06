/**
 * Writes a brand's Figma bundle, the one file the plugin in `figma-plugin/`
 * builds the Figma file from.
 *
 *   pnpm export-figma <slug>                   writes brands/<slug>/figma/<slug>.figma.json
 *   pnpm export-figma <slug> --install-fonts   also copies missing fonts into ~/Library/Fonts
 *   pnpm export-figma <slug> --check           builds and checks it, writes nothing (pnpm check runs this)
 *
 * Figma only sees fonts installed on the computer, so the export lists the
 * brand's fonts that aren't, and installs them only when asked.
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { basename, join, relative } from "node:path";
import { pathToFileURL } from "node:url";
import { buildBundle, bundleProblems } from "../lib/figma/bundle";
import type { Brand } from "../lib/brand/schema";
import { resolveFonts } from "./lib/font-names";

const args = process.argv.slice(2);
const slug = args.find((a) => !a.startsWith("--"));
const check = args.includes("--check");
const install = args.includes("--install-fonts");
if (!slug) {
  console.error("usage: pnpm export-figma <slug> [--install-fonts | --check]");
  process.exit(1);
}

const root = process.cwd();
const folder = join(root, "brands", slug);
if (!existsSync(join(folder, "brand.ts"))) {
  console.error(`brands/${slug}/brand.ts is missing.`);
  process.exit(1);
}
const brand: Brand = (await import(pathToFileURL(join(folder, "brand.ts")).href)).default;

function readSvgs(name: string): Record<string, string> {
  const dir = join(folder, name);
  if (!existsSync(dir)) return {};
  return Object.fromEntries(
    readdirSync(dir)
      .filter((f) => f.endsWith(".svg"))
      .map((f) => [f, readFileSync(join(dir, f), "utf8")]),
  );
}

const { fonts, problems: fontProblems } = resolveFonts(root, brand);
const bundle = buildBundle(brand, { marks: readSvgs("marks"), graphics: readSvgs("graphics"), fonts });
const problems = [...fontProblems, ...bundleProblems(bundle, brand)];

if (problems.length) {
  console.error(`${slug}: the Figma bundle has ${problems.length} problem${problems.length === 1 ? "" : "s"}:`);
  for (const p of problems) console.error(`   - ${p}`);
  process.exit(1);
}

if (check) {
  console.log(`${slug}: ${bundle.frames.length} frames, ${bundle.colors.length} colors, ${bundle.textStyles.length} text styles, ${bundle.marks.items.length} marks.`);
  process.exit(0);
}

const out = join(folder, "figma", `${slug}.figma.json`);
mkdirSync(join(folder, "figma"), { recursive: true });
writeFileSync(out, `${JSON.stringify(bundle, null, 2)}\n`);
console.log(`Wrote ${relative(root, out)}.`);

// Installed fonts are matched by file name, the name Font Book and a copy both keep.
const userFonts = join(homedir(), "Library", "Fonts");
const installed = new Set(
  [userFonts, "/Library/Fonts"].flatMap((dir) => (existsSync(dir) ? readdirSync(dir) : [])),
);
const files = [...new Set(fonts.map((f) => f.file))];
const missing = files.filter((f) => !installed.has(basename(f)));

if (!missing.length) {
  console.log("Every font it uses is installed.");
} else if (install) {
  mkdirSync(userFonts, { recursive: true });
  for (const file of missing) copyFileSync(join(root, file), join(userFonts, basename(file)));
  console.log(`Installed ${missing.length} font${missing.length === 1 ? "" : "s"} into ~/Library/Fonts. Restart Figma to see them.`);
} else {
  console.log(`Not installed, so Figma can't use them yet:\n${missing.map((f) => `   - ${f}`).join("\n")}`);
  console.log(`Run pnpm export-figma ${slug} --install-fonts, or open each file and choose Install.`);
}
