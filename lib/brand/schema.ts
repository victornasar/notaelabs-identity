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

export type Category = {
  /** Cited as `category.name`. */
  name: string;
  /** The three competitors named in the interview. */
  competitors: string[];
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

export type Brand = Strategy & {
  slug: string;
  name: string;
  /** Who the guidelines were prepared for, and when. */
  edition: string;
  positioning: string;
  story?: {
    audience: string;
    personality: string[];
    refuses: string;
  };
  voice?: {
    traits: VoiceTrait[];
    lines: { do: string; dont: string }[];
    rewrites: { before: string; after: string }[];
  };
  marks: Marks;
  colors: BrandColor[];
  type: TypeSystem;
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

export function defineBrand<const B extends Brand>(brand: B): B {
  defineStrategy(brand);
  const found = problems(brand.slug, brand, brand);
  for (const key of ["ground", "ink"] as const) {
    if (!brand.colors.some((color) => color.name === brand.reveal[key])) {
      found.push(`${brand.slug}: reveal.${key} "${brand.reveal[key]}" is not a color.`);
    }
  }
  if (found.length) throw new Error(found.join("\n"));
  return brand;
}
