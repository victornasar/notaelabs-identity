/**
 * What the plugin builds on the Brand book page, worked out from the bundle
 * without touching Figma, so it can be tested: the fonts to load, the color
 * variables, the text styles, and the book's frames. Each section is a row:
 * a divider that names it, then the landscape frames that show it. Frames
 * carry labels and values only; the explanations live in the variable and
 * style descriptions and on the web page. `figma-plugin/src/code.ts` only
 * carries this out.
 */
import { bestOn, contrast, luminance, wcagLevel } from "../brand/color";
import { kindNames } from "../brand/labels";
import { physicalKinds, type ApplicationKind, type DeviceMisuseKind, type MisuseShow } from "../brand/schema";
import { strip } from "../brand/svg";
import type { BundleFont, BundleIntro, BundleTextStyle, FigmaBundle, FontName } from "./bundle";

/** The variable collection every brand color lives in. */
export const collectionName = "Colors";
/** The one page the plugin manages; it never touches another. */
export const pageName = "Brand book";

/** Landscape frames, as agency guidelines are: 1920 × 1080, `spacing` apart on the canvas. */
export const layout = { width: 1920, height: 1080, pad: 96, gap: 16, radius: 32, minSwatch: 320, spacing: 160 };
/** The width inside a frame's margins. */
export const column = layout.width - layout.pad * 2;

/** A fill: a color variable by name, at an opacity for quiet text and hairlines. */
export type Paint = { color: string; opacity?: number };

export type StyleSpec = Pick<BundleTextStyle, "name" | "font" | "fontSize" | "lineHeight" | "letterSpacing" | "textCase" | "description">;

export type SwatchCard = {
  color: string;
  ink: string;
  width: number;
  /** Outlined, because it is the frame's own color. */
  edge: boolean;
  role: string;
  name: string;
  pills: { label: string; value: string }[];
};

/** The accent's two jobs side by side, when the device is drawn in it: a flat field, and the device's light. */
export type AccentRoles = { color: string; asColor: string; asLight: string };

/** One color's share of the bar, as wide as its proportion. */
export type BarPart = { color: string; ink: string; width: number; label: string; edge: boolean };

/** A color on a ground it is approved on: what for, and how far apart they are. */
export type PairCard = { ink: string; ground: string; use: string; ratio: string; level: string };

export type FaceCard = {
  kind: string;
  glyphs: string;
  family: string;
  weights: string;
  /** The face's heaviest weight, which sets its glyphs and name. */
  font: FontName;
  /** The lead card is filled with the accent; the rest are outlined. */
  fill: string | null;
  ink: string;
};

/** The scale set as one sheet of real copy: a label, a headline, a paragraph and a figure. */
export type InUse = { label: string; headline: string; body: string; figure?: string };

/** An application drawn as the thing itself: its words by slot, what it is, and why the brand needs it. */
export type AppCard = {
  kind: ApplicationKind;
  name: string;
  medium: "Print" | "Screen";
  why: string;
  ground: string;
  ink: string;
  headline?: string;
  person?: { name: string; role: string };
  lines: string[];
};

/** Applications on screens the brand owns; the rest are marketing, in print and on others' screens. */
const digitalKinds: ApplicationKind[] = ["website", "app-icon", "dashboard"];

export type ScaleRow = { id: string; spec: string; style: string; sample: string };

/** A frame that only names its section: "02" and "COLOR". The cover opens the first section instead. */
export type Divider = { name: string; number: string; title: string; cover: boolean };

/**
 * A landscape frame showing one part of a section. `page` is its place in the
 * book. It is filled with `ground`, its type is set in `ink`, and its eyebrow
 * in `tint`: the accent on the brand's ground, the ink on any other.
 */
export type ContentFrame = {
  name: string;
  kind: "overview" | "refuses" | "idea" | "palette" | "pairs" | "roles" | "faces" | "scale" | "inUse" | "symbol" | "lockup" | "misuse" | "device" | "rhythm" | "application";
  eyebrow: string;
  page: string;
  ground: string;
  ink: string;
  tint: string;
  /** Which of `applications.cards` an application frame draws. */
  app?: number;
};

/** A misuse drawn on its ground and crossed out, over the rule it breaks. `glow` is the light it sits on. */
export type MisuseCard = {
  rule: string;
  kind: MisuseShow["kind"];
  svg: string;
  text?: string;
  ground: string;
  ink: string;
  glow?: string;
};

/** A mark drawn large, with what it is in a caption at the bottom right. */
export type Showcase = { svg: string; name: string; caption: string; ink: string };

export type BookSection = { divider: Divider; frames: ContentFrame[] };

export type BookPlan = {
  fonts: FontName[];
  variables: { name: string; rgb: { r: number; g: number; b: number }; description: string }[];
  textStyles: StyleSpec[];
  /** Color names. */
  ground: string;
  ink: string;
  accent: string;
  /** Text style names, by the job they do in the book. */
  text: { heading: string; body: string; small: string; label: string };
  /** Dividers set their names in the display face's heaviest weight. */
  display: { font: FontName; upper: boolean };
  /** The Introduction's large sentences, in the text face's lightest weight. */
  statement: FontName;
  brand: string;
  /** The first frame, opening the first section: the edition over the cover's mark. */
  cover: { edition: string; svg: string };
  /** `refuses` as its separate sentences, one line each. */
  intro: Omit<BundleIntro, "refuses"> & { refuses: string[] };
  palette: { cards: SwatchCard[]; note?: string; pairs: PairCard[]; roles?: AccentRoles; bar: BarPart[] };
  faces: FaceCard[];
  scale: ScaleRow[];
  inUse: InUse;
  /** The symbol alone, then the lockup, which each `lockup` frame sets on its own ground. */
  logo: { symbol: Showcase; lockup: string; misuse: MisuseCard[] };
  /** The device, and the ways it is drawn wrong: the construction is the right way's caption. */
  device?: Showcase & { misuse: { rule: string; show: DeviceMisuseKind }[]; strip: string };
  /** The device's applications, and the marks and names they carry. */
  applications: {
    cards: AppCard[];
    lockup: string;
    wordmark: string;
    symbol: string;
    domain?: string;
    /** The account a post comes from: the domain's name, or the brand's own without one. */
    handle: string;
    category?: string;
  };
  /** In reading order: one row on the canvas each. */
  sections: BookSection[];
};

const sameFont = (a: FontName, b: FontName) => a.family === b.family && a.style === b.style;

/** The brand's fonts Figma doesn't list, so the plugin can stop and say where they are. */
export function missingFonts(bundle: FigmaBundle, available: FontName[]): BundleFont[] {
  return bundle.fonts.filter((font) => !available.some((a) => sameFont(a, font)));
}

/**
 * What Figma has under a missing font's first word, such as "Big Shoulders
 * Display" for "Big Shoulders", since its built-in Google Fonts can name a
 * family differently from the file.
 */
export function nearFonts(font: FontName, available: FontName[]): string[] {
  const first = font.family.split(" ")[0]!.toLowerCase();
  const near = available.filter((a) => a.family.toLowerCase().split(" ")[0] === first);
  const families = [...new Set(near.map((a) => a.family))];
  return families.map((family) => `${family}: ${near.filter((a) => a.family === family).map((a) => a.style).join(", ")}`);
}

/**
 * Widths as shares of `total`, `gap` apart, none under `min`: a card too
 * narrow for its labels takes the minimum and the rest share what's left.
 */
export function shareWidths(shares: number[], total: number, gap: number, min: number): number[] {
  const space = total - gap * (shares.length - 1);
  const floored = new Set<number>();
  for (;;) {
    const free = space - floored.size * min;
    const sum = shares.reduce((s, share, i) => (floored.has(i) ? s : s + share), 0);
    const widths = shares.map((share, i) => (floored.has(i) ? min : (free * share) / sum));
    const under = widths.findIndex((w, i) => w < min && !floored.has(i));
    if (under === -1) return widths.map(Math.floor);
    floored.add(under);
  }
}

/**
 * The sheet's copy: the first application with a headline, which is real copy the brand
 * wrote for a real surface, else the positioning. Its lines become the label and the figure.
 */
function inUse(bundle: FigmaBundle): InUse {
  const words = (value: string | string[] | undefined) => (Array.isArray(value) ? value : value ? [value] : []);
  const app = bundle.device?.applications.find((a) => typeof a.copy.headline === "string");
  const body = bundle.intro.mission ?? bundle.intro.positioning;
  if (!app) return { label: bundle.name, headline: bundle.intro.positioning, body };
  const [label = bundle.name, figure] = words(app.copy.lines);
  return { label, headline: app.copy.headline as string, body, ...(figure ? { figure } : {}) };
}

export function bookPlan(bundle: FigmaBundle): BookPlan {
  const { colors, textStyles, fonts } = bundle;
  const byRole = (role: string) => colors.find((c) => c.role === role);
  const ground = byRole("ground") ?? colors[0]!;
  const ink = byRole("ink") ?? colors[1] ?? ground;
  const accent = byRole("accent") ?? ink;
  const nameOf = (hex: string) => colors.find((c) => c.hex === hex)!.name;
  const hexOf = (name: string) => colors.find((c) => c.name === name)!.hex;
  const hexes = colors.map((c) => c.hex);

  // Which style does which job, by size, so a brand's own step names don't matter.
  const bySize = [...textStyles].sort((a, b) => a.fontSize - b.fontSize);
  const plain = bySize.filter((t) => t.textCase === "ORIGINAL");
  const label = textStyles.find((t) => t.id === "label") ?? bySize[0]!;
  // No Array.at: Figma's sandbox may predate it.
  const heading = [...bySize].reverse().find((t) => t.fontSize <= 96) ?? bySize[bySize.length - 1]!;
  const body = textStyles.find((t) => t.id === "body") ?? plain[plain.length - 1] ?? label;
  const small = plain.find((t) => t !== body && t.fontSize < body.fontSize) ?? body;

  const heaviest = (face: string) => fonts.filter((f) => f.face === face).sort((a, b) => b.weight - a.weight)[0];
  const upper = (face: string) => textStyles.filter((t) => t.face === face).every((t) => t.textCase === "UPPER");
  const display = heaviest("display") ?? fonts[0]!;
  const lightest = fonts.filter((f) => f.face === "text").sort((a, b) => a.weight - b.weight)[0] ?? display;

  // Cards run largest share first, as the page does.
  const ordered = [...colors].sort((a, b) => b.proportion - a.proportion);
  const uses = { text: "Text", large: "Large text", graphic: "Graphics" };
  const pairs = colors.flatMap((c) =>
    c.pairs.map((p): PairCard => {
      const ratio = contrast(c.hex, hexOf(p.on));
      return { ink: c.name, ground: p.on, use: uses[p.as], ratio: `${ratio.toFixed(2)}:1`, level: wcagLevel(ratio) ?? "Below AA" };
    }),
  );
  const roles: AccentRoles | undefined =
    bundle.device && bundle.device.ink === accent.name && accent !== ink
      ? { color: accent.name, asColor: accent.use, asLight: bundle.device.construction }
      : undefined;
  const barWidths = shareWidths(ordered.map((c) => c.proportion), column, 0, 0);
  const bar = ordered.map((c, i): BarPart => ({
    color: c.name,
    ink: nameOf(bestOn(c.hex, hexes)),
    width: barWidths[i]!,
    label: `${c.name} ${c.proportion}%`,
    edge: c.name === ground.name,
  }));
  const widths = shareWidths(ordered.map((c) => c.proportion), column, layout.gap, layout.minSwatch);

  // The marks: the symbol (or the primary mark, when there is none) in the accent if it may sit on the
  // ground that way, then the cover's mark on each ground it is approved for, one ink each, lightest first.
  const { items, variants, cover } = bundle.marks;
  const symbol = items.find((m) => m.role === "symbol") ?? items[0]!;
  const coverSvg = (items.find((m) => m.file === cover) ?? items[0]!).svg;
  // Only the misuses a brand says how to draw; the rest are words, for the guidelines.
  const misuse = bundle.marks.misuse.flatMap(({ rule, show }): MisuseCard[] => {
    if (!show) return [];
    const svg = items.find((m) => m.file === show.mark)?.svg ?? "";
    const on = show.kind === "colors" ? { ground: show.ground, ink: show.ink } : { ground: ground.name, ink: ink.name };
    return [{ rule, kind: show.kind, svg, ...("text" in show ? { text: show.text } : {}), ...on, ...(show.kind === "glow" ? { glow: accent.name } : {}) }];
  });
  const onGround = variants.filter((v) => v.ground === ground.name);
  const symbolInk = (onGround.find((v) => v.ink === accent.name) ?? onGround[0])?.ink ?? ink.name;
  const grounds = variants
    .filter((v, i) => variants.findIndex((w) => w.ground === v.ground) === i)
    .sort((a, b) => luminance(hexOf(b.ground)) - luminance(hexOf(a.ground)));

  // The applications, each with its words by slot, as the page draws them.
  const word = (value: string | string[] | undefined) => (typeof value === "string" ? value : undefined);
  const apps = (bundle.device?.applications ?? []).map(({ kind, why, ground, ink, copy }): AppCard => {
    const [headline, name, role] = [word(copy.headline), word(copy.name), word(copy.role)];
    return {
      kind,
      name: kindNames[kind],
      medium: physicalKinds.includes(kind) ? "Print" : "Screen",
      why,
      ground,
      ink,
      ...(headline ? { headline } : {}),
      ...(name ? { person: { name, role: role ?? "" } } : {}),
      lines: Array.isArray(copy.lines) ? copy.lines : [],
    };
  });
  const appParts = (digital: boolean) =>
    apps.flatMap((a, app): Part[] => (digitalKinds.includes(a.kind) === digital ? [{ kind: "application", part: a.name, app }] : []));
  const primary = items.find((m) => m.role === "primary") ?? items[0]!;

  // The book's outline, as an agency sets out brand guidelines. A section is drawn once the brand has
  // what it shows, and numbers count only the drawn ones. Pages count dividers too.
  type Part = { kind: ContentFrame["kind"]; part: string; ground?: string; ink?: string; app?: number };
  const device = bundle.device;
  const outline: { title: string; parts: Part[] }[] = [
    {
      title: "Introduction",
      parts: [
        { kind: "overview", part: "Overview" },
        ...(bundle.intro.refuses ? [{ kind: "refuses" as const, part: "What we refuse" }] : []),
        { kind: "idea", part: "The idea" },
      ],
    },
    {
      title: "Logo",
      parts: [
        { kind: "symbol", part: "Logo mark" },
        ...grounds.map((v) => ({ kind: "lockup" as const, part: `On ${v.ground}`, ground: v.ground, ink: v.ink })),
        ...(misuse.length ? [{ kind: "misuse" as const, part: "Misuse" }] : []),
      ],
    },
    {
      title: "Color",
      parts: [
        { kind: "palette", part: "Palette" },
        ...(pairs.length ? [{ kind: "pairs" as const, part: "Pairs" }] : []),
        ...(roles ? [{ kind: "roles" as const, part: roles.color }] : []),
      ],
    },
    {
      title: "Typography",
      parts: [
        { kind: "faces", part: "Typefaces" },
        { kind: "scale", part: "Scale" },
        { kind: "inUse", part: "In use" },
      ],
    },
    {
      title: "Visual Language",
      parts: device
        ? [
            { kind: "device" as const, part: device.name },
            ...(device.misuse.length ? [{ kind: "rhythm" as const, part: "Rules" }] : []),
          ].map((p): Part => ({ ...p, ground: device.ground, ink: nameOf(bestOn(hexOf(device.ground), hexes)) }))
        : [],
    },
    { title: "Iconography & Illustration", parts: [] },
    { title: "Imagery & Art Direction", parts: [] },
    { title: "Layout & Composition", parts: [] },
    { title: "Digital Applications", parts: appParts(true) },
    { title: "Marketing Applications", parts: appParts(false) },
    { title: "Brand Voice", parts: [] },
    { title: "Brand Guidelines", parts: [] },
  ];
  let page = 0;
  const sections = outline
    .filter((s) => s.parts.length)
    .map(({ title, parts }, n): BookSection => {
      const number = String(n + 1).padStart(2, "0");
      page += 1;
      return {
        divider: n === 0 ? { name: "Cover", number, title, cover: true } : { name: `${number} ${title}`, number, title, cover: false },
        frames: parts.map(({ kind, part, app, ...on }, i) => {
          page += 1;
          const own = !on.ground || on.ground === ground.name;
          return {
            name: `${number}.${i + 1} ${title} · ${part}`,
            kind,
            eyebrow: `${number} · ${title} · ${part}`,
            page: String(page).padStart(2, "0"),
            ground: on.ground ?? ground.name,
            ink: on.ink ?? ink.name,
            tint: own ? accent.name : (on.ink ?? ink.name),
            ...(app === undefined ? {} : { app }),
          };
        }),
      };
    });

  return {
    fonts: fonts.filter((f, i, all) => all.findIndex((g) => sameFont(f, g)) === i).map(({ family, style }) => ({ family, style })),
    variables: colors.map(({ name, rgb, description }) => ({ name, rgb, description })),
    textStyles: textStyles.map((t) => ({
      name: t.name,
      font: t.font,
      fontSize: t.fontSize,
      lineHeight: t.lineHeight,
      letterSpacing: t.letterSpacing,
      textCase: t.textCase,
      description: t.features.length ? `${t.description} OpenType: ${t.features.join(", ")}.` : t.description,
    })),
    ground: ground.name,
    ink: ink.name,
    accent: accent.name,
    text: { heading: heading.name, body: body.name, small: small.name, label: label.name },
    display: { font: { family: display.family, style: display.style }, upper: upper("display") },
    statement: { family: lightest.family, style: lightest.style },
    brand: bundle.name,
    cover: { edition: bundle.edition, svg: coverSvg },
    intro: { ...bundle.intro, refuses: bundle.intro.refuses?.split(/(?<=\.)\s+/) ?? [] },
    palette: {
      cards: ordered.map((c, i) => ({
        color: c.name,
        ink: nameOf(bestOn(c.hex, hexes)),
        width: widths[i]!,
        edge: c.name === ground.name,
        role: `${c.roleName} · ${c.proportion}%`,
        name: c.name,
        pills: c.values,
      })),
      // The full caveat is in each variable's description; the frame keeps one line.
      ...(bundle.printNote ? { note: "CMYK and Pantone are approximate. Proof before print." } : {}),
      pairs,
      ...(roles ? { roles } : {}),
      bar,
    },
    faces: bundle.type.faces.flatMap((face, i) => {
      const font = heaviest(face.face);
      if (!font) return [];
      const caps = upper(face.face);
      return [
        {
          kind: face.kind,
          glyphs: caps ? "AG" : "Ag",
          family: caps ? face.family.toUpperCase() : face.family,
          weights: `Weights ${face.weights.join(", ")}`,
          font: { family: font.family, style: font.style },
          fill: i === 0 ? accent.name : null,
          ink: i === 0 ? ground.name : ink.name,
        },
      ];
    }),
    scale: textStyles.map((t) => ({ id: t.id, spec: t.spec, style: t.name, sample: t.sample })),
    inUse: inUse(bundle),
    logo: {
      symbol: { svg: symbol.svg, name: symbol.name, caption: symbol.meaning ?? symbol.use, ink: symbolInk },
      lockup: coverSvg,
      misuse,
    },
    ...(bundle.device
      ? {
          device: {
            svg: bundle.device.svg,
            name: bundle.device.name,
            caption: bundle.device.construction,
            ink: bundle.device.ink,
            misuse: bundle.device.misuse,
            strip: strip(bundle.device.svg).svg,
          },
        }
      : {}),
    applications: {
      cards: apps,
      lockup: (items.find((m) => m.role === "alternate") ?? primary).svg,
      wordmark: primary.svg,
      symbol: symbol.svg,
      ...(bundle.domain ? { domain: bundle.domain } : {}),
      handle: bundle.domain?.replace(/\..*$/, "") ?? bundle.name,
      ...(bundle.category ? { category: bundle.category } : {}),
    },
    sections,
  };
}
