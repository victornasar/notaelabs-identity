import assert from "node:assert/strict";
import { describe, it } from "node:test";
import okonkwo from "@/brands/okonkwo/brand";
import { bestOn, contrast, hexToRgb, oklch, oklchToHex, toOklch, toRgbString, wcagLevel } from "./color";

describe("hexToRgb", () => {
  it("reads six and three digits, with or without #", () => {
    assert.deepEqual(hexToRgb("#FF5A1F"), [255, 90, 31]);
    assert.deepEqual(hexToRgb("fff"), [255, 255, 255]);
  });

  it("refuses anything that isn't hex", () => {
    assert.throws(() => hexToRgb("#12345"), /Not a hex color/);
    assert.throws(() => hexToRgb("orange"), /Not a hex color/);
  });
});

describe("contrast", () => {
  it("spans 1:1 to 21:1 and doesn't care about order", () => {
    assert.equal(contrast("#000", "#fff"), 21);
    assert.equal(contrast("#777", "#777"), 1);
    assert.equal(contrast("#18120F", "#ECE3D6"), contrast("#ECE3D6", "#18120F"));
  });

  it("grades by WCAG thresholds", () => {
    assert.equal(wcagLevel(7), "AAA");
    assert.equal(wcagLevel(4.5), "AA");
    assert.equal(wcagLevel(3), "AA Large");
    assert.equal(wcagLevel(2.99), null);
  });
});

describe("OKLCH", () => {
  it("matches what Okonkwo's palette records for each color", () => {
    for (const color of okonkwo.colors) {
      const recorded = color.oklch.match(/[\d.]+/g)!.map(Number);
      const { l, c, h } = oklch(color.hex);
      // brand.ts records a rounded value; it must agree to that rounding.
      assert.ok(Math.abs(l * 100 - recorded[0]!) < 0.6, `${color.name} lightness`);
      assert.ok(Math.abs(c - recorded[1]!) < 0.003, `${color.name} chroma`);
      assert.ok(Math.abs(h - recorded[2]!) < 2.5, `${color.name} hue`);
    }
  });

  it("round-trips through hex", () => {
    for (const hex of ["#FF5A1F", "#18120F", "#ECE3D6", "#3366CC"]) {
      assert.equal(oklchToHex(toOklch(hex)).hex, hex);
    }
  });

  it("flags colors sRGB can't show", () => {
    assert.equal(oklchToHex("60% 0.4 150").inGamut, false);
    assert.equal(oklchToHex("oklch(50% 0.05 50)").inGamut, true);
  });

  it("refuses a malformed value", () => {
    assert.throws(() => oklchToHex("60% 0.1"), /Not an OKLCH color/);
  });
});

describe("helpers", () => {
  it("writes rgb() in the modern space-separated form", () => {
    assert.equal(toRgbString("#FF5A1F"), "rgb(255 90 31)");
  });

  it("picks the candidate with the most contrast", () => {
    assert.equal(bestOn("#FF5A1F", ["#18120F", "#ECE3D6"]), "#18120F");
    assert.equal(bestOn("#18120F", ["#FF5A1F", "#ECE3D6"]), "#ECE3D6");
  });
});
