/**
 * The shape of a brand. Every client lives in `brands/<slug>/brand.ts` and
 * exports `defineBrand({...})`. The shell renders only from this data.
 *
 * A brand has two layers. The decision layer (concept, category, equity) is
 * agreed with the client first, in `brands/<slug>/work/strategy.ts`. Every
 * visual choice after it (colors, faces, the type scale, marks) carries
 * `cites`, naming the decisions it follows from, and `defineBrand` refuses a
 * citation that doesn't resolve.
 */

import { contrast } from "./color";

// --- Decision layer ---------------------------------------------------------

/** A basic shape the marks and the rest of the system are built from. */
export type Primitive = {
  /** Short kebab-case id, cited as `concept.primitives.<id>`. */
  id: string;
  /** The shape, described so it can be drawn: "a 3:1 horizontal bar". */
  shape: string;
  /** Where it comes from in the idea. */
  from: string;
};

export type Concept = {
  /** The one idea, in a sentence. Cited as `concept.idea`. */
  idea: string;
  /** The physical or cultural thing the idea borrows from. Cited as `concept.source`. */
  source: string;
  primitives: Primitive[];
};

export type Convention = {
  /** Cited as `category.conventions.<id>`. */
  id: string;
  /** What most of the category does: "a saturated blue accent". */
  convention: string;
  /** Who does it, by name. */
  seenIn: string[];
  verdict: "reject" | "keep";
  why: string;
};

/** How a competitor's identity looks, so the brand can be told apart from it. */
export type CompetitorIdentity = { name: string; identity: string };

export type Category = {
  /** Cited as `category.name`. */
  name: string;
  /** The three competitors named in the interview. */
  competitors: string[];
  /** Each competitor's identity, described. Names match `competitors`. */
  identities?: CompetitorIdentity[];
  conventions: Convention[];
};

export type EquityAsset = {
  /** Cited as `equity.assets.<id>`. */
  id: string;
  /** Something the current identity owns: the name, a color, a shape. */
  asset: string;
  verdict: "keep" | "evolve" | "drop";
  why: string;
};

export type Equity = {
  /** `greenfield` when there is no earlier identity to keep anything from. */
  status: "greenfield" | "refresh" | "replace";
  assets: EquityAsset[];
};

/** A rule the client lifted in writing, such as using an excluded font. */
export type Override = { rule: string; reason: string; approved: string };

export type Strategy = {
  concept: Concept;
  category: Category;
  equity: Equity;
  overrides?: Override[];
};

/**
 * A pointer into the decision layer, such as `concept.primitives.margin-tick`
 * or `category.conventions.blue-accent`.
 */
export type Cite =
  | "concept.idea"
  | "concept.source"
  | `concept.primitives.${string}`
  | "category.name"
  | `category.conventions.${string}`
  | `equity.assets.${string}`;

type Cited = {
  /** The decisions this choice follows from. At least one. */
  cites: Cite[];
};

// --- Visual layer -----------------------------------------------------------

export type ColorRole = "ground" | "ink" | "accent" | "support";

/**
 * How a color is used on another color. Text needs 4.5:1, large text and
 * graphics (marks, rules, icons) need 3:1.
 */
export type ColorUse = { on: string; as: "text" | "large" | "graphic" };

export const minimumContrast: Record<ColorUse["as"], number> = { text: 4.5, large: 3, graphic: 3 };

export type BrandColor = Cited & {
  name: string;
  role: ColorRole;
  /** Share of a typical layout, in percent. All colors should sum to 100. */
  proportion: number;
  hex: string;
  /** Where the color was chosen, as `oklch(L% C H)`. `hex` is what ships. */
  oklch?: string;
  cmyk?: string;
  pantone?: string;
  /** One line on where the color belongs. */
  use: string;
  /** Every pairing the color is used in. Each must pass its contrast minimum. */
  pairs?: ColorUse[];
};

export type BrandMark = Cited & {
  /** File name inside the brand's `marks/` folder. Single-color SVG. */
  file: string;
  name: string;
  /** Why this version exists, in one line. */
  use: string;
};

export type Marks = {
  /** The one mark every brand needs. */
  primary: BrandMark;
  symbol?: BrandMark;
  /** Stacked versions, short names, lockups. */
  alternates?: BrandMark[];
  /** Clear space as a fraction of the primary mark's height. */
  clearSpace: { ratio: number; basis: string };
  minimumSize: { screen: string; print?: string };
  /** The grounds the marks may sit on, and the ink they take there. Color names. */
  on?: { ground: string; ink: string }[];
  /** Things never to do to the marks, one per line: "Never outline the wordmark". */
  misuse?: string[];
};

export type Face = Cited & {
  /** The family's id in fonts/library.json. */
  library: string;
  /** The family name, exactly as the library lists it. */
  family: string;
  /** Where it is used, in one line. */
  role: string;
  /** The weights the brand uses, and no others. */
  weights: number[];
};

export type Case = "sentence" | "title" | "upper" | "lower" | "as-written";

/** One step of the type scale. */
export type TypeStyle = {
  /** Short id, such as `display`, `title`, `body`, `caption`. */
  id: string;
  face: "display" | "text" | "mono";
  /** Size in px at desktop width. */
  size: number;
  /** Size in px at 390px width, when it differs. */
  mobileSize?: number;
  lineHeight: number;
  weight: number;
  /** Letter spacing in em. */
  tracking: number;
  case: Case;
  /** OpenType features, such as `tnum` or `ss01`. */
  features?: string[];
  use: string;
};

/** The library font a wordmark started from, and what was changed. */
export type WordmarkSource = Cited & {
  library: string;
  family: string;
  /** Variable axis values or the static style used: `wght 560, opsz 72`. */
  setting: string;
  /** Each named change to the outlines or spacing. Empty means set as-is. */
  changes: string[];
};

export type TypeSystem = {
  display: Face;
  text: Face;
  mono?: Face;
  scale: Cited & { steps: TypeStyle[] };
  /** Case and setting rules, one per line: "Headlines in sentence case, never all caps". */
  rules: string[];
  wordmark?: WordmarkSource;
};

export type VoiceTrait = { trait: string; means: string; doesNotMean: string };

/**
 * A second arrangement of the palette, such as day and night: which color is
 * the ground, which is the ink, and each color's share of a layout in it.
 */
export type ColorMode = {
  name: string;
  ground: string;
  ink: string;
  /** Color name to percent. Sums to 100. */
  proportions: Record<string, number>;
  /** Where this mode is used. */
  use: string;
};

/** A supporting shape, pattern or device, built from the strategy's primitives. */
export type GraphicElement = Cited & {
  name: string;
  /** Single-color SVG in the brand's `graphics/` folder, drawn in code from the primitives. */
  file: string;
  /** Color names: the field it is shown on, and the color it is drawn in. */
  ground: string;
  ink: string;
  /** The shape and how it is built: "Sodium half-ellipses, 3:1, one width apart". */
  construction: string;
  use: string;
};

export type GraphicLanguage = {
  elements: GraphicElement[];
  /** Layout principles, one per line: grid, margins, where fields stop. */
  layout: string[];
};

export type Photography = Cited & {
  /** The style in a sentence. */
  style: string;
  subjects: string[];
  lighting: string;
  composition: string;
  /** Color and grading applied to images. */
  treatment: string;
  cropping: string;
  /** What never to show. */
  avoid: string[];
  /** File names in the brand's `images/` folder; each needs an entry in `images/credits.json`. */
  references: string[];
};

/** The kinds of image the engine makes in code, from a brand's palette, symbol and graphic language. */
export const imageTypes = ["light-field", "grain-field", "symbol-render", "hard-light", "symbol-pattern"] as const;
export type ImageType = (typeof imageTypes)[number];

/** One generated image, made at the size an application needs. */
export type BrandImage = {
  /** File stem in the brand's `images/` folder: `cover` writes `images/cover.png`. */
  name: string;
  type: ImageType;
  width: number;
  height: number;
  /** Change it to re-roll this image alone. */
  seed: number;
  /** Color names. */
  ground: string;
  ink: string;
  /** The color of the surfaces light lands on, in a scene; the ground's when absent. */
  surface?: string;
  /** What the image is made for: an application kind, or "cover". */
  for: string;
};

export type Imagery = Cited & {
  /** The type most images use, and at most one second type. */
  main: ImageType;
  second?: ImageType;
  /** Why the strategy picks these types, and rules the others out. */
  why: string;
  images: BrandImage[];
};

/** A kind of real-world application the renderer can draw. */
export type ApplicationKind =
  | "website"
  | "business-card"
  | "letterhead"
  | "email-signature"
  | "social-post"
  | "deck"
  | "signage"
  | "poster"
  | "app-icon"
  | "dashboard";

export type Application = {
  kind: ApplicationKind;
  /** Why the client needs it, from the brief. */
  why: string;
  /** Color names. */
  ground: string;
  ink: string;
  /** The words drawn on it, by slot: `headline`, `name`, `lines`. */
  copy: Record<string, string | string[]>;
};

/** The nine parts of a complete brand book, in presentation order. */
export const parts = [
  "strategy",
  "creative-direction",
  "logo",
  "type",
  "color",
  "graphic-language",
  "photography",
  "applications",
  "guidelines",
] as const;
export type Part = (typeof parts)[number];

export type Brand = Strategy & {
  slug: string;
  name: string;
  /** Who the guidelines were prepared for, and when. */
  edition: string;
  positioning: string;
  story?: {
    /** What the company does and for whom, today. */
    mission?: string;
    /** What it is working toward. */
    vision?: string;
    values?: { value: string; means: string }[];
    audience: string;
    personality: string[];
    refuses: string;
    /** Only when the client asked for one. */
    archetype?: string;
  };
  voice?: {
    traits: VoiceTrait[];
    lines: { do: string; dont: string }[];
    rewrites: { before: string; after: string }[];
  };
  marks: Marks;
  colors: BrandColor[];
  /** The print profile `cmyk` values were converted with, such as "Coated FOGRA39L (VIGC 300)". */
  printProfile?: string;
  /** Other arrangements of the palette, such as a day mode beside the default. */
  colorModes?: ColorMode[];
  type: TypeSystem;
  graphicLanguage?: GraphicLanguage;
  imagery?: Imagery;
  photography?: Photography;
  applications?: Application[];
  /** Parts of the book this brand doesn't need, each with the reason. */
  notApplicable?: Partial<Record<Part, string>>;
  reveal: {
    /** Which mark opens the site. */
    mark: "primary" | "symbol" | string;
    /** A squarer mark for phones, when the opening mark is very wide. */
    compactMark?: string;
    /** Color names for the opening field and the mark on it. */
    ground: string;
    ink: string;
  };
};

// --- Checks -----------------------------------------------------------------

function unique(label: string, ids: string[]) {
  const seen = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) throw new Error(`${label}: "${id}" appears twice.`);
    seen.add(id);
  }
}

/** Every citation a strategy can satisfy. */
export function citable(strategy: Strategy): Set<string> {
  const { concept, category, equity } = strategy;
  return new Set([
    "concept.idea",
    "concept.source",
    "category.name",
    ...concept.primitives.map((p) => `concept.primitives.${p.id}`),
    ...category.conventions.map((c) => `category.conventions.${c.id}`),
    ...equity.assets.map((a) => `equity.assets.${a.id}`),
  ]);
}

export function defineStrategy<const S extends Strategy>(strategy: S): S {
  unique("concept.primitives", strategy.concept.primitives.map((p) => p.id));
  unique("category.conventions", strategy.category.conventions.map((c) => c.id));
  unique("equity.assets", strategy.equity.assets.map((a) => a.id));
  if (strategy.concept.primitives.length === 0) throw new Error("concept needs at least one primitive.");
  return strategy;
}

/** The visual choices that must cite the strategy, with a label for errors. */
type VisualChoices = Pick<Brand, "marks" | "colors" | "type">;

function citedChoices({ marks, colors, type }: VisualChoices): [string, Cited][] {
  return [
    ...colors.map((c): [string, Cited] => [`colors.${c.name}`, c]),
    ["marks.primary", marks.primary],
    ...(marks.symbol ? [["marks.symbol", marks.symbol] as [string, Cited]] : []),
    ...(marks.alternates ?? []).map((m): [string, Cited] => [`marks.${m.file}`, m]),
    ["type.display", type.display],
    ["type.text", type.text],
    ...(type.mono ? [["type.mono", type.mono] as [string, Cited]] : []),
    ["type.scale", type.scale],
    ...(type.wordmark ? [["type.wordmark", type.wordmark] as [string, Cited]] : []),
  ];
}

/**
 * The structural checks a brand and a route share: citations resolve, color
 * proportions sum to 100, every color pairing passes contrast, and the scale
 * only uses faces that exist. Returns the problems instead of throwing, so a
 * route checker can list them all.
 */
export function problems(label: string, strategy: Strategy, choices: VisualChoices): string[] {
  const out: string[] = [];
  const valid = citable(strategy);
  for (const [where, choice] of citedChoices(choices)) {
    if (choice.cites.length === 0) out.push(`${where} cites nothing.`);
    for (const cite of choice.cites) {
      if (!valid.has(cite)) out.push(`${where} cites "${cite}", which is not in the strategy.`);
    }
  }

  const { colors, type } = choices;
  unique(`${label} colors`, colors.map((c) => c.name));
  const total = colors.reduce((sum, color) => sum + color.proportion, 0);
  if (Math.round(total) !== 100) out.push(`color proportions sum to ${total}, not 100.`);
  for (const role of ["ground", "ink"] as const) {
    if (!colors.some((color) => color.role === role)) out.push(`needs at least one "${role}" color.`);
  }
  for (const color of colors) {
    for (const pair of color.pairs ?? []) {
      const on = colors.find((c) => c.name === pair.on);
      if (!on) {
        out.push(`colors.${color.name} pairs with "${pair.on}", which is not a color.`);
        continue;
      }
      const ratio = contrast(color.hex, on.hex);
      if (ratio < minimumContrast[pair.as]) {
        out.push(
          `${color.name} on ${on.name} is ${ratio.toFixed(2)}:1, under the ${minimumContrast[pair.as]}:1 needed for ${pair.as}.`,
        );
      }
    }
  }

  unique(`${label} type.scale`, type.scale.steps.map((s) => s.id));
  for (const step of type.scale.steps) {
    const face = type[step.face];
    if (!face) out.push(`type.scale.${step.id} uses the ${step.face} face, which the brand doesn't have.`);
    else if (!face.weights.includes(step.weight)) {
      out.push(`type.scale.${step.id} uses weight ${step.weight}; ${face.family} is listed with ${face.weights.join(", ")}.`);
    }
  }
  return out.map((problem) => `${label}: ${problem}`);
}

/**
 * Checks for the parts a route doesn't have: the colors that mark grounds,
 * modes and applications name exist and pass contrast, mode proportions sum to
 * 100, and graphic elements and photography cite the strategy.
 */
function bookProblems(brand: Brand): string[] {
  const out: string[] = [];
  const color = (where: string, name: string) => {
    const found = brand.colors.find((c) => c.name === name);
    if (!found) out.push(`${where} uses "${name}", which is not a color.`);
    return found;
  };

  for (const { name } of brand.category.identities ?? []) {
    if (!brand.category.competitors.includes(name)) out.push(`category.identities names "${name}", who is not a competitor.`);
  }

  for (const { ground, ink } of brand.marks.on ?? []) {
    const [g, i] = [color("marks.on", ground), color("marks.on", ink)];
    if (g && i && contrast(g.hex, i.hex) < minimumContrast.graphic) {
      out.push(`marks on ${ground} in ${ink} are ${contrast(g.hex, i.hex).toFixed(2)}:1, under ${minimumContrast.graphic}:1.`);
    }
  }

  for (const mode of brand.colorModes ?? []) {
    const where = `colorModes.${mode.name}`;
    color(where, mode.ground);
    color(where, mode.ink);
    for (const name of Object.keys(mode.proportions)) color(where, name);
    const total = Object.values(mode.proportions).reduce((sum, n) => sum + n, 0);
    if (Math.round(total) !== 100) out.push(`${where} proportions sum to ${total}, not 100.`);
  }

  for (const element of brand.graphicLanguage?.elements ?? []) {
    color(`graphicLanguage.${element.name}`, element.ground);
    color(`graphicLanguage.${element.name}`, element.ink);
  }

  for (const image of brand.imagery?.images ?? []) {
    color(`imagery.${image.name}`, image.ground);
    color(`imagery.${image.name}`, image.ink);
    const { main, second } = brand.imagery!;
    if (image.type !== main && image.type !== second) out.push(`imagery.${image.name} is ${image.type}, not the main or second type.`);
  }

  const valid = citable(brand);
  const cited: [string, Cited][] = [
    ...(brand.graphicLanguage?.elements ?? []).map((e): [string, Cited] => [`graphicLanguage.${e.name}`, e]),
    ...(brand.imagery ? [["imagery", brand.imagery] as [string, Cited]] : []),
    ...(brand.photography ? [["photography", brand.photography] as [string, Cited]] : []),
  ];
  for (const [where, choice] of cited) {
    if (choice.cites.length === 0) out.push(`${where} cites nothing.`);
    for (const cite of choice.cites) {
      if (!valid.has(cite)) out.push(`${where} cites "${cite}", which is not in the strategy.`);
    }
  }

  for (const app of brand.applications ?? []) {
    const where = `applications.${app.kind}`;
    const [ground, ink] = [color(where, app.ground), color(where, app.ink)];
    if (ground && ink && !ink.pairs?.some((p) => p.on === ground.name)) {
      out.push(`${where} sets ${ink.name} on ${ground.name}, a pairing the palette doesn't list.`);
    }
  }
  return out.map((problem) => `${brand.slug}: ${problem}`);
}

export function defineBrand<const B extends Brand>(brand: B): B {
  defineStrategy(brand);
  const found = [...problems(brand.slug, brand, brand), ...bookProblems(brand)];
  for (const key of ["ground", "ink"] as const) {
    if (!brand.colors.some((color) => color.name === brand.reveal[key])) {
      found.push(`${brand.slug}: reveal.${key} "${brand.reveal[key]}" is not a color.`);
    }
  }
  if (found.length) throw new Error(found.join("\n"));
  return brand;
}
