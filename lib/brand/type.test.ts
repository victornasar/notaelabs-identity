import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { describeStep, textTransform } from "./type";

describe("textTransform", () => {
  it("transforms only the cases CSS can set", () => {
    assert.equal(textTransform("upper"), "uppercase");
    assert.equal(textTransform("title"), "capitalize");
    assert.equal(textTransform("sentence"), "none");
    assert.equal(textTransform("as-written"), "none");
  });
});

describe("describeStep", () => {
  it("writes a step as one line, with the phone size when there is one", () => {
    assert.equal(
      describeStep({ id: "display", face: "display", size: 160, mobileSize: 64, lineHeight: 0.88, weight: 800, tracking: 0.01, case: "upper", use: "" }),
      "160 px (64 on phones) / 0.88 · 800 · tracking +0.01 em · Capitals",
    );
  });

  it("writes negative tracking with a real minus and lists features", () => {
    assert.equal(
      describeStep({ id: "figure", face: "text", size: 15, lineHeight: 1.4, weight: 500, tracking: -0.02, case: "as-written", features: ["tnum"], use: "" }),
      "15 px / 1.4 · 500 · tracking −0.02 em · As written · tnum",
    );
  });
});
