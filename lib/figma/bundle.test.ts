import assert from "node:assert/strict";
import { describe, it } from "node:test";
import okonkwo from "@/brands/okonkwo/brand";
import type { Brand } from "../brand/schema";
import { buildBundle, bundleProblems, type BundleFiles } from "./bundle";

const copy = (): Brand => structuredClone(okonkwo) as Brand;
const svg = '<svg viewBox="0 0 10 10"><path d="M0 0h10v10z"/></svg>';

const files = (brand: Brand): BundleFiles => ({
  marks: Object.fromEntries([brand.marks.primary, brand.marks.symbol, ...(brand.marks.alternates ?? [])].flatMap((m) => (m ? [[m.file, svg]] : []))),
  graphics: brand.device ? { [brand.device.file]: svg } : {},
  fonts: brand.type.scale.steps.map((s) => ({ face: s.face, weight: s.weight, family: `${s.face} family`, style: `W${s.weight}`, file: "x.ttf" })),
});

const problemsOf = (brand: Brand, change: (f: BundleFiles) => void = () => {}) => {
  const f = files(brand);
  change(f);
  return bundleProblems(buildBundle(brand, f), brand);
};

describe("buildBundle", () => {
  it("finds Okonkwo sound, with a frame for every section", () => {
    const brand = copy();
    assert.deepEqual(problemsOf(brand), []);
    const bundle = buildBundle(brand, files(brand));
    assert.deepEqual(bundle.frames.map((f) => f.id), ["cover", "marks", "color", "type", "imagery", "voice"]);
  });

  it("puts values in Figma's units", () => {
    const brand = copy();
    const bundle = buildBundle(brand, files(brand));
    const sodium = bundle.colors.find((c) => c.name === "Sodium");
    assert.deepEqual(sodium?.rgb, { r: 1, g: 0.3529, b: 0.1216 });
    assert.match(sodium?.description ?? "", /Pantone Orange 021 C/);
    assert.match(sodium?.description ?? "", /proof before print/);

    const display = bundle.textStyles.find((t) => t.id === "display");
    assert.deepEqual(display?.lineHeight, { unit: "PERCENT", value: 88 });
    assert.deepEqual(display?.letterSpacing, { unit: "PERCENT", value: 1 });
    assert.equal(display?.textCase, "UPPER");
  });

  it("leaves out a section the brand doesn't apply, without calling it missing", () => {
    const brand = copy();
    delete brand.device;
    brand.notApplicable = { imagery: "Photography only." };
    assert.deepEqual(problemsOf(brand), []);
    assert.ok(!buildBundle(brand, files(brand)).frames.some((f) => f.id === "imagery"));
  });
});

describe("bundleProblems", () => {
  it("names a section with no frame", () => {
    const brand = copy();
    delete brand.voice;
    assert.ok(problemsOf(brand).includes("section voice has no frame."));
  });

  it("names a text style whose font weight is missing", () => {
    const brand = copy();
    const problems = problemsOf(brand, (f) => {
      f.fonts = f.fonts.filter((font) => font.face !== "display");
    });
    assert.ok(problems.some((p) => p.startsWith("text style Display needs display weight 800")));
  });

  it("names a mark variant on a color that doesn't exist", () => {
    const brand = copy();
    brand.marks.on = [...(brand.marks.on ?? []), { ground: "Dusk", ink: "Stone" }];
    assert.ok(problemsOf(brand).some((p) => p.includes('uses "Dusk"')));
  });

  it("names a mark that is missing or not an SVG Figma can import", () => {
    const brand = copy();
    const missing = problemsOf(brand, (f) => {
      f.marks = {};
    });
    assert.ok(missing.includes("mark wordmark.svg is empty or missing."));

    const unboxed = problemsOf(brand, (f) => {
      f.marks["symbol.svg"] = '<svg><path d="M0 0"/></svg>';
    });
    assert.ok(unboxed.includes("mark symbol.svg has no usable viewBox."));
  });
});
