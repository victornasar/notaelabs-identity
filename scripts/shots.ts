/**
 * Builds and serves each brand's page, looks at it at desktop and phone width,
 * and fails on anything a person would otherwise have to catch by eye.
 *
 *   pnpm shots [slug]
 *
 * Checks, at each width: no sideways scroll, no console or page errors, every
 * section the brand has is on the page with height, every nav link lands on a
 * section, and every mark draws at a real size without being cut off. Then the
 * dev-only /routes board of every brand with routes, at desktop width, by the
 * same rules minus the sections. Full-page PNGs go to .shots/ for a person to
 * look at; nothing is compared pixel by pixel.
 */
import { execFileSync, spawn } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { chromium, type Page } from "playwright";
import { listBrands } from "../lib/brand/folders";
import type { Brand } from "../lib/brand/schema";
import { pageSections } from "../lib/brand/sections";

const root = process.cwd();

/** Stops a server started detached, with everything it started; fine if it has already exited. */
function stopper(pid: number | undefined) {
  return () => {
    try {
      if (pid) process.kill(-pid, "SIGTERM");
    } catch {
      // Already gone, such as a dev server that found another one running.
    }
  };
}
const out = join(root, ".shots");
const port = 3123;
const devPort = 3124;
const widths = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "phone", width: 390, height: 844 },
];

const only = process.argv[2];
const slugs = only ? [only] : listBrands(root);
mkdirSync(out, { recursive: true });

async function serve(slug: string) {
  execFileSync("pnpm", ["run", "--silent", "build"], { stdio: "inherit", env: { ...process.env, BRAND: slug } });
  const server = spawn("pnpm", ["exec", "next", "start", "-p", String(port)], { stdio: "ignore", detached: true });
  const stop = stopper(server.pid);
  const url = `http://localhost:${port}/${slug}`;
  for (let tries = 0; tries < 100; tries++) {
    try {
      if ((await fetch(url)).ok) return { url, stop };
    } catch {
      // Not listening yet.
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  stop();
  throw new Error(`${slug}: the server never answered at ${url}`);
}

/**
 * A dev server for the /routes board. Next allows one per folder, so when one
 * is already running (a person's `pnpm dev`), use that one.
 */
async function serveDev() {
  execFileSync("node", ["--no-warnings", "--import", "./scripts/lib/ts-paths.ts", "scripts/brands.ts"], { stdio: "ignore" });
  const server = spawn("pnpm", ["exec", "next", "dev", "-p", String(devPort)], { stdio: ["ignore", "pipe", "pipe"], detached: true });
  let log = "";
  server.stdout.on("data", (chunk) => (log += chunk));
  server.stderr.on("data", (chunk) => (log += chunk));
  const stop = stopper(server.pid);
  for (let tries = 0; tries < 200; tries++) {
    const running = log.includes("Another next dev server is already running") && log.match(/Local:\s+(http:\/\/\S+)/g)?.at(-1);
    if (running) return { base: running.replace(/^Local:\s+/, ""), stop };
    try {
      if ((await fetch(`http://localhost:${devPort}/routes`)).ok) return { base: `http://localhost:${devPort}`, stop };
    } catch {
      // Not listening yet.
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  stop();
  throw new Error(`The dev server never answered:\n${log}`);
}

/** Everything wrong with the page as it stands, in words. `sections` is null on pages without them. */
async function problemsOn(page: Page, sections: string[] | null) {
  return page.evaluate((ids) => {
    const found: string[] = [];
    const doc = document.documentElement;
    if (doc.scrollWidth > doc.clientWidth) found.push(`scrolls sideways: ${doc.scrollWidth}px wide in a ${doc.clientWidth}px window`);

    for (const id of ids ?? []) {
      const section = document.getElementById(id);
      if (!section) found.push(`section #${id} is missing`);
      else if (section.getBoundingClientRect().height < 100) found.push(`section #${id} is nearly empty`);
    }

    if (ids) {
      const linked = [...document.querySelectorAll<HTMLAnchorElement>('nav a[href^="#"]')].map((link) => link.hash.slice(1));
      for (const target of linked) {
        if (target !== "top" && !ids.includes(target)) found.push(`nav links to #${target}, which isn't a section`);
      }
      for (const id of ids) if (!linked.includes(id)) found.push(`nav has no link to #${id}`);
    }

    for (const svg of document.querySelectorAll("main svg, footer svg, body > svg")) {
      // Hidden on purpose by the layout, such as a size row too wide for a phone.
      if (!svg.checkVisibility()) continue;
      const where = `#${svg.closest("[id]")?.id ?? "?"}`;
      const box = svg.getBoundingClientRect();
      if (box.width < 1 || box.height < 1) found.push(`a mark in ${where} draws at ${box.width}×${box.height}`);

      // Cut off by a box that clips, unless it is a device row that runs off the edge on purpose.
      if (svg.closest("[data-bleed]")) continue;
      for (let el = svg.parentElement; el && el !== document.body; el = el.parentElement) {
        const { overflowX, overflowY } = getComputedStyle(el);
        // Inside a scroller the mark can be reached, so it isn't cut off.
        if ([overflowX, overflowY].some((o) => o === "auto" || o === "scroll")) break;
        if (![overflowX, overflowY].some((o) => o === "hidden" || o === "clip")) continue;
        const frame = el.getBoundingClientRect();
        if (box.left < frame.left - 1 || box.right > frame.right + 1 || box.top < frame.top - 1 || box.bottom > frame.bottom + 1) {
          found.push(`a mark in ${where} is cut off by its container`);
        }
        break;
      }
    }
    return found;
  }, sections);
}

/** Opens a page at one width, records what's wrong with it and saves a screenshot. */
async function look(url: string, name: string, viewport: { width: number; height: number }, sections: string[] | null) {
  const context = await browser.newContext({ viewport, reducedMotion: "reduce" });
  const page = await context.newPage();
  const errors: string[] = [];
  page.on("console", (message) => message.type() === "error" && errors.push(`console: ${message.text()}`));
  page.on("pageerror", (error) => errors.push(`page error: ${error.message}`));
  await page.goto(url, { waitUntil: "networkidle" });
  const found = [...errors, ...(await problemsOn(page, sections))];
  const file = join(out, `${name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  await context.close();

  failures += found.length;
  console.log(`${found.length ? "✗" : "✓"} ${name} at ${viewport.width}px  ${file}`);
  for (const problem of found) console.log(`    - ${problem}`);
}

const browser = await chromium.launch();
let failures = 0;
try {
  for (const slug of slugs) {
    const brand: Brand = (await import(pathToFileURL(join(root, "brands", slug, "brand.ts")).href)).default;
    const sections = pageSections(brand).map((s) => s.id);
    const { url, stop } = await serve(slug);
    try {
      for (const { name, width, height } of widths) await look(url, `${slug}-${name}`, { width, height }, sections);
    } finally {
      stop();
    }
  }

  const routed = slugs.filter((slug) => existsSync(join(root, "brands", slug, "work", "routes")));
  if (routed.length) {
    const { base, stop } = await serveDev();
    try {
      for (const slug of routed) await look(`${base}/routes/${slug}`, `${slug}-routes`, { width: 1440, height: 900 }, null);
    } finally {
      stop();
    }
  }
} finally {
  await browser.close();
}
if (failures) process.exitCode = 1;
