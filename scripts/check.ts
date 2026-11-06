/**
 * The one gate: everything that must pass before work is done, in the order a
 * failure is cheapest to find. CI runs exactly this.
 *
 *   pnpm check
 *
 * Stops at the first failing step and exits non-zero. Ends by rewriting the
 * dev registry, since the per-brand builds leave a production one behind.
 */
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { listBrands } from "../lib/brand/folders";

const root = process.cwd();
const ts = ["--no-warnings", "--import", "./scripts/lib/ts-paths.ts"];

const brands = listBrands(root);
const routed = brands.filter((slug) => existsSync(join(root, "brands", slug, "work", "routes")));

type Step = { name: string; command: string; args: string[]; env?: Record<string, string> };

const steps: Step[] = [
  { name: "registry", command: "node", args: [...ts, "scripts/brands.ts"] },
  { name: "route types", command: "pnpm", args: ["exec", "next", "typegen"] },
  // Checks every file, dev pages included, against the route types typegen just
  // wrote; a running `next dev` keeps its own in .next/dev, which this skips.
  { name: "types", command: "pnpm", args: ["exec", "tsc", "--noEmit", "-p", "tsconfig.check.json"] },
  { name: "lint", command: "pnpm", args: ["exec", "eslint", "--max-warnings", "0"] },
  { name: "tests", command: "pnpm", args: ["run", "--silent", "test"] },
  ...routed.map((slug) => ({ name: `routes: ${slug}`, command: "node", args: [...ts, "scripts/check-route.ts", slug] })),
  ...brands.map((slug) => ({ name: `book: ${slug}`, command: "node", args: [...ts, "scripts/check-brand.ts", slug] })),
  ...brands.map((slug) => ({ name: `figma: ${slug}`, command: "node", args: [...ts, "scripts/export-figma.ts", slug, "--check"] })),
  // Builds each brand for production, then looks at the page at two widths.
  { name: "build and shots", command: "node", args: [...ts, "scripts/shots.ts"] },
];

function run({ command, args, env }: Step) {
  execFileSync(command, args, { stdio: "inherit", env: { ...process.env, ...env } });
}

const restore: Step = { name: "registry", command: "node", args: [...ts, "scripts/brands.ts"] };
const started = Date.now();
let failed: string | null = null;

for (const step of steps) {
  console.log(`\n▸ ${step.name}`);
  try {
    run(step);
  } catch {
    failed = step.name;
    break;
  }
}
run(restore);

const seconds = ((Date.now() - started) / 1000).toFixed(0);
if (failed) {
  console.error(`\n✗ ${failed} failed (${seconds}s)`);
  process.exitCode = 1;
} else {
  console.log(`\n✓ all ${steps.length} steps passed (${seconds}s)`);
}
