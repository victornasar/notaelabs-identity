/**
 * Checks that a brand is a complete brand book and lists what each section lacks.
 *
 *   pnpm check-brand <slug>
 *
 * Exits non-zero while any section is missing. A brand that fails is not finished.
 */
import { existsSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { completeness } from "../lib/brand/sections";
import type { Brand } from "../lib/brand/schema";

const [slug] = process.argv.slice(2);
if (!slug) {
  console.error("usage: pnpm check-brand <slug>");
  process.exit(1);
}
const file = join(process.cwd(), "brands", slug, "brand.ts");
if (!existsSync(file)) {
  console.error(`brands/${slug}/brand.ts is missing; it is written at build-out.`);
  process.exit(1);
}
const brand: Brand = (await import(pathToFileURL(file).href)).default;

const report = completeness(brand);
for (const entry of report) {
  if (entry.status === "complete") console.log(`${entry.id}: complete`);
  else if (entry.status === "not applicable") console.log(`${entry.id}: not applicable (${entry.reason})`);
  else console.log(`${entry.id}: missing\n${entry.missing.map((m) => `   - ${m}`).join("\n")}`);
}
const done = report.filter((e) => e.status !== "missing").length;
console.log(`\n${done} of ${report.length} sections done.`);
if (done < report.length) process.exitCode = 1;
