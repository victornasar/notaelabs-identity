import assert from "node:assert/strict";
import { describe, it } from "node:test";
import okonkwo from "@/brands/okonkwo/brand";
import { completeness } from "./completeness";
import type { Brand } from "./schema";

const copy = (): Brand => structuredClone(okonkwo) as Brand;
const statusOf = (brand: Brand, part: string) => completeness(brand).find((r) => r.part === part);

describe("completeness", () => {
  it("finds Okonkwo complete in every part", () => {
    for (const report of completeness(okonkwo)) assert.equal(report.status, "complete", report.part);
  });

  it("lists what a missing part lacks", () => {
    const brand = copy();
    delete brand.voice;
    const closing = statusOf(brand, "closing");
    assert.equal(closing?.status, "missing");
    assert.ok(closing?.status === "missing" && closing.missing.some((m) => m.startsWith("voice.lines")));
  });

  it("accepts a part left out with a reason, and refuses one left out without", () => {
    const brand = copy();
    delete brand.device;
    brand.notApplicable = { "graphic-device": "The client uses photography only." };
    assert.equal(statusOf(brand, "graphic-device")?.status, "not applicable");

    brand.notApplicable = { "graphic-device": "  " };
    assert.equal(statusOf(brand, "graphic-device")?.status, "missing");
  });
});
