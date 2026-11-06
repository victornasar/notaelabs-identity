/**
 * What the plugin builds for the Foundations page, worked out from the bundle
 * without touching Figma, so it can be tested: the fonts to load, the color
 * variables, the text styles, and the swatches and specimens that show them.
 * `figma-plugin/src/code.ts` only carries this out.
 */
import { bestOn } from "../brand/color";
import type { BundleFont, BundleTextStyle, FigmaBundle, FontName } from "./bundle";

/** The variable collection every brand color lives in. */
export const collectionName = "Colors";
export const pageName = "Foundations";

/** The board's width, and its padding on each side. */
export const board = { width: 1920, padding: 120 };

export type Swatch = { color: string; ink: string; width: number; lines: string[] };
export type Specimen = { style: string; ink: string; sample: string; caption: string };

export type FoundationsPlan = {
  fonts: FontName[];
  variables: { name: string; rgb: { r: number; g: number; b: number }; description: string }[];
  textStyles: Omit<BundleTextStyle, "id" | "face" | "features">[];
  /** Color names: the board's field and its type. */
  ground: string;
  ink: string;
  /** Text style names. */
  heading: string;
  label: string;
  swatches: Swatch[];
  specimens: Specimen[];
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

export function foundationsPlan(bundle: FigmaBundle): FoundationsPlan {
  const { colors, textStyles } = bundle;
  const named = (role: string) => colors.find((c) => c.role === role) ?? colors[0]!;
  const ground = named("ground");
  const ink = named("ink");
  const nameOf = (hex: string) => colors.find((c) => c.hex === hex)!.name;
  const hexes = colors.map((c) => c.hex);

  const bySize = [...textStyles].sort((a, b) => a.fontSize - b.fontSize);
  // Headings take the largest style that fits a reference page; labels the "label" step, else the smallest.
  const heading = [...bySize].reverse().find((t) => t.fontSize <= 96) ?? bySize[0]!;
  const label = textStyles.find((t) => t.id === "label") ?? bySize[0]!;

  const inner = board.width - board.padding * 2;
  const swatchWidth = Math.floor(inner / colors.length);

  return {
    fonts: bundle.fonts.filter((f, i, all) => all.findIndex((g) => sameFont(f, g)) === i).map(({ family, style }) => ({ family, style })),
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
    heading: heading.name,
    label: label.name,
    swatches: colors.map((c) => ({
      color: c.name,
      ink: nameOf(bestOn(c.hex, hexes)),
      width: swatchWidth,
      lines: [c.name, `${c.role} · ${c.proportion}%`, ...c.description.split("\n")[0]!.split(" · ")],
    })),
    specimens: textStyles.map((t) => ({
      style: t.name,
      ink: ink.name,
      // Display sizes set one word of the name, as the page does; the rest set what they are for.
      sample: t.face === "display" ? bundle.name.split(/[\s-]/)[0]! : t.description,
      caption: [
        t.name,
        `${t.font.family} ${t.font.style}`,
        `${t.fontSize} px / ${t.lineHeight.value}%`,
        `tracking ${t.letterSpacing.value}%`,
      ].join(" · "),
    })),
  };
}
