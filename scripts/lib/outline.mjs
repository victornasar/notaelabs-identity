/**
 * Turns text set in a library font into outlines a wordmark script can reshape,
 * and gives symbol scripts the same SVG writer. Wordmarks start here and
 * record the font, its axis setting and every change made after.
 *
 *   const font = loadFont("brands/acme/fonts/literata/Literata[opsz,wght].ttf", { wght: 560, opsz: 72 });
 *   const run = setText(font, "Acme", { size: 1000, tracking: -0.01 });
 *   run.glyphs[2].commands = moveX(run.glyphs[2].commands, -12);   // a named, recorded change
 *   writeFileSync("marks/wordmark.svg", toSvg(run));
 */
import { readFileSync } from "node:fs";
import { parse } from "opentype.js/dist/opentype.mjs";

export function loadFont(path, axes = {}) {
  const bytes = readFileSync(path);
  const font = parse(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
  if (Object.keys(axes).length) {
    if (!font.variation) throw new Error(`${path} is not a variable font`);
    font.variation.set(axes);
  }
  return font;
}

/**
 * Sets `text` on one line. Returns each glyph's outline separately, in font
 * units scaled to `size`, with y pointing down and the baseline at y = 0.
 * `tracking` is in em, like CSS letter-spacing.
 */
export function setText(font, text, { size = 1000, tracking = 0, kerning = true, features = {} } = {}) {
  const scale = size / font.unitsPerEm;
  // opentype.js takes features as { liga: true }; only Latin ones are applied.
  const options = { ...font.defaultRenderOptions, kerning, features: { liga: true, rlig: true, ...features } };
  const glyphs = font.stringToGlyphs(text, options);
  let x = 0;
  const out = glyphs.map((glyph, i) => {
    const path = glyph.getPath(x, 0, size, options, font);
    const advance = glyph.advanceWidth * scale;
    const next = glyphs[i + 1];
    const kern = kerning && next ? font.getKerningValue(glyph, next) * scale : 0;
    const placed = { char: [...text][i], commands: path.commands, x };
    x += advance + kern + tracking * size;
    return placed;
  });
  const capHeight = (font.tables.os2?.sCapHeight || font.unitsPerEm * 0.7) * scale;
  const xHeight = (font.tables.os2?.sxHeight || font.unitsPerEm * 0.5) * scale;
  return { glyphs: out, size, capHeight, xHeight };
}

const KEYS = [
  ["x", "y"],
  ["x1", "y1"],
  ["x2", "y2"],
];

/** Applies `fn([x, y]) => [x, y]` to every point of a path. */
export function mapPoints(commands, fn) {
  return commands.map((command) => {
    const next = { ...command };
    for (const [kx, ky] of KEYS) {
      if (kx in next) [next[kx], next[ky]] = fn([next[kx], next[ky]]);
    }
    return next;
  });
}

export const moveBy = (commands, dx, dy = 0) => mapPoints(commands, ([x, y]) => [x + dx, y + dy]);

export function bounds(commands) {
  const box = { x1: Infinity, y1: Infinity, x2: -Infinity, y2: -Infinity };
  for (const command of commands) {
    for (const [kx, ky] of KEYS) {
      if (!(kx in command)) continue;
      box.x1 = Math.min(box.x1, command[kx]);
      box.y1 = Math.min(box.y1, command[ky]);
      box.x2 = Math.max(box.x2, command[kx]);
      box.y2 = Math.max(box.y2, command[ky]);
    }
  }
  return box;
}

const n = (value) => Number(value.toFixed(2));

/** SVG path data. Quadratic curves become cubics so the output has one curve type. */
export function pathData(commands) {
  let d = "";
  let current = [0, 0];
  for (const c of commands) {
    if (c.type === "M" || c.type === "L") d += `${c.type}${n(c.x)} ${n(c.y)}`;
    else if (c.type === "C") d += `C${n(c.x1)} ${n(c.y1)} ${n(c.x2)} ${n(c.y2)} ${n(c.x)} ${n(c.y)}`;
    else if (c.type === "Q") {
      const [x0, y0] = current;
      const c1 = [x0 + (2 / 3) * (c.x1 - x0), y0 + (2 / 3) * (c.y1 - y0)];
      const c2 = [c.x + (2 / 3) * (c.x1 - c.x), c.y + (2 / 3) * (c.y1 - c.y)];
      d += `C${n(c1[0])} ${n(c1[1])} ${n(c2[0])} ${n(c2[1])} ${n(c.x)} ${n(c.y)}`;
    } else if (c.type === "Z") d += "Z";
    if ("x" in c) current = [c.x, c.y];
  }
  return d;
}

/**
 * A single-color SVG, cropped to the artwork. Takes a text run, or a list of
 * path command arrays (for symbols drawn in code). Fills are black; the shell
 * and the /routes page recolor them.
 */
export function toSvg(art, { pad = 0 } = {}) {
  const paths = Array.isArray(art) ? art : art.glyphs.map((g) => g.commands);
  const box = bounds(paths.flat());
  const d = paths.map((p) => pathData(moveBy(p, pad - box.x1, pad - box.y1))).join("");
  const width = box.x2 - box.x1 + pad * 2;
  const height = box.y2 - box.y1 + pad * 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${n(width)} ${n(height)}"><path fill="#000" fill-rule="nonzero" d="${d}"/></svg>\n`;
}

/** Path commands for shapes drawn in code, in the same format glyphs use. */
export const shapes = {
  rect: (x, y, w, h) => [
    { type: "M", x, y },
    { type: "L", x: x + w, y },
    { type: "L", x: x + w, y: y + h },
    { type: "L", x, y: y + h },
    { type: "Z" },
  ],
  /** A circle from four cubic arcs. `clockwise: false` cuts a hole in a nonzero fill. */
  circle: (cx, cy, r, { clockwise = true } = {}) => {
    const k = 0.5522847498 * r;
    const s = clockwise ? 1 : -1;
    return [
      { type: "M", x: cx + r, y: cy },
      { type: "C", x1: cx + r, y1: cy + s * k, x2: cx + k, y2: cy + s * r, x: cx, y: cy + s * r },
      { type: "C", x1: cx - k, y1: cy + s * r, x2: cx - r, y2: cy + s * k, x: cx - r, y: cy },
      { type: "C", x1: cx - r, y1: cy - s * k, x2: cx - k, y2: cy - s * r, x: cx, y: cy - s * r },
      { type: "C", x1: cx + k, y1: cy - s * r, x2: cx + r, y2: cy - s * k, x: cx + r, y: cy },
      { type: "Z" },
    ];
  },
  polygon: (points) => [
    ...points.map(([x, y], i) => ({ type: i === 0 ? "M" : "L", x, y })),
    { type: "Z" },
  ],
};
