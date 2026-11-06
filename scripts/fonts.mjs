/**
 * Manages the curated font library described by fonts/library.json.
 *
 *   node scripts/fonts.mjs fetch      download every non-rejected family into fonts/files/<id>/ and verify it
 *   node scripts/fonts.mjs specimen   write fonts/files/specimen.html for review
 *
 * Files come only from the source named in library.json, and a family fails unless its
 * license file is OFL 1.1 or Apache 2.0. Downloads are not committed; a brand copies the
 * files it uses into brands/<slug>/fonts/.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, mkdtempSync, rmSync, copyFileSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "opentype.js/dist/opentype.mjs";

const libraryPath = new URL("../fonts/library.json", import.meta.url);
const filesDir = fileURLToPath(new URL("../fonts/files/", import.meta.url));
const library = JSON.parse(readFileSync(libraryPath, "utf8"));
// Rejected families stay in library.json so they are not proposed again, but are never downloaded.
const families = library.families.filter((family) => family.status !== "rejected");

const LICENSES = [
  { id: "OFL-1.1", test: /SIL Open Font License,? Version 1\.1|SIL OPEN FONT LICENSE Version 1\.1/i },
  { id: "Apache-2.0", test: /Apache License,? Version 2\.0/i },
];

const isFont = (file) => /\.(ttf|otf)$/i.test(file);

async function download(url, dest) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status} for ${url}`);
  writeFileSync(dest, Buffer.from(await response.arrayBuffer()));
}

async function fetchFamily(family) {
  const dir = join(filesDir, family.id);
  mkdirSync(dir, { recursive: true });
  const { source } = family;

  if (source.kind === "google") {
    for (const file of source.files) {
      const dest = join(dir, file);
      if (existsSync(dest)) continue;
      const url = `https://raw.githubusercontent.com/google/fonts/main/${source.dir}/${encodeURIComponent(file)}`;
      await download(url, dest);
    }
  } else if (source.kind === "zip") {
    const wanted = Object.entries(source.files);
    if (wanted.every(([, name]) => existsSync(join(dir, name)))) return;
    // Each archive is unpacked into its own empty directory and only the listed files are copied out.
    const scratch = mkdtempSync(join(tmpdir(), `font-${family.id}-`));
    try {
      const archive = join(scratch, "source.zip");
      await download(source.url, archive);
      execFileSync("unzip", ["-q", archive, "-d", join(scratch, "x")]);
      for (const [from, name] of wanted) copyFileSync(join(scratch, "x", from), join(dir, name));
    } finally {
      rmSync(scratch, { recursive: true, force: true });
    }
  } else {
    throw new Error(`${family.id}: unknown source kind "${source.kind}"`);
  }
}

// Reads what the files themselves say: license, designer, weight range, axes.
function inspect(family) {
  const dir = join(filesDir, family.id);
  const files = readdirSync(dir);
  const licenseFile = files.find((file) => /^(OFL|LICENSE)/i.test(file));
  if (!licenseFile) throw new Error(`${family.id}: no license file`);
  const licenseText = readFileSync(join(dir, licenseFile), "utf8");
  const license = LICENSES.find((candidate) => candidate.test.test(licenseText));
  if (!license) throw new Error(`${family.id}: ${licenseFile} is not OFL 1.1 or Apache 2.0`);

  const fonts = files.filter(isFont).map((file) => {
    const font = parse(readFileSync(join(dir, file)).buffer);
    const names = font.names.windows ?? font.names;
    const name = (id) => names[id]?.en ?? null;
    return {
      file,
      italic: /italic/i.test(file),
      weight: font.tables.os2?.usWeightClass ?? 400,
      axes: (font.tables.fvar?.axes ?? []).map((axis) => ({
        tag: axis.tag,
        min: axis.minValue,
        default: axis.defaultValue,
        max: axis.maxValue,
      })),
      designer: name("designer"),
      copyright: name("copyright"),
    };
  });
  if (fonts.length === 0) throw new Error(`${family.id}: no font files`);

  const upright = fonts.filter((font) => !font.italic);
  const wght = upright.flatMap((font) => font.axes).find((axis) => axis.tag === "wght");
  const weights = wght
    ? [wght.min, wght.max]
    : [Math.min(...upright.map((font) => font.weight)), Math.max(...upright.map((font) => font.weight))];

  return {
    license: license.id,
    licenseFile,
    designer: fonts.find((font) => font.designer)?.designer ?? null,
    copyright: fonts.find((font) => font.copyright)?.copyright ?? null,
    weights,
    axes: [...new Set(fonts.flatMap((font) => font.axes.map((axis) => axis.tag)))],
    italic: fonts.some((font) => font.italic),
    fonts,
  };
}

async function fetchAll() {
  let failed = 0;
  for (const family of families) {
    try {
      await fetchFamily(family);
      const info = inspect(family);
      console.log(`ok   ${family.id.padEnd(28)} ${info.license}  ${info.weights.join("-")}  ${info.axes.join(",")}`);
    } catch (error) {
      failed += 1;
      console.error(`FAIL ${family.id.padEnd(28)} ${error.message}`);
    }
  }
  if (failed) {
    console.error(`${failed} famil${failed === 1 ? "y" : "ies"} failed`);
    process.exitCode = 1;
  }
}

const escape = (text) =>
  String(text ?? "").replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[char]);

function fontFaces(family, info) {
  return info.fonts
    .map((font) => {
      const format = font.file.endsWith(".otf") ? "opentype" : "truetype";
      const wght = font.axes.find((axis) => axis.tag === "wght");
      const weight = wght ? `${wght.min} ${wght.max}` : font.weight;
      return `@font-face{font-family:"lib-${family.id}";src:url("${family.id}/${encodeURIComponent(font.file)}") format("${format}");font-weight:${weight};font-style:${font.italic ? "italic" : "normal"};}`;
    })
    .join("\n");
}

function specimen() {
  const rows = [];
  const faces = [];
  for (const family of families) {
    if (!existsSync(join(filesDir, family.id))) {
      console.error(`skip ${family.id}: not fetched`);
      continue;
    }
    const info = inspect(family);
    faces.push(fontFaces(family, info));
    const [lo, hi] = info.weights;
    const heavy = Math.min(hi, 800);
    const steps = lo === hi ? [lo] : [...new Set([lo, 400, Math.min(hi, 700), hi].filter((w) => w >= lo && w <= hi))].sort((a, b) => a - b);
    const ff = `font-family:'lib-${family.id}'`;
    rows.push(`
<article class="family" data-id="${family.id}" data-category="${family.category}" data-status="${family.status}" style="--ff:'lib-${family.id}'">
  <header class="meta">
    <h2>${escape(family.family)}</h2>
    <p class="tags">${escape(family.category)} · ${family.roles.map(escape).join(", ")} · ${lo === hi ? lo : `${lo}–${hi}`}${info.italic ? " · italics" : ""}${info.axes.length ? ` · axes ${escape(info.axes.join(" "))}` : ""}</p>
    <p class="by">${escape(info.designer ?? "Designer not named in the file")} · ${info.license}</p>
    <p class="character">${escape(family.character)}</p>
    <p class="why">${escape(family.why)}</p>
    ${family.caution ? `<p class="caution">${escape(family.caution)}</p>` : ""}
    <div class="decide" role="group" aria-label="Decision for ${escape(family.family)}">
      <button type="button" data-decision="approved">Approve</button>
      <button type="button" data-decision="rejected">Reject</button>
    </div>
  </header>
  <div class="sample">
    <p class="display" style="${ff};font-weight:${heavy >= 600 ? 600 : hi}">Quiet systems, loud ideas</p>
    <div class="marks">
      <span style="${ff};font-weight:${Math.min(hi, 500)}">northwind</span>
      <span style="${ff};font-weight:${heavy};letter-spacing:0.02em">HALCYON</span>
      <span style="${ff};font-weight:${Math.max(lo, 400)}">Okonkwo&#8209;Marchetti</span>
    </div>
    <p class="text" style="${ff};font-weight:${Math.max(lo, Math.min(400, hi))}">Every visual choice traces back to one idea. The palette, the mark and the motion are not picked separately; they follow from the concept. 0123456789 — $48,250 · 3.2% · “quotes” &amp; ampersands.</p>
    <p class="weights">${steps.map((w) => `<span style="${ff};font-weight:${w}">Ag ${w}</span>`).join("")}${info.italic ? `<span style="${ff};font-style:italic;font-weight:${Math.max(lo, 400)}">Italic</span>` : ""}</p>
  </div>
</article>`);
  }

  const categories = [...new Set(families.map((family) => family.category))];
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Font Library Review</title>
<style>
${faces.join("\n")}
:root{--bg:#f4f3ef;--fg:#1a1a18;--muted:#6b6a64;--rule:#d9d7cf;--card:#fbfaf7;--ok:#1f6b3a;--no:#9b2c1f;--chip:#e8e6df;color-scheme:light}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#141413;--fg:#ecebe6;--muted:#9a988f;--rule:#2c2b28;--card:#1b1b19;--ok:#6fcf8f;--no:#f08a7a;--chip:#26251f;color-scheme:dark}}
:root[data-theme="dark"]{--bg:#141413;--fg:#ecebe6;--muted:#9a988f;--rule:#2c2b28;--card:#1b1b19;--ok:#6fcf8f;--no:#f08a7a;--chip:#26251f;color-scheme:dark}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--fg);font:14px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace}
.bar{position:sticky;top:0;z-index:2;display:flex;flex-wrap:wrap;gap:8px 16px;align-items:center;padding:12px 16px;background:var(--bg);border-bottom:1px solid var(--rule)}
.bar h1{font-size:14px;margin:0 auto 0 0;font-weight:600}
.bar button,.decide button{font:inherit;color:inherit;background:var(--chip);border:1px solid transparent;border-radius:6px;padding:4px 10px;cursor:pointer}
.bar button[aria-pressed="true"]{border-color:var(--fg)}
.count{color:var(--muted)}
main{max-width:1200px;margin:0 auto;padding:0 16px 80px}
.family{display:grid;grid-template-columns:300px 1fr;gap:24px;padding:28px 0;border-bottom:1px solid var(--rule)}
.family[hidden]{display:none}
.meta{min-width:0;overflow-wrap:anywhere}
.bar [role="group"]{display:flex;flex-wrap:wrap;gap:6px}
.meta h2{font-size:15px;margin:0 0 4px}
.meta p{margin:0 0 6px}
.tags,.by{color:var(--muted);font-size:12px}
.character{font-size:13px}
.why{font-size:13px;color:var(--muted)}
.caution{font-size:12px;color:var(--no)}
.decide{display:flex;gap:6px;margin-top:10px}
.family[data-decision="approved"] [data-decision="approved"]{background:var(--ok);color:var(--bg)}
.family[data-decision="rejected"] [data-decision="rejected"]{background:var(--no);color:var(--bg)}
.family[data-decision="rejected"] .sample{opacity:.35}
.sample{min-width:0;background:var(--card);border-radius:10px;padding:20px 24px}
.sample p{margin:0}
.display{font-size:clamp(30px,4.6vw,56px);line-height:1.04;letter-spacing:-0.015em;margin-bottom:18px!important}
.marks{display:flex;flex-wrap:wrap;gap:12px 32px;align-items:baseline;font-size:30px;line-height:1.1;margin-bottom:16px;overflow-wrap:anywhere}
.text{font-size:16px;line-height:1.55;max-width:62ch;margin-bottom:14px!important}
.weights{display:flex;flex-wrap:wrap;gap:6px 20px;font-size:20px;color:var(--muted)}
@media (max-width:760px){.family{grid-template-columns:minmax(0,1fr);gap:14px}.marks{font-size:24px}}
</style>
</head>
<body>
<div class="bar">
  <h1>Font library review · ${families.length} families</h1>
  <span class="count" id="count"></span>
  <span role="group" aria-label="Filter">
    <button type="button" data-filter="all" aria-pressed="true">all</button>
    ${categories.map((category) => `<button type="button" data-filter="${category}" aria-pressed="false">${category}</button>`).join("\n    ")}
    <button type="button" data-filter="undecided" aria-pressed="false">undecided</button>
  </span>
  <button type="button" id="copy">Copy decisions</button>
</div>
<main>
${rows.join("\n")}
</main>
<script>
const KEY = "font-library-decisions";
let decisions = {};
try { decisions = JSON.parse(localStorage.getItem(KEY)) || {}; } catch {}
const families = [...document.querySelectorAll(".family")];
// Decisions already recorded in library.json show until the viewer changes them.
for (const el of families) if (!(el.dataset.id in decisions) && el.dataset.status !== "candidate") decisions[el.dataset.id] = el.dataset.status;
function save() { try { localStorage.setItem(KEY, JSON.stringify(decisions)); } catch {} }
function paint() {
  let a = 0, r = 0;
  for (const el of families) {
    const d = decisions[el.dataset.id];
    if (d) el.dataset.decision = d; else delete el.dataset.decision;
    if (d === "approved") a++; if (d === "rejected") r++;
  }
  document.getElementById("count").textContent = a + " approved · " + r + " rejected · " + (families.length - a - r) + " left";
}
document.addEventListener("click", (event) => {
  const choice = event.target.closest("[data-decision]");
  if (choice && choice.tagName === "BUTTON") {
    const id = choice.closest(".family").dataset.id;
    decisions[id] = decisions[id] === choice.dataset.decision ? undefined : choice.dataset.decision;
    if (!decisions[id]) delete decisions[id];
    save(); paint(); return;
  }
  const filter = event.target.closest("[data-filter]");
  if (filter) {
    document.querySelectorAll("[data-filter]").forEach((b) => b.setAttribute("aria-pressed", String(b === filter)));
    const f = filter.dataset.filter;
    for (const el of families) {
      el.hidden = !(f === "all" || el.dataset.category === f || (f === "undecided" && !decisions[el.dataset.id]));
    }
  }
});
document.getElementById("copy").addEventListener("click", async (event) => {
  const list = (s) => families.filter((el) => decisions[el.dataset.id] === s).map((el) => el.dataset.id).join(", ") || "none";
  const text = "approved: " + list("approved") + "\\nrejected: " + list("rejected");
  try { await navigator.clipboard.writeText(text); event.target.textContent = "Copied"; }
  catch { prompt("Copy these decisions:", text); }
  setTimeout(() => { event.target.textContent = "Copy decisions"; }, 1500);
});
paint();
</script>
</body>
</html>
`;
  const out = join(filesDir, "specimen.html");
  writeFileSync(out, html);
  console.log(`wrote ${out}`);
}

const command = process.argv[2];
if (command === "fetch") await fetchAll();
else if (command === "specimen") specimen();
else {
  console.error("usage: node scripts/fonts.mjs fetch|specimen");
  process.exitCode = 1;
}
