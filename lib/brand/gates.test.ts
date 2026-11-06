import assert from "node:assert/strict";
import { describe, it } from "node:test";
import okonkwo from "@/brands/okonkwo/brand";
import { banProblems, fontProblems } from "./gates";
import type { BrandColor, Strategy } from "./schema";

const color = (name: string, hex: string): BrandColor => ({
  name,
  hex,
  role: "accent",
  proportion: 0,
  cmyk: "",
  oklch: "",
  use: "",
  cites: [],
});

const bannedPalette = [color("Paper", "#F7F5F0"), color("Ink", "#111214"), color("Blue", "#2F5BEA")];
const gradient = '<svg><linearGradient><stop stop-color="#4F46E5"/><stop stop-color="#9333EA"/></linearGradient></svg>';

describe("banProblems", () => {
  it("passes Okonkwo's palette", () => {
    assert.deepEqual(banProblems(okonkwo, okonkwo.colors, []), []);
  });

  it("bans off-white, near-black and saturated blue together", () => {
    assert.match(banProblems(okonkwo, bannedPalette, []).join(), /banned default palette/);
  });

  it("bans a blue-purple gradient in a mark", () => {
    assert.match(banProblems(okonkwo, okonkwo.colors, [gradient]).join(), /blue-purple gradient/);
  });

  it("lets a written override through", () => {
    const strategy: Strategy = {
      ...okonkwo,
      overrides: [
        { rule: "palette-ban", reason: "The client's existing blue", approved: "2026-11-06" },
        { rule: "gradient-ban", reason: "The client's existing gradient", approved: "2026-11-06" },
      ],
    };
    assert.deepEqual(banProblems(strategy, bannedPalette, [gradient]), []);
  });
});

describe("fontProblems", () => {
  it("passes Okonkwo's faces, which are approved, present and unaltered", () => {
    const { display, text, wordmark } = okonkwo.type;
    assert.deepEqual(fontProblems("okonkwo", okonkwo, [display, text, ...(wordmark ? [wordmark] : [])]), []);
  });

  it("refuses a face that isn't in the library", () => {
    const invented = { ...okonkwo.type.display, library: "helvetica-now" };
    assert.match(fontProblems("okonkwo", okonkwo, [invented]).join(), /not in fonts\/library.json/);
  });
});
