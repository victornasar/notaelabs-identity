/**
 * Which brands exist: every folder in brands/ with a brand.ts. Node only.
 *
 * Slugs starting with "fixture-" are test brands. They render, check and build
 * like any client, so the shell is proven against them, but they come last
 * and are never the default.
 */
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

export const isFixture = (slug: string) => slug.startsWith("fixture-");

export function listBrands(root = process.cwd()): string[] {
  const dir = join(root, "brands");
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && existsSync(join(dir, entry.name, "brand.ts")))
    .map((entry) => entry.name)
    .sort((a, b) => Number(isFixture(a)) - Number(isFixture(b)) || a.localeCompare(b));
}
