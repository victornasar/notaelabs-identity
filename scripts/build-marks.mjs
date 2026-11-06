/**
 * Builds the Notae Labs marks.
 * Wordmark outlines come from Literata (opsz 72, wght 560), then redrawn
 * as paths with custom word spacing. The text face on the site is Source Serif 4.
 * Source font: https://github.com/google/fonts/tree/main/ofl/literata (OFL).
 * The font file is not shipped. Pass it as argv[2], or use /tmp/Literata-wordmark.ttf.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { Resvg } from "@resvg/resvg-js";
import { parse } from "opentype.js/dist/opentype.mjs";

const fontPath = process.argv[2] ?? "/tmp/Literata-wordmark.ttf";
const outDir = new URL("../public/marks/", import.meta.url);
mkdirSync(outDir, { recursive: true });

const INK = "#171614";
const PAPER = "#F6F4EF";
const INK_RGB = [0x17 / 255, 0x16 / 255, 0x14 / 255];

const font = parse(readFileSync(fontPath));
const fontSize = 400;
const tracking = -0.018;

function shiftCommands(commands, dx, dy) {
  return commands.map((command) => {
    const next = { ...command };
    for (const key of ["x", "y", "x1", "y1", "x2", "y2"]) {
      if (key in next) {
        next[key] += key.startsWith("x") ? dx : dy;
      }
    }
    return next;
  });
}

function boundsOf(commands) {
  let x1 = Infinity;
  let y1 = Infinity;
  let x2 = -Infinity;
  let y2 = -Infinity;
  for (const command of commands) {
    for (const [xKey, yKey] of [
      ["x", "y"],
      ["x1", "y1"],
      ["x2", "y2"],
    ]) {
      if (xKey in command) {
        x1 = Math.min(x1, command[xKey]);
        y1 = Math.min(y1, command[yKey]);
        x2 = Math.max(x2, command[xKey]);
        y2 = Math.max(y2, command[yKey]);
      }
    }
  }
  return { x1, y1, x2, y2 };
}

function renderWord(text) {
  const path = font.getPath(text, 0, fontSize, fontSize, {
    kerning: true,
    letterSpacing: tracking,
  });
  return path.commands;
}

function normalize(commands) {
  const box = boundsOf(commands);
  return {
    commands: shiftCommands(commands, -box.x1, -box.y1),
    width: box.x2 - box.x1,
    height: box.y2 - box.y1,
  };
}

function joinWords(leftText, rightText, gap) {
  const left = normalize(renderWord(leftText));
  const right = normalize(renderWord(rightText));
  const height = Math.max(left.height, right.height);
  const leftDy = height - left.height;
  const rightDy = height - right.height;
  const commands = [
    ...shiftCommands(left.commands, 0, leftDy),
    ...shiftCommands(right.commands, left.width + gap, rightDy),
  ];
  return {
    commands,
    width: left.width + gap + right.width,
    height,
  };
}

const nBox = boundsOf(renderWord("N"));
const capHeight = nBox.y2 - nBox.y1;
const wordGap = capHeight * 0.34;

const wordmark = joinWords("Notae", "Labs", wordGap);
const shortMark = normalize(renderWord("Notae"));

function commandsToPath(commands) {
  let current = null;
  let d = "";
  for (const command of commands) {
    if (command.type === "M") {
      d += `M${n(command.x)} ${n(command.y)}`;
      current = [command.x, command.y];
    } else if (command.type === "L") {
      d += `L${n(command.x)} ${n(command.y)}`;
      current = [command.x, command.y];
    } else if (command.type === "C") {
      d += `C${n(command.x1)} ${n(command.y1)} ${n(command.x2)} ${n(command.y2)} ${n(command.x)} ${n(command.y)}`;
      current = [command.x, command.y];
    } else if (command.type === "Q") {
      const [x0, y0] = current;
      const cx1 = x0 + (2 / 3) * (command.x1 - x0);
      const cy1 = y0 + (2 / 3) * (command.y1 - y0);
      const cx2 = command.x + (2 / 3) * (command.x1 - command.x);
      const cy2 = command.y + (2 / 3) * (command.y1 - command.y);
      d += `C${n(cx1)} ${n(cy1)} ${n(cx2)} ${n(cy2)} ${n(command.x)} ${n(command.y)}`;
      current = [command.x, command.y];
    } else if (command.type === "Z") {
      d += "Z";
    }
  }
  return d;
}

function n(value) {
  return Number(value.toFixed(2));
}

function svgDoc({ width, height, body }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${n(width)} ${n(height)}" fill="none">
${body}
</svg>
`;
}

function wordSvg(mark, fill) {
  const d = commandsToPath(mark.commands);
  return svgDoc({
    width: mark.width,
    height: mark.height,
    body: `  <path fill="${fill}" d="${d}"/>`,
  });
}

const markSize = 64;
const markStroke = 8;
const logomarkBody = (stroke) => `  <g fill="none" stroke="${stroke}" stroke-width="${markStroke}" stroke-linecap="square" stroke-linejoin="miter">
    <circle cx="32" cy="32" r="14"/>
    <path d="M32 4V60M4 32H60"/>
  </g>`;

function lockup(fill, markFill) {
  const gap = capHeight * 0.42;
  const markScale = wordmark.height / markSize;
  const markWidth = markSize * markScale;
  const width = markWidth + gap + wordmark.width;
  const height = wordmark.height;
  const d = commandsToPath(
    shiftCommands(wordmark.commands, markWidth + gap, 0),
  );
  return {
    width,
    height,
    svg: svgDoc({
      width,
      height,
      body: `  <g transform="scale(${n(markScale)})">
${logomarkBody(markFill).replaceAll("\n", "\n    ")}
  </g>
  <path fill="${fill}" d="${d}"/>`,
    }),
  };
}

const files = {
  "notae-wordmark.svg": wordSvg(wordmark, INK),
  "notae-wordmark-on-ink.svg": wordSvg(wordmark, PAPER),
  "notae-wordmark-short.svg": wordSvg(shortMark, INK),
  "notae-wordmark-short-on-ink.svg": wordSvg(shortMark, PAPER),
  "notae-logomark.svg": svgDoc({
    width: markSize,
    height: markSize,
    body: logomarkBody(INK),
  }),
  "notae-logomark-on-ink.svg": svgDoc({
    width: markSize,
    height: markSize,
    body: logomarkBody(PAPER),
  }),
};

const lockupInk = lockup(INK, INK);
const lockupPaper = lockup(PAPER, PAPER);
files["notae-lockup.svg"] = lockupInk.svg;
files["notae-lockup-on-ink.svg"] = lockupPaper.svg;

for (const [name, svg] of Object.entries(files)) {
  writeFileSync(new URL(name, outDir), svg);
}

const raster = [
  ["notae-logomark.svg", markSize, markSize],
  ["notae-wordmark.svg", wordmark.width, wordmark.height],
  ["notae-wordmark-short.svg", shortMark.width, shortMark.height],
  ["notae-lockup.svg", lockupInk.width, lockupInk.height],
];

for (const [name, width, height] of raster) {
  const svg = readFileSync(new URL(name, outDir));
  const stem = name.replace(/\.svg$/, "");
  for (const size of [16, 32, 180, 512]) {
    const targetWidth = Math.max(1, Math.round((width / height) * size));
    const resvg = new Resvg(svg, {
      fitTo: { mode: "height", value: size },
      background: "rgba(0,0,0,0)",
    });
    const png = resvg.render().asPng();
    writeFileSync(new URL(`${stem}-${size}.png`, outDir), png);
    if (targetWidth < 1) throw new Error(`bad width for ${name}`);
  }
}

function pdfForArtwork(svgText, artWidth, artHeight) {
  const pad = 18;
  const scale = 720 / artHeight;
  const pageW = artWidth * scale + pad * 2;
  const pageH = artHeight * scale + pad * 2;
  const commands = svgTextToPdf(svgText, scale, pad, pageH - pad);
  return buildPdf(pageW, pageH, commands);
}

function svgTextToPdf(svgText, scale, originX, originTop) {
  const color = INK_RGB.map((channel) => channel.toFixed(4)).join(" ");
  let ops = `${color} RG\n${color} rg\n`;
  const groupScale = Number(svgText.match(/transform="scale\(([^)]+)\)"/)?.[1] ?? 1);
  const unit = scale * groupScale;

  if (svgText.includes("<circle")) {
    const circle = svgText.match(/cx="([^"]+)" cy="([^"]+)" r="([^"]+)"/);
    if (!circle) throw new Error("Circle is missing coordinates");
    const stroke = Number(svgText.match(/stroke-width="([^"]+)"/)?.[1] ?? 8);
    const cx = originX + Number(circle[1]) * unit;
    const cy = originTop - Number(circle[2]) * unit;
    const r = Number(circle[3]) * unit;
    const k = 0.5522847498;
    ops += `${fmt(stroke * unit)} w 2 J 0 j\n`;
    ops += `${fmt(cx + r)} ${fmt(cy)} m\n`;
    ops += `${fmt(cx + r)} ${fmt(cy + k * r)} ${fmt(cx + k * r)} ${fmt(cy + r)} ${fmt(cx)} ${fmt(cy + r)} c\n`;
    ops += `${fmt(cx - k * r)} ${fmt(cy + r)} ${fmt(cx - r)} ${fmt(cy + k * r)} ${fmt(cx - r)} ${fmt(cy)} c\n`;
    ops += `${fmt(cx - r)} ${fmt(cy - k * r)} ${fmt(cx - k * r)} ${fmt(cy - r)} ${fmt(cx)} ${fmt(cy - r)} c\n`;
    ops += `${fmt(cx + k * r)} ${fmt(cy - r)} ${fmt(cx + r)} ${fmt(cy - k * r)} ${fmt(cx + r)} ${fmt(cy)} c\n`;
    ops += "S\n";
    const x = originX + 32 * unit;
    const yTop = originTop - 4 * unit;
    const yBot = originTop - 60 * unit;
    const xLeft = originX + 4 * unit;
    const xRight = originX + 60 * unit;
    const yMid = originTop - 32 * unit;
    ops += `${fmt(x)} ${fmt(yTop)} m ${fmt(x)} ${fmt(yBot)} l S\n`;
    ops += `${fmt(xLeft)} ${fmt(yMid)} m ${fmt(xRight)} ${fmt(yMid)} l S\n`;
  }

  const path = svgText.match(/<path fill="[^"]+" d="([^"]+)"/);
  if (path) ops += pathDataToPdf(path[1], scale, originX, originTop);
  if (!svgText.includes("<circle") && !path) throw new Error("No artwork in SVG");
  return ops;
}

function pathDataToPdf(d, scale, originX, originTop) {
  const tokens = d.match(/[MLCZ]|-?\d*\.?\d+/g);
  let i = 0;
  let ops = "";
  let x0 = 0;
  let y0 = 0;
  const mapX = (v) => originX + v * scale;
  const mapY = (v) => originTop - v * scale;
  while (i < tokens.length) {
    const token = tokens[i];
    if (token === "M" || token === "L") {
      const x = Number(tokens[i + 1]);
      const y = Number(tokens[i + 2]);
      ops += `${fmt(mapX(x))} ${fmt(mapY(y))} ${token === "M" ? "m" : "l"}\n`;
      x0 = x;
      y0 = y;
      i += 3;
    } else if (token === "C") {
      const nums = [0, 1, 2, 3, 4, 5].map((offset) => Number(tokens[i + 1 + offset]));
      ops += `${fmt(mapX(nums[0]))} ${fmt(mapY(nums[1]))} ${fmt(mapX(nums[2]))} ${fmt(mapY(nums[3]))} ${fmt(mapX(nums[4]))} ${fmt(mapY(nums[5]))} c\n`;
      x0 = nums[4];
      y0 = nums[5];
      i += 7;
    } else if (token === "Z") {
      ops += "h\n";
      i += 1;
    } else {
      throw new Error(`Unexpected path token ${token} after ${x0},${y0}`);
    }
  }
  ops += "f\n";
  return ops;
}

function fmt(value) {
  return Number(value.toFixed(3));
}

function buildPdf(width, height, content) {
  const header = `%PDF-1.4\n`;
  const objects = [
    `1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n`,
    `2 0 obj << /Type /Pages /Count 1 /Kids [3 0 R] >> endobj\n`,
    `3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 ${fmt(width)} ${fmt(height)}] /Contents 4 0 R /Resources << /ProcSet [/PDF] >> >> endobj\n`,
    `4 0 obj << /Length ${Buffer.byteLength(content)} >> stream\n${content}endstream endobj\n`,
  ];
  let body = header;
  const offsets = [0];
  for (const object of objects) {
    offsets.push(Buffer.byteLength(body));
    body += object;
  }
  const xref = Buffer.byteLength(body);
  body += `xref\n0 ${objects.length + 1}\n`;
  body += `0000000000 65535 f \n`;
  for (let index = 1; index < offsets.length; index += 1) {
    body += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
  }
  body += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return body;
}

const pdfJobs = [
  ["notae-wordmark.svg", wordmark.width, wordmark.height],
  ["notae-wordmark-short.svg", shortMark.width, shortMark.height],
  ["notae-logomark.svg", markSize, markSize],
  ["notae-lockup.svg", lockupInk.width, lockupInk.height],
];

for (const [name, width, height] of pdfJobs) {
  const svg = readFileSync(new URL(name, outDir), "utf8");
  const pdf = pdfForArtwork(svg, width, height);
  writeFileSync(new URL(name.replace(/\.svg$/, ".pdf"), outDir), pdf);
}

const metrics = {
  capHeight,
  wordGap,
  wordmark: { width: wordmark.width, height: wordmark.height },
  shortMark: { width: shortMark.width, height: shortMark.height },
  lockup: { width: lockupInk.width, height: lockupInk.height },
  logomark: { size: markSize, stroke: markStroke },
  clearSpaceEquals: "capital N height",
  minimums: {
    logomarkPx: 16,
    wordmarkHeightPx: 16,
  },
};

writeFileSync(
  new URL("metrics.json", outDir),
  `${JSON.stringify(metrics, null, 2)}\n`,
);

console.log(JSON.stringify(metrics, null, 2));
