import assert from "node:assert/strict";
import { describe, it } from "node:test";
import okonkwo from "@/brands/okonkwo/brand";
import type { Brand } from "./schema";
import { completeness, pageSections, sections } from "./sections";

const copy = (): Brand => structuredClone(okonkwo) as Brand;
const report = (brand: Brand, id: string) => completeness(brand).find((r) => r.id === id);

describe("completeness", () => {
  it("finds Okonkwo complete in every section", () => {
    for (const entry of completeness(okonkwo)) assert.equal(entry.status, "complete", entry.id);
  });

  it("lists what a required section lacks", () => {
    const brand = copy();
    brand.type.fit = "";
    const type = report(brand, "type");
    assert.ok(type?.status === "missing" && type.missing.some((m) => m.startsWith("type.fit")));
  });

  it("calls an optional section left out without a reason missing", () => {
    const brand = copy();
    delete brand.voice;
    assert.equal(report(brand, "voice")?.status, "missing");
  });

  it("accepts an optional section left out with a reason, and refuses a blank one", () => {
    const brand = copy();
    delete brand.device;
    brand.notApplicable = { imagery: "The client uses photography only." };
    assert.equal(report(brand, "imagery")?.status, "not applicable");

    brand.notApplicable = { imagery: "  " };
    assert.equal(report(brand, "imagery")?.status, "missing");
  });

  it("refuses a reason for a section the brand has", () => {
    const brand = copy();
    brand.notApplicable = { voice: "No copy." };
    assert.equal(report(brand, "voice")?.status, "missing");
  });

  it("doesn't require a symbol, but wants one that exists explained", () => {
    const brand = copy();
    delete brand.marks.symbol;
    assert.equal(report(brand, "marks")?.status, "complete");
  });
});

describe("pageSections", () => {
  it("numbers the nav sections in order, without the cover", () => {
    assert.deepEqual(
      pageSections(okonkwo).map((s) => `${s.number} ${s.label}`),
      ["01 Marks", "02 Color", "03 Type", "04 Imagery", "05 Voice"],
    );
  });

  it("leaves out a section the brand doesn't have and renumbers", () => {
    const brand = copy();
    delete brand.device;
    assert.deepEqual(
      pageSections(brand).map((s) => s.id),
      ["marks", "color", "type", "voice"],
    );
    assert.equal(pageSections(brand).at(-1)?.number, "04");
  });

  it("only lets optional sections be left out", () => {
    for (const s of sections) assert.equal(s.optional, s.id === "imagery" || s.id === "voice", s.id);
  });
});
