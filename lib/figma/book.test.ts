import assert from "node:assert/strict";
import { describe, it } from "node:test";
import okonkwo from "@/brands/okonkwo/brand";
import type { Brand } from "../brand/schema";
import { buildBundle, type BundleFiles } from "./bundle";
import { bookPlan, column, layout, missingFonts, nearFonts, shareWidths } from "./book";

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
const plan = bookPlan(bundle);

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

describe("bookPlan", () => {
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

  it("sizes swatch cards by share, largest first, within the frame's margins", () => {
    const { cards } = plan.palette;
    assert.deepEqual(cards.map((c) => c.name), ["Night", "Sodium", "Stone"]);
    const used = cards.reduce((sum, c) => sum + c.width, 0) + layout.gap * (cards.length - 1);
    assert.ok(used <= column && used > column - cards.length);
    assert.ok(cards.every((c) => c.width >= layout.minSwatch));
  });

  it("labels each swatch in its most legible color, and outlines the board's own", () => {
    const sodium = plan.palette.cards.find((c) => c.name === "Sodium");
    assert.equal(sodium?.ink, "Night");
    assert.equal(sodium?.role, "Accent · 28%");
    assert.deepEqual(sodium?.pills.map((p) => p.label), ["Hex", "RGB", "OKLCH", "CMYK", "Pantone"]);
    assert.deepEqual(plan.palette.cards.filter((c) => c.edge).map((c) => c.name), ["Night"]);
  });

  it("leads the faces with an accent card set in the face's heaviest weight", () => {
    const [display, text] = plan.faces;
    assert.deepEqual([display?.glyphs, display?.family, display?.fill, display?.ink], ["AG", "BIG SHOULDERS", "Sodium", "Night"]);
    assert.deepEqual(text?.font, { family: "Chivo", style: "Medium" });
    assert.equal(text?.fill, null);
  });

  it("follows the outline, drawing only the sections the brand has, numbered without gaps", () => {
    const names = plan.sections.map((s) => [s.divider.name, ...s.frames.map((f) => f.name)]);
    assert.deepEqual(names, [
      ["Cover", "01.1 Introduction · Overview", "01.2 Introduction · What we refuse", "01.3 Introduction · The idea"],
      ["02 Logo", "02.1 Logo · Logo mark", "02.2 Logo · On Stone", "02.3 Logo · On Sodium", "02.4 Logo · On Night"],
      ["03 Color", "03.1 Color · Palette"],
      ["04 Typography", "04.1 Typography · Typefaces", "04.2 Typography · Scale"],
      ["05 Visual Language", "05.1 Visual Language · Pool row"],
    ]);
    assert.deepEqual(
      plan.sections.flatMap((s) => s.frames.map((f) => f.page)),
      ["02", "03", "04", "06", "07", "08", "09", "11", "13", "14", "16"],
    );
    assert.equal(plan.sections[2]?.frames[0]?.eyebrow, "03 · Color · Palette");
    assert.deepEqual(plan.display, { font: { family: "Big Shoulders", style: "ExtraBold" }, upper: true });
  });

  it("shows the lockup on each approved ground, lightest first, with the accent eyebrow only on the brand's own", () => {
    const lockups = plan.sections.flatMap((s) => s.frames).filter((f) => f.kind === "lockup");
    assert.deepEqual(
      lockups.map((f) => [f.ground, f.ink, f.tint]),
      [
        ["Stone", "Night", "Night"],
        ["Sodium", "Night", "Night"],
        ["Night", "Stone", "Sodium"],
      ],
    );
  });

  it("opens on the cover in place of a divider, then says what the brand refuses before its idea", () => {
    assert.equal(plan.sections[0]?.divider.cover, true);
    assert.ok(plan.sections.slice(1).every((s) => !s.divider.cover));
    assert.equal(plan.cover.edition, "Brand guidelines · Edition 2 · November 2026");
    assert.deepEqual(plan.statement, { family: "Chivo", style: "Regular" });
    assert.deepEqual(plan.intro.refuses, [
      "Facades that change color every few seconds, so the building disappears behind the show.",
      "Spec sheets with a logo on them, selling fittings when clients are buying judgment.",
      "Darkness treated as a failure, so every surface is lit and nothing stands out.",
    ]);
    assert.match(plan.intro.idea, /^Good night light comes in measured pools/);
  });

  it("leaves out the refusals frame for a brand that names none", () => {
    const bare = structuredClone(brand);
    bare.story!.refuses = "";
    const parts = bookPlan(buildBundle(bare, files)).sections[0]!.frames.map((f) => f.kind);
    assert.deepEqual(parts, ["overview", "idea"]);
  });

  it("draws the symbol in the accent, captioned with what it represents", () => {
    assert.equal(plan.logo.symbol.name, "Lamp");
    assert.equal(plan.logo.symbol.ink, "Sodium");
    assert.match(plan.logo.symbol.caption, /^A streetlamp seen side on/);
    assert.equal(plan.device?.ink, "Sodium");
  });

  it("keeps frames to labels and values, with one line on print", () => {
    assert.equal(plan.palette.note, "CMYK and Pantone are approximate. Proof before print.");
    assert.equal(plan.scale[0]?.sample, "Okonkwo");
    assert.ok(!("use" in plan.palette.cards[0]!));
  });

  it("keeps OpenType features in the style's description, since Figma styles can't hold them", () => {
    assert.match(plan.textStyles.find((t) => t.name === "Figure")?.description ?? "", /OpenType: tnum\./);
  });
});
