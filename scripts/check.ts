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
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const ts = ["--no-warnings", "--import", "./scripts/lib/ts-paths.ts"];

const folders = (dir: string) =>
  existsSync(dir)
    ? readdirSync(dir, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
        .sort()
    : [];

const brands = folders(join(root, "brands")).filter((slug) => existsSync(join(root, "brands", slug, "brand.ts")));
const routed = brands.filter((slug) => existsSync(join(root, "brands", slug, "work", "routes")));

type Step = { name: string; command: string; args: string[]; env?: Record<string, string> };

const steps: Step[] = [
  { name: "registry", command: "node", args: [...ts, "scripts/brands.ts"] },
  { name: "route types", command: "pnpm", args: ["exec", "next", "typegen"] },
  // Checks every file, dev pages included, against the route types typegen just
  // wrote; a running `next dev` keeps its own in .next/dev, which this skips.
  { name: "types", command: "pnpm", args: ["exec", "tsc", "--noEmit", "-p", "tsconfig.check.json"] },
  { name: "lint", command: "pnpm", args: ["exec", "eslint", "--max-warnings", "0"] },
  ...routed.map((slug) => ({ name: `routes: ${slug}`, command: "node", args: [...ts, "scripts/check-route.ts", slug] })),
  ...brands.map((slug) => ({ name: `book: ${slug}`, command: "node", args: [...ts, "scripts/check-brand.ts", slug] })),
  ...brands.map((slug) => ({
    name: `build: ${slug}`,
    command: "pnpm",
    args: ["run", "--silent", "build"],
    env: { BRAND: slug },
  })),
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
