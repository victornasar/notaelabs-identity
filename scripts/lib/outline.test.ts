import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { bounds, mapPoints, moveBy, pathData, shapes, toSvg } from "./outline";

describe("outline", () => {
  it("moves every point of every command type", () => {
    const moved = moveBy(
      [
        { type: "M", x: 0, y: 0 },
        { type: "Q", x1: 1, y1: 1, x: 2, y: 0 },
        { type: "C", x1: 3, y1: 1, x2: 4, y2: 1, x: 5, y: 0 },
        { type: "Z" },
      ],
      10,
      5,
    );
    assert.deepEqual(moved, [
      { type: "M", x: 10, y: 5 },
      { type: "Q", x1: 11, y1: 6, x: 12, y: 5 },
      { type: "C", x1: 13, y1: 6, x2: 14, y2: 6, x: 15, y: 5 },
      { type: "Z" },
    ]);
  });

  it("leaves the input untouched", () => {
    const rect = shapes.rect(0, 0, 2, 2);
    mapPoints(rect, ([x, y]) => [x * 2, y * 2]);
    assert.deepEqual(rect, shapes.rect(0, 0, 2, 2));
  });

  it("measures the box around all points", () => {
    assert.deepEqual(bounds(shapes.circle(10, 10, 5)), { x1: 5, y1: 5, x2: 15, y2: 15 });
  });

  it("writes quadratics as cubics, so a mark has one curve type", () => {
    assert.equal(pathData([{ type: "M", x: 0, y: 0 }, { type: "Q", x1: 3, y1: 3, x: 6, y: 0 }]), "M0 0C2 2 4 2 6 0");
  });

  it("crops the SVG to the artwork", () => {
    const svg = toSvg([shapes.rect(100, 50, 20, 10)]);
    assert.match(svg, /viewBox="0 0 20 10"/);
    assert.match(svg, /d="M0 0L20 0L20 10L0 10Z"/);
  });
});
