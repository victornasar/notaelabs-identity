/**
 * Fonts come from the curated list in fonts/library.json. Nothing is kept locally until a
 * brand uses a family, and every download is pinned, so the same command always yields the
 * same bytes.
 *
 *   pnpm fonts add <family-id> <brand-slug>   copy a family into brands/<slug>/fonts/<id>/
 *   pnpm fonts lock                            pin hashes and read facts for every approved family
 *
 * Google families are read from google/fonts at the commit in library.json; other families
 * come from a fixed release archive. `add` refuses any file whose sha256 differs from the
 * lock, and `lock` refuses any family whose license file isn't OFL 1.1 or Apache 2.0.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, mkdtempSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "opentype.js/dist/opentype.mjs";

type Source =
  | { kind: "google"; dir: string; files: string[] }
  | { kind: "zip"; url: string; files: Record<string, string> };

type Family = {
  id: string;
  status: "approved" | "rejected" | string;
  decision?: string;
  source: Source;
  sha256?: Record<string, string>;
  license?: string;
  designer?: string | null;
  weights?: [number, number];
  axes?: string[];
  italic?: boolean;
};

type Library = { google: { repo: string; commit: string }; families: Family[] };

type Files = Record<string, Buffer>;

const libraryPath = new URL("../fonts/library.json", import.meta.url);
const library: Library = JSON.parse(readFileSync(libraryPath, "utf8"));

const LICENSES = [
  { id: "OFL-1.1", test: /SIL Open Font License,? Version 1\.1|SIL OPEN FONT LICENSE Version 1\.1/i },
  { id: "Apache-2.0", test: /Apache License,? Version 2\.0/i },
];

const sha256 = (bytes: Buffer) => createHash("sha256").update(bytes).digest("hex");
const isFont = (file: string) => /\.(ttf|otf)$/i.test(file);

async function download(url: string) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status} for ${url}`);
  return Buffer.from(await response.arrayBuffer());
}

// Returns { [fileName]: bytes } for a family, straight from its pinned source.
async function fetchFiles(family: Family): Promise<Files> {
  const { source } = family;
  if (source.kind === "google") {
    const entries = await Promise.all(
      source.files.map(async (file) => {
        const url = `https://raw.githubusercontent.com/${library.google.repo}/${library.google.commit}/${source.dir}/${encodeURIComponent(file)}`;
        return [file, await download(url)];
      }),
    );
    return Object.fromEntries(entries);
  }
  if (source.kind === "zip") {
    // The archive is unpacked into its own empty directory and only the listed files are read.
    const scratch = mkdtempSync(join(tmpdir(), `font-${family.id}-`));
    try {
      const archive = join(scratch, "source.zip");
      writeFileSync(archive, await download(source.url));
      execFileSync("unzip", ["-q", archive, "-d", join(scratch, "x")]);
      return Object.fromEntries(
        Object.entries(source.files).map(([from, name]) => [name, readFileSync(join(scratch, "x", from))]),
      );
    } finally {
      rmSync(scratch, { recursive: true, force: true });
    }
  }
  throw new Error(`${family.id}: unknown source kind "${(source as { kind: string }).kind}"`);
}

// Reads what the files themselves say: license, designer, weight range, axes.
function inspect(family: Family, files: Files) {
  const licenseFile = Object.entries(files).find(([file]) => /^(OFL|LICENSE)/i.test(file));
  if (!licenseFile) throw new Error(`${family.id}: no license file`);
  const license = LICENSES.find((candidate) => candidate.test.test(licenseFile[1].toString("utf8")));
  if (!license) throw new Error(`${family.id}: ${licenseFile[0]} is not OFL 1.1 or Apache 2.0`);

  const fonts = Object.entries(files)
    .filter(([file]) => isFont(file))
    .map(([file, bytes]) => {
      const font = parse(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer);
      const names = font.names.windows ?? font.names;
      return {
        italic: /italic/i.test(file),
        weight: font.tables.os2?.usWeightClass ?? 400,
        axes: (font.tables.fvar?.axes ?? []).map((axis) => ({ tag: axis.tag, min: axis.minValue, max: axis.maxValue })),
        designer: names.designer?.en ?? null,
      };
    });
  if (fonts.length === 0) throw new Error(`${family.id}: no font files`);

  const upright = fonts.filter((font) => !font.italic);
  const wght = upright.flatMap((font) => font.axes).find((axis) => axis.tag === "wght");
  return {
    license: license.id,
    designer: fonts.find((font) => font.designer)?.designer ?? null,
    weights: (wght
      ? [wght.min, wght.max]
      : [Math.min(...upright.map((font) => font.weight)), Math.max(...upright.map((font) => font.weight))]) as [number, number],
    axes: [...new Set(fonts.flatMap((font) => font.axes.map((axis) => axis.tag)))],
    italic: fonts.some((font) => font.italic),
  };
}

async function lock() {
  let failed = 0;
  for (const family of library.families.filter((candidate) => candidate.status === "approved")) {
    try {
      const files = await fetchFiles(family);
      Object.assign(family, inspect(family, files), {
        sha256: Object.fromEntries(Object.entries(files).map(([name, bytes]) => [name, sha256(bytes)])),
      });
      console.log(`ok   ${family.id.padEnd(28)} ${family.license}  ${family.weights?.join("-")}  ${family.axes?.join(",")}`);
    } catch (error) {
      failed += 1;
      console.error(`FAIL ${family.id.padEnd(28)} ${error instanceof Error ? error.message : error}`);
    }
  }
  writeFileSync(libraryPath, JSON.stringify(library, null, 2) + "\n");
  if (failed) process.exitCode = 1;
}

async function add(id: string, slug: string) {
  const family = library.families.find((candidate) => candidate.id === id);
  if (!family) throw new Error(`No family "${id}" in fonts/library.json`);
  if (family.status !== "approved") throw new Error(`${id} is ${family.status}: ${family.decision ?? "not approved"}`);
  if (!family.sha256) throw new Error(`${id} has no hashes; run \`pnpm fonts lock\``);
  const brandDir = fileURLToPath(new URL(`../brands/${slug}/`, import.meta.url));
  if (!existsSync(brandDir)) throw new Error(`No brand folder brands/${slug}/`);

  const dir = join(brandDir, "fonts", id);
  const present = Object.entries(family.sha256).every(
    ([name, hash]) => existsSync(join(dir, name)) && sha256(readFileSync(join(dir, name))) === hash,
  );
  if (present) return console.log(`${id} already in brands/${slug}/fonts/${id}/`);

  const files = await fetchFiles(family);
  const locked = Object.entries(family.sha256).map(([name, hash]) => {
    const bytes = files[name];
    if (!bytes) throw new Error(`${id}: source no longer has ${name}`);
    if (sha256(bytes) !== hash) throw new Error(`${id}: ${name} does not match its locked hash`);
    return [name, bytes] as const;
  });
  mkdirSync(dir, { recursive: true });
  for (const [name, bytes] of locked) writeFileSync(join(dir, name), bytes);
  console.log(`added ${id} to brands/${slug}/fonts/${id}/`);
}

const [command, ...args] = process.argv.slice(2);
if (command === "lock") await lock();
else if (command === "add" && args[0] && args[1]) await add(args[0], args[1]);
else {
  console.error("usage: pnpm fonts add <family-id> <brand-slug> | lock");
  process.exitCode = 1;
}
