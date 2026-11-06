/**
 * The part of opentype.js the scripts use. The package ships no types, and
 * @types/opentype.js describes v1, so this covers only what is called here.
 */
declare module "opentype.js/dist/opentype.mjs" {
  export type PathCommand =
    | { type: "M" | "L"; x: number; y: number }
    | { type: "C"; x1: number; y1: number; x2: number; y2: number; x: number; y: number }
    | { type: "Q"; x1: number; y1: number; x: number; y: number }
    | { type: "Z" };

  export type RenderOptions = { kerning?: boolean; features?: Record<string, boolean> };

  export interface Glyph {
    advanceWidth: number;
    getPath(x: number, y: number, fontSize: number, options: RenderOptions, font: Font): { commands: PathCommand[] };
  }

  type Names = Record<string, Record<string, string> | undefined>;

  export interface Font {
    unitsPerEm: number;
    defaultRenderOptions: RenderOptions;
    names: Names & { windows?: Names };
    variation?: { set(axes: Record<string, number>): void };
    tables: {
      os2?: { usWeightClass?: number; sCapHeight?: number; sxHeight?: number };
      fvar?: { axes: { tag: string; minValue: number; maxValue: number }[] };
    };
    stringToGlyphs(text: string, options: RenderOptions): Glyph[];
    charToGlyph(char: string): Glyph;
    getKerningValue(left: Glyph, right: Glyph): number;
  }

  export function parse(buffer: ArrayBuffer): Font;
}
