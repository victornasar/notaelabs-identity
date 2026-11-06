/**
 * What the plugin builds for the Foundations page, worked out from the bundle
 * without touching Figma, so it can be tested: the fonts to load, the color
 * variables, the text styles, and the cards that show them. The cards follow
 * the web page's Color and Type sections, so the file and the page match.
 * `figma-plugin/src/code.ts` only carries this out.
 */
import { bestOn } from "../brand/color";
import type { BundleFont, BundleTextStyle, FigmaBundle, FontName } from "./bundle";

/** The variable collection every brand color lives in. */
export const collectionName = "Colors";
export const pageName = "Foundations";

/** The board matches the page at desktop width: a 1200 px column, 12 px between cards. */
export const layout = { width: 1440, column: 1200, gap: 12, radius: 28, section: 200, swatchHeight: 600, minSwatch: 280 };

/** A fill: a color variable by name, at an opacity for quiet text and hairlines. */
export type Paint = { color: string; opacity?: number };

export type StyleSpec = Pick<BundleTextStyle, "name" | "font" | "fontSize" | "lineHeight" | "letterSpacing" | "textCase" | "description">;

export type SectionHead = { eyebrow: string; title: string; intro: string };

export type SwatchCard = {
  color: string;
  ink: string;
  width: number;
  /** Outlined, because it is the board's own color. */
  edge: boolean;
  role: string;
  name: string;
  use: string;
  pills: { label: string; value: string }[];
};

export type FaceCard = {
  kind: string;
  glyphs: string;
  family: string;
  role: string;
  weights: string;
  /** The face's heaviest weight, which sets its glyphs and name. */
  font: FontName;
  /** The lead card is filled with the accent; the rest are outlined. */
  fill: string | null;
  ink: string;
};

export type ScaleRow = { id: string; spec: string; use: string; style: string; sample: string };

export type FoundationsPlan = {
  fonts: FontName[];
  variables: { name: string; rgb: { r: number; g: number; b: number }; description: string }[];
  textStyles: StyleSpec[];
  /** Color names. */
  ground: string;
  ink: string;
  accent: string;
  /** Text style names, by the job they do on the page. */
  text: { heading: string; body: string; small: string; label: string };
  color: SectionHead & { cards: SwatchCard[]; note?: string };
  type: SectionHead & { faces: FaceCard[]; scale: ScaleRow[] };
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

export function foundationsPlan(bundle: FigmaBundle): FoundationsPlan {
  const { colors, textStyles, fonts, frames } = bundle;
  const byRole = (role: string) => colors.find((c) => c.role === role);
  const ground = byRole("ground") ?? colors[0]!;
  const ink = byRole("ink") ?? colors[1] ?? ground;
  const accent = byRole("accent") ?? ink;
  const nameOf = (hex: string) => colors.find((c) => c.hex === hex)!.name;
  const hexes = colors.map((c) => c.hex);

  // Which style does which job, by size, so a brand's own step names don't matter.
  const bySize = [...textStyles].sort((a, b) => a.fontSize - b.fontSize);
  const plain = bySize.filter((t) => t.textCase === "ORIGINAL");
  const label = textStyles.find((t) => t.id === "label") ?? bySize[0]!;
  // No Array.at: Figma's sandbox may predate it.
  const heading = [...bySize].reverse().find((t) => t.fontSize <= 96) ?? bySize[bySize.length - 1]!;
  const body = textStyles.find((t) => t.id === "body") ?? plain[plain.length - 1] ?? label;
  const small = plain.find((t) => t !== body && t.fontSize < body.fontSize) ?? body;

  const head = (id: string, fallback: string) => {
    const frame = frames.find((f) => f.id === id);
    return { eyebrow: [frame?.number, frame?.label ?? fallback].filter(Boolean).join(" · "), title: frame?.title ?? fallback };
  };

  // Cards run largest share first, as the page does.
  const ordered = [...colors].sort((a, b) => b.proportion - a.proportion);
  const widths = shareWidths(ordered.map((c) => c.proportion), layout.column, layout.gap, layout.minSwatch);

  const heaviest = (face: string) => fonts.filter((f) => f.face === face).sort((a, b) => b.weight - a.weight)[0];

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
    color: {
      ...head("color", "Color"),
      intro: "Each card is as wide as the color’s share of a typical page.",
      cards: ordered.map((c, i) => ({
        color: c.name,
        ink: nameOf(bestOn(c.hex, hexes)),
        width: widths[i]!,
        edge: c.name === ground.name,
        role: `${c.roleName} · ${c.proportion}%`,
        name: c.name,
        use: c.use,
        pills: c.values,
      })),
      ...(bundle.printNote ? { note: bundle.printNote } : {}),
    },
    type: {
      ...head("type", "Type"),
      intro: bundle.type.fit,
      faces: bundle.type.faces.flatMap((face, i) => {
        const font = heaviest(face.face);
        if (!font) return [];
        const upper = textStyles.filter((t) => t.face === face.face).every((t) => t.textCase === "UPPER");
        return [
          {
            kind: face.kind,
            glyphs: upper ? "AG" : "Ag",
            family: upper ? face.family.toUpperCase() : face.family,
            role: face.role,
            weights: `Weights ${face.weights.join(", ")}`,
            font: { family: font.family, style: font.style },
            fill: i === 0 ? accent.name : null,
            ink: i === 0 ? ground.name : ink.name,
          },
        ];
      }),
      scale: textStyles.map((t) => ({ id: t.id, spec: t.spec, use: t.use, style: t.name, sample: t.sample })),
    },
  };
}
