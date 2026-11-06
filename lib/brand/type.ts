import type { Case, TypeStyle } from "./schema";

/** The CSS text-transform that sets a case. Sentence case is written, not transformed. */
export function textTransform(c: Case) {
  return c === "upper" ? "uppercase" : c === "lower" ? "lowercase" : c === "title" ? "capitalize" : "none";
}

const CASE_NAMES: Record<Case, string> = {
  sentence: "Sentence case",
  title: "Title case",
  upper: "Capitals",
  lower: "Lowercase",
  "as-written": "As written",
};

/** One step's settings, as a line: "160 px / 0.88 · 800 · +0.01 em · Capitals". */
export function describeStep(step: TypeStyle) {
  const tracking = step.tracking === 0 ? "0" : `${step.tracking > 0 ? "+" : "−"}${Math.abs(step.tracking)} em`;
  const size = step.mobileSize ? `${step.size} px (${step.mobileSize} on phones)` : `${step.size} px`;
  return [`${size} / ${step.lineHeight}`, String(step.weight), `tracking ${tracking}`, CASE_NAMES[step.case]]
    .concat(step.features?.length ? [step.features.join(", ")] : [])
    .join(" · ");
}
