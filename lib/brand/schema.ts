/**
 * The shape of a brand. Every client lives in `brands/<slug>/brand.ts` and
 * exports `defineBrand({...})`. The shell renders only from this data.
 */

export type ColorRole = "ground" | "ink" | "accent" | "support";

export type BrandColor = {
  name: string;
  role: ColorRole;
  /** Share of a typical layout, in percent. All colors should sum to 100. */
  proportion: number;
  hex: string;
  cmyk?: string;
  pantone?: string;
  /** One line on where the color belongs. */
  use: string;
};

export type BrandMark = {
  /** File name inside `brands/<slug>/marks/`. Single-color SVG. */
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

export type Typeface = {
  family: string;
  /** Where it is used, in one line. */
  role: string;
  source: string;
};

export type VoiceTrait = { trait: string; means: string; doesNotMean: string };

export type Brand = {
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
  type: {
    display: Typeface;
    text: Typeface;
  };
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

export function defineBrand<const B extends Brand>(brand: B): B {
  const total = brand.colors.reduce((sum, color) => sum + color.proportion, 0);
  if (Math.round(total) !== 100) {
    throw new Error(`${brand.slug}: color proportions sum to ${total}, not 100.`);
  }
  for (const role of ["ground", "ink"] as const) {
    if (!brand.colors.some((color) => color.role === role)) {
      throw new Error(`${brand.slug}: needs at least one "${role}" color.`);
    }
  }
  for (const key of ["ground", "ink"] as const) {
    if (!brand.colors.some((color) => color.name === brand.reveal[key])) {
      throw new Error(`${brand.slug}: reveal.${key} "${brand.reveal[key]}" is not a color.`);
    }
  }
  return brand;
}
