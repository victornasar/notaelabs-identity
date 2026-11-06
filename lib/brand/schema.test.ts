import assert from "node:assert/strict";
import { describe, it } from "node:test";
import okonkwo from "@/brands/okonkwo/brand";
import { citable, problems, type Brand } from "./schema";

// A copy of a real brand to break one thing at a time.
const copy = (): Brand => structuredClone(okonkwo) as Brand;

describe("problems", () => {
  it("finds none in a finished brand", () => {
    assert.deepEqual(problems("okonkwo", okonkwo, okonkwo), []);
  });

  it("catches a citation the strategy doesn't have", () => {
    const brand = copy();
    brand.colors[0]!.cites = ["concept.primitives.neon"];
    assert.match(problems("x", brand, brand).join("\n"), /cites "concept.primitives.neon"/);
  });

  it("catches a choice that cites nothing", () => {
    const brand = copy();
    brand.type.display.cites = [];
    assert.match(problems("x", brand, brand).join("\n"), /type.display cites nothing/);
  });

  it("catches proportions that don't sum to 100", () => {
    const brand = copy();
    brand.colors[0]!.proportion += 10;
    assert.match(problems("x", brand, brand).join("\n"), /sum to 110, not 100/);
  });

  it("catches a listed pairing that fails contrast", () => {
    const brand = copy();
    const stone = brand.colors.find((c) => c.name === "Stone")!;
    stone.pairs = [{ on: "Sodium", as: "text" }];
    assert.match(problems("x", brand, brand).join("\n"), /Stone on Sodium is 2\.\d\d:1, under the 4\.5:1/);
  });

  it("catches a scale step in a weight the face doesn't have", () => {
    const brand = copy();
    brand.type.scale.steps[0]!.weight = 300;
    assert.match(problems("x", brand, brand).join("\n"), /uses weight 300/);
  });
});

describe("citable", () => {
  it("lists every primitive, convention and asset by id", () => {
    const ids = citable(okonkwo);
    assert.ok(ids.has("concept.primitives.pool"));
    assert.ok(ids.has("category.conventions.dark-and-glow"));
    assert.ok(ids.has("equity.assets.sodium"));
    assert.ok(!ids.has("concept.primitives.neon"));
  });
});
