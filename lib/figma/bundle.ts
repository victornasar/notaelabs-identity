/**
 * The Figma bundle: one self-contained file holding everything the plugin in
 * `figma-plugin/` needs to build a brand's Figma file. `pnpm export-figma`
 * writes it; `pnpm check` builds it in memory and checks it, since CI can't
 * open Figma.
 *
 * Values are already in Figma's units (0–1 RGB, percent line height and
 * letter spacing, Figma's text case names), so the plugin only places them.
 */
import { hexToRgb, toOklch, toRgbString } from "../brand/color";
import { faceNames, printNote, roleNames } from "../brand/labels";
import { misuseRule, type Application, type Brand, type ColorRole, type MisuseShow, type TypeStyle } from "../brand/schema";
import { completeness, pageSections, sectionTitle, sections, type SectionId } from "../brand/sections";
import { viewBox } from "../brand/svg";
import { describeStep, stepSample } from "../brand/type";

/** Bumped when the plugin can no longer read an older bundle. */
export const bundleFormat = 2;

/** A font as Figma names it: the family and the style it lists. */
export type FontName = { family: string; style: string };

/** One weight of one face, and the file it comes from. */
export type BundleFont = FontName & {
  face: TypeStyle["face"];
  weight: number;
  /** Repo-relative path of the font file, for the install step. */
  file: string;
};

export type BundleColor = {
  /** Also the Figma variable's name. */
  name: string;
  role: ColorRole;
  hex: string;
  rgb: { r: number; g: number; b: number };
  proportion: number;
  /** The role as the book names it: "Accent". */
  roleName: string;
  /** Where the color belongs, in one line. */
  use: string;
  /** Every notation, as the page's value pills show them. */
  values: { label: string; value: string }[];
  /** The variable's description: every notation, then the print caveat. */
  description: string;
};

export type BundleTextStyle = {
  id: string;
  face: TypeStyle["face"];
  /** Also the Figma text style's name. */
  name: string;
  font: FontName;
  fontSize: number;
  lineHeight: { unit: "PERCENT"; value: number };
  letterSpacing: { unit: "PERCENT"; value: number };
  textCase: "ORIGINAL" | "UPPER" | "LOWER" | "TITLE";
  features: string[];
  description: string;
  /** Its settings in a line, and what it is for. */
  spec: string;
  use: string;
  /** The words it is shown with. */
  sample: string;
};

export type BundleFace = { face: TypeStyle["face"]; kind: string; family: string; role: string; weights: number[] };

export type BundleMark = {
  /** The file name in `marks/`; components are named after `name`. */
  file: string;
  name: string;
  role: "primary" | "symbol" | "alternate";
  svg: string;
  use: string;
  meaning?: string;
};

export type BundleFrame = {
  id: SectionId;
  /** As the page's nav numbers it, such as "02"; empty for the cover. */
  number: string;
  label: string;
  title: string;
  /** What the frame shows, by name, so a check can prove each one exists. */
  uses: { colors: string[]; textStyles: string[]; marks: string[]; device: boolean };
};

/** What the book opens with: who the company is, what it refuses, and the idea it works from. */
export type BundleIntro = {
  positioning: string;
  idea: string;
  mission?: string;
  /** What the category does that the company won't. */
  refuses?: string;
  personality: string[];
  values: { value: string; means: string }[];
};

export type FigmaBundle = {
  format: typeof bundleFormat;
  slug: string;
  name: string;
  edition: string;
  intro: BundleIntro;
  fonts: BundleFont[];
  colors: BundleColor[];
  textStyles: BundleTextStyle[];
  type: { fit: string; faces: BundleFace[] };
  /** The caveat beside print values, when the brand has them. */
  printNote?: string;
  marks: {
    items: BundleMark[];
    /** Each ground and the ink the marks take on it: one component variant each. */
    variants: { ground: string; ink: string }[];
    cover: string;
    /** Things never to do to the marks; `show` says how to draw one. */
    misuse: { rule: string; show?: MisuseShow }[];
  };
  device?: {
    name: string;
    svg: string;
    ground: string;
    ink: string;
    construction: string;
    rules: string[];
    applications: Application[];
  };
  frames: BundleFrame[];
};

/** What the exporter reads from disk for a brand. */
export type BundleFiles = {
  /** File name to SVG source, from `marks/`. */
  marks: Record<string, string>;
  /** File name to SVG source, from `graphics/`. */
  graphics: Record<string, string>;
  /** Every weight the brand's faces use, resolved to Figma's names. */
  fonts: BundleFont[];
};

const textCases: Record<TypeStyle["case"], BundleTextStyle["textCase"]> = {
  sentence: "ORIGINAL",
  "as-written": "ORIGINAL",
  title: "TITLE",
  upper: "UPPER",
  lower: "LOWER",
};

const round = (n: number, places = 4) => Number(n.toFixed(places));
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function colorDescription(brand: Brand, color: Brand["colors"][number]): string {
  const [r, g, b] = hexToRgb(color.hex);
  const values = [
    `HEX ${color.hex.toUpperCase()}`,
    `RGB ${r} ${g} ${b}`,
    color.cmyk && `CMYK ${color.cmyk}`,
    color.pantone && `Pantone ${color.pantone}`,
  ].filter(Boolean);
  const note = brand.printProfile && color.cmyk ? printNote(brand.printProfile) : "";
  return [values.join(" · "), color.use, note].filter(Boolean).join("\n");
}

function frameUses(brand: Brand, id: SectionId, styleIds: string[]): BundleFrame["uses"] {
  const none = { colors: [], textStyles: [], marks: [], device: false };
  switch (id) {
    case "cover":
      return { ...none, marks: [coverFile(brand)] };
    case "marks":
      return {
        ...none,
        colors: [...new Set((brand.marks.on ?? []).flatMap(({ ground, ink }) => [ground, ink]))],
        marks: markList(brand).map((m) => m.file),
      };
    case "color":
      return { ...none, colors: brand.colors.map((c) => c.name) };
    case "type":
      return { ...none, textStyles: styleIds };
    case "imagery":
      return brand.device ? { ...none, colors: [brand.device.ground, brand.device.ink], device: true } : none;
    case "voice":
      return none;
  }
}

function markList(brand: Brand) {
  const { primary, symbol, alternates = [] } = brand.marks;
  return [
    { ...primary, role: "primary" as const },
    ...(symbol ? [{ ...symbol, role: "symbol" as const }] : []),
    ...alternates.map((m) => ({ ...m, role: "alternate" as const })),
  ];
}

/** The cover's mark as a file name: "primary" and "symbol" name a mark, anything else is a file. */
function coverFile(brand: Brand) {
  const { mark } = brand.cover;
  if (mark === "primary") return brand.marks.primary.file;
  if (mark === "symbol") return brand.marks.symbol?.file ?? brand.marks.primary.file;
  return mark;
}

const clean = (svg: string) => svg.replace(/<\?xml[^>]*\?>\s*/, "").trim();

export function buildBundle(brand: Brand, files: BundleFiles): FigmaBundle {
  const fontFor = (step: TypeStyle) => files.fonts.find((f) => f.face === step.face && f.weight === step.weight);

  const textStyles = brand.type.scale.steps.map((step, index): BundleTextStyle => {
    const font = fontFor(step);
    const mobile = step.mobileSize ? ` ${step.mobileSize} px at phone width.` : "";
    return {
      id: step.id,
      face: step.face,
      name: capitalize(step.id),
      // A missing font is reported by `bundleProblems`, not thrown, so every gap is listed at once.
      font: font ? { family: font.family, style: font.style } : { family: "", style: "" },
      fontSize: step.size,
      lineHeight: { unit: "PERCENT", value: round(step.lineHeight * 100, 2) },
      letterSpacing: { unit: "PERCENT", value: round(step.tracking * 100, 2) },
      textCase: textCases[step.case],
      features: step.features ?? [],
      description: `${step.use}${mobile}`,
      spec: describeStep(step),
      use: step.use,
      sample: stepSample(brand, step, index),
    };
  });

  const { device, type, story } = brand;
  const numbers = new Map(pageSections(brand).map((s) => [s.id as SectionId, s.number]));
  const values = (c: Brand["colors"][number]) => [
    { label: "Hex", value: c.hex.toUpperCase() },
    { label: "RGB", value: toRgbString(c.hex) },
    { label: "OKLCH", value: toOklch(c.hex) },
    ...(c.cmyk ? [{ label: "CMYK", value: c.cmyk }] : []),
    ...(c.pantone ? [{ label: "Pantone", value: c.pantone }] : []),
  ];

  return {
    format: bundleFormat,
    slug: brand.slug,
    name: brand.name,
    edition: brand.edition,
    intro: {
      positioning: brand.positioning,
      idea: brand.concept.idea,
      ...(story?.mission ? { mission: story.mission } : {}),
      ...(story?.refuses ? { refuses: story.refuses } : {}),
      personality: story?.personality ?? [],
      values: story?.values ?? [],
    },
    fonts: files.fonts,
    colors: brand.colors.map((c) => {
      const [r, g, b] = hexToRgb(c.hex);
      return {
        name: c.name,
        role: c.role,
        hex: c.hex.toUpperCase(),
        rgb: { r: round(r / 255), g: round(g / 255), b: round(b / 255) },
        proportion: c.proportion,
        roleName: roleNames[c.role],
        use: c.use,
        values: values(c),
        description: colorDescription(brand, c),
      };
    }),
    textStyles,
    type: {
      fit: type.fit ?? "",
      faces: (["display", "text", "mono"] as const).flatMap((face) => {
        const spec = type[face];
        return spec ? [{ face, kind: faceNames[face], family: spec.family, role: spec.role, weights: spec.weights }] : [];
      }),
    },
    ...(brand.printProfile && brand.colors.some((c) => c.cmyk) ? { printNote: printNote(brand.printProfile) } : {}),
    marks: {
      items: markList(brand).map((m) => ({
        file: m.file,
        name: m.name,
        role: m.role,
        svg: clean(files.marks[m.file] ?? ""),
        use: m.use,
        ...(m.meaning ? { meaning: m.meaning } : {}),
      })),
      variants: brand.marks.on ?? [],
      cover: coverFile(brand),
      misuse: (brand.marks.misuse ?? []).map((m) => (typeof m === "string" ? { rule: misuseRule(m) } : m)),
    },
    ...(device
      ? {
          device: {
            name: device.name,
            svg: clean(files.graphics[device.file] ?? ""),
            ground: device.ground,
            ink: device.ink,
            construction: device.construction,
            rules: device.rules,
            applications: device.applications,
          },
        }
      : {}),
    frames: sections
      .filter((s) => s.has(brand))
      .map((s) => ({
        id: s.id,
        number: numbers.get(s.id) ?? "",
        label: s.label,
        title: sectionTitle(brand, s.id),
        uses: frameUses(brand, s.id, textStyles.map((t) => t.id)),
      })),
  };
}

function svgProblem(svg: string): string | null {
  if (!svg) return "is empty or missing";
  if (!/^<svg[\s>]/.test(svg) || !svg.endsWith("</svg>")) return "is not a single <svg> element";
  try {
    viewBox(svg);
  } catch {
    return "has no usable viewBox";
  }
  if (!/<(path|rect|polygon|circle|ellipse|line|polyline)[\s/>]/.test(svg)) return "draws nothing";
  return null;
}

/**
 * Everything that would stop the plugin halfway: a section without a frame, a
 * frame naming a color, style or mark the bundle lacks, a text style without
 * its font, or an SVG Figma can't import. Empty when the bundle is sound.
 */
export function bundleProblems(bundle: FigmaBundle, brand: Brand): string[] {
  const out: string[] = [];
  if (bundle.format !== bundleFormat) out.push(`format is ${bundle.format}, not ${bundleFormat}.`);

  const colors = new Set(bundle.colors.map((c) => c.name));
  const styles = new Set(bundle.textStyles.map((t) => t.id));
  const marks = new Set(bundle.marks.items.map((m) => m.file));
  const fonts = new Set(bundle.fonts.map((f) => `${f.family}/${f.style}`));

  for (const entry of completeness(brand)) {
    if (entry.status !== "not applicable" && !bundle.frames.some((f) => f.id === entry.id)) {
      out.push(`section ${entry.id} has no frame.`);
    }
  }
  for (const color of brand.colors) if (!colors.has(color.name)) out.push(`color ${color.name} has no variable.`);
  for (const step of brand.type.scale.steps) if (!styles.has(step.id)) out.push(`type step ${step.id} has no text style.`);

  for (const style of bundle.textStyles) {
    if (!fonts.has(`${style.font.family}/${style.font.style}`)) {
      const step = brand.type.scale.steps.find((s) => s.id === style.id);
      out.push(`text style ${style.name} needs ${step?.face} weight ${step?.weight}, which no font file in the brand provides.`);
    }
  }

  for (const frame of bundle.frames) {
    for (const name of frame.uses.colors) if (!colors.has(name)) out.push(`frame ${frame.id} uses color "${name}", which has no variable.`);
    for (const id of frame.uses.textStyles) if (!styles.has(id)) out.push(`frame ${frame.id} uses text style "${id}", which doesn't exist.`);
    for (const file of frame.uses.marks) if (!marks.has(file)) out.push(`frame ${frame.id} uses mark ${file}, which isn't a mark.`);
    if (frame.uses.device && !bundle.device) out.push(`frame ${frame.id} uses the device, which the bundle lacks.`);
  }

  for (const { ground, ink } of bundle.marks.variants) {
    for (const name of [ground, ink]) if (!colors.has(name)) out.push(`mark variant ${ground}/${ink} uses "${name}", which has no variable.`);
  }

  for (const mark of bundle.marks.items) {
    const problem = svgProblem(mark.svg);
    if (problem) out.push(`mark ${mark.file} ${problem}.`);
  }
  if (bundle.device) {
    const problem = svgProblem(bundle.device.svg);
    if (problem) out.push(`device ${bundle.device.name} ${problem}.`);
  }
  return out;
}
