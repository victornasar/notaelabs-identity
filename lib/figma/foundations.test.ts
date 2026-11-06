import assert from "node:assert/strict";
import { describe, it } from "node:test";
import okonkwo from "@/brands/okonkwo/brand";
import type { Brand } from "../brand/schema";
import { buildBundle, type BundleFiles } from "./bundle";
import { foundationsPlan, layout, missingFonts, nearFonts, shareWidths } from "./foundations";

const brand = structuredClone(okonkwo) as Brand;
const files: BundleFiles = {
  marks: {},
  graphics: {},
  fonts: [
    { face: "display", weight: 800, family: "Big Shoulders", style: "ExtraBold", file: "a.ttf" },
    { face: "text", weight: 400, family: "Chivo", style: "Regular", file: "b.ttf" },
    { face: "text", weight: 500, family: "Chivo", style: "Medium", file: "b.ttf" },
  ],
};
const bundle = buildBundle(brand, files);
const plan = foundationsPlan(bundle);

describe("missingFonts", () => {
  it("lists only the family and style Figma doesn't have", () => {
    const missing = missingFonts(bundle, [
      { family: "Chivo", style: "Regular" },
      { family: "Chivo", style: "Medium" },
      { family: "Big Shoulders", style: "Bold" },
    ]);
    assert.deepEqual(missing.map((f) => `${f.family} ${f.style}`), ["Big Shoulders ExtraBold"]);
  });
});

describe("nearFonts", () => {
  it("names what Figma has under the same first word, with its styles", () => {
    const near = nearFonts({ family: "Big Shoulders", style: "ExtraBold" }, [
      { family: "Big Shoulders Display", style: "Bold" },
      { family: "Big Shoulders Display", style: "ExtraBold" },
      { family: "Chivo", style: "Regular" },
    ]);
    assert.deepEqual(near, ["Big Shoulders Display: Bold, ExtraBold"]);
  });
});

describe("shareWidths", () => {
  it("gives a share too small for its labels the minimum, and the rest what's left", () => {
    assert.deepEqual(shareWidths([56, 28, 16], 1200, 12, 280), [597, 298, 280]);
  });
});

describe("foundationsPlan", () => {
  it("loads each font once", () => {
    assert.deepEqual(plan.fonts.map((f) => `${f.family} ${f.style}`), ["Big Shoulders ExtraBold", "Chivo Regular", "Chivo Medium"]);
  });

  it("sets the board in the ground color, with type in the ink", () => {
    assert.equal(plan.ground, "Night");
    assert.equal(plan.ink, "Stone");
  });

  it("gives each job the style the page uses for it", () => {
    assert.deepEqual(plan.text, { heading: "Title", body: "Body", small: "Figure", label: "Label" });
  });

  it("sizes swatch cards by share, largest first, within the column", () => {
    const { cards } = plan.color;
    assert.deepEqual(cards.map((c) => c.name), ["Night", "Sodium", "Stone"]);
    const used = cards.reduce((sum, c) => sum + c.width, 0) + layout.gap * (cards.length - 1);
    assert.ok(used <= layout.column && used > layout.column - cards.length);
    assert.ok(cards.every((c) => c.width >= layout.minSwatch));
  });

  it("labels each swatch in its most legible color, and outlines the board's own", () => {
    const sodium = plan.color.cards.find((c) => c.name === "Sodium");
    assert.equal(sodium?.ink, "Night");
    assert.equal(sodium?.role, "Accent · 28%");
    assert.deepEqual(sodium?.pills.map((p) => p.label), ["Hex", "RGB", "OKLCH", "CMYK", "Pantone"]);
    assert.deepEqual(plan.color.cards.filter((c) => c.edge).map((c) => c.name), ["Night"]);
  });

  it("leads the faces with an accent card set in the face's heaviest weight", () => {
    const [display, text] = plan.type.faces;
    assert.deepEqual([display?.glyphs, display?.family, display?.fill, display?.ink], ["AG", "BIG SHOULDERS", "Sodium", "Night"]);
    assert.deepEqual(text?.font, { family: "Chivo", style: "Medium" });
    assert.equal(text?.fill, null);
  });

  it("titles sections as the page does", () => {
    assert.equal(plan.color.eyebrow, "02 · Color");
    assert.equal(plan.color.title, "Three colors. Night carries the page.");
    assert.equal(plan.type.scale[0]?.sample, "Okonkwo");
  });

  it("keeps OpenType features in the style's description, since Figma styles can't hold them", () => {
    assert.match(plan.textStyles.find((t) => t.name === "Figure")?.description ?? "", /OpenType: tnum\./);
  });
});
