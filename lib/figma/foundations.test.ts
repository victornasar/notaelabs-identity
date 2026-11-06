import assert from "node:assert/strict";
import { describe, it } from "node:test";
import okonkwo from "@/brands/okonkwo/brand";
import type { Brand } from "../brand/schema";
import { buildBundle, type BundleFiles } from "./bundle";
import { board, foundationsPlan, missingFonts, nearFonts } from "./foundations";

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

describe("foundationsPlan", () => {
  it("loads each font once", () => {
    assert.deepEqual(plan.fonts.map((f) => `${f.family} ${f.style}`), ["Big Shoulders ExtraBold", "Chivo Regular", "Chivo Medium"]);
  });

  it("sets the board in the ground color, with type in the ink", () => {
    assert.equal(plan.ground, "Night");
    assert.equal(plan.ink, "Stone");
  });

  it("heads with the largest style that fits, and labels with the label step", () => {
    assert.equal(plan.heading, "Title");
    assert.equal(plan.label, "Label");
  });

  it("fits the swatches inside the board, each labelled in its most legible color", () => {
    const inner = board.width - board.padding * 2;
    assert.ok(plan.swatches.reduce((sum, s) => sum + s.width, 0) <= inner);
    assert.equal(plan.swatches.find((s) => s.color === "Sodium")?.ink, "Night");
    assert.deepEqual(plan.swatches.filter((s) => s.edge).map((s) => s.color), ["Night"]);
    assert.deepEqual(plan.swatches.find((s) => s.color === "Sodium")?.lines.slice(0, 3), ["Sodium", "accent · 28%", "HEX #FF5A1F"]);
  });

  it("keeps OpenType features in the style's description, since Figma styles can't hold them", () => {
    assert.match(plan.textStyles.find((t) => t.name === "Figure")?.description ?? "", /OpenType: tnum\./);
  });
});
