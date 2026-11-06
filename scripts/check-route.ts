/**
 * Runs every gate on a brand's routes and lists what sends each one back.
 *
 *   pnpm check-route <slug> [a|b|c]
 *
 * Exits non-zero if any route fails. A route that fails is never shown to the client.
 */
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { routeProblems } from "../lib/brand/gates";
import type { Route } from "../lib/brand/route";
import type { Strategy } from "../lib/brand/schema";

const [slug, only] = process.argv.slice(2);
if (!slug) {
  console.error("usage: pnpm check-route <slug> [a|b|c]");
  process.exit(1);
}
const work = join(process.cwd(), "brands", slug, "work");
const load = async <T>(path: string): Promise<T> => (await import(pathToFileURL(path).href)).default;

if (!existsSync(join(work, "strategy.ts"))) {
  console.error(`brands/${slug}/work/strategy.ts is missing; the strategy comes before routes.`);
  process.exit(1);
}
const strategy = await load<Strategy>(join(work, "strategy.ts"));
const letters = only ? [only] : readdirSync(join(work, "routes")).filter((l) => /^[abc]$/.test(l)).sort();

let failed = false;
for (const letter of letters) {
  const route = await load<Route>(join(work, "routes", letter, "route.ts"));
  const found = routeProblems(slug, strategy, route);
  failed ||= found.length > 0;
  console.log(found.length ? `route ${letter.toUpperCase()}: sent back\n${found.map((p) => `  - ${p}`).join("\n")}` : `route ${letter.toUpperCase()}: passes`);
}
if (failed) process.exitCode = 1;
