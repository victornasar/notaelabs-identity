import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { aspect, viewBox } from "./svg";

describe("viewBox", () => {
  it("reads space- or comma-separated values", () => {
    assert.deepEqual(viewBox('<svg viewBox="0 300 2400 300">'), { x: 0, y: 300, w: 2400, h: 300 });
    assert.deepEqual(viewBox('<svg viewBox="0,0,20,10">'), { x: 0, y: 0, w: 20, h: 10 });
  });

  it("refuses an SVG without a usable one", () => {
    assert.throws(() => viewBox("<svg>"), /no usable viewBox/);
    assert.throws(() => viewBox('<svg viewBox="0 0 20">'), /no usable viewBox/);
  });

  it("gives width over height", () => {
    assert.equal(aspect('<svg viewBox="0 0 20 10">'), 2);
  });
});
