import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { it } from "node:test";
import type { Brand } from "./schema";

// The shared page code is the same for every client. A client's name, colors
// or headlines in it would leak into every other client's book.
const root = process.cwd();
const shared = ["components", "app"];

function files(dir: string): string[] {
  return readdirSync(join(root, dir), { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return files(path);
    return /\.(tsx?|css)$/.test(entry.name) ? [path] : [];
  });
}

const slugs = readdirSync(join(root, "brands"), { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && readdirSync(join(root, "brands", entry.name)).includes("brand.ts"))
  .map((entry) => entry.name);

const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

it("names no brand in shared page code", async () => {
  const found: string[] = [];
  const sources = shared.flatMap(files).map((path) => ({ path, text: readFileSync(join(root, path), "utf8") }));

  for (const slug of slugs) {
    const brand: Brand = (await import(pathToFileURL(join(root, "brands", slug, "brand.ts")).href)).default;
    const words = [
      slug,
      brand.name,
      ...brand.name.split(/\s+/).filter((word) => word.length > 3 && /[A-Z]/.test(word[0] ?? "")),
      ...brand.colors.map((c) => c.name),
      ...Object.values(brand.page?.titles ?? {}),
    ];
    const patterns = [
      ...words.map((word) => new RegExp(`\\b${escape(word)}\\b`)),
      ...brand.colors.map((c) => new RegExp(escape(c.hex), "i")),
    ];
    for (const { path, text } of sources) {
      for (const pattern of patterns) if (pattern.test(text)) found.push(`${path}: ${pattern.source} (${slug})`);
    }
  }
  assert.deepEqual(found, []);
});
