import type { CSSProperties } from "react";
import type { Brand, Case, TypeStyle } from "./schema";

/**
 * The CSS text-transform that sets a case. Sentence and title case are written,
 * not transformed: CSS `capitalize` would capitalize every word, "and" included.
 */
export function textTransform(c: Case): CSSProperties["textTransform"] {
  return c === "upper" ? "uppercase" : c === "lower" ? "lowercase" : "none";
}

/** Inline style that sets text in one step of a type scale. */
export function stepStyle(step: TypeStyle, fontFamily: string, fontSize?: string): CSSProperties {
  return {
    fontFamily,
    fontSize,
    fontWeight: step.weight,
    lineHeight: step.lineHeight,
    letterSpacing: `${step.tracking}em`,
    textTransform: textTransform(step.case),
    fontFeatureSettings: step.features?.map((f) => `"${f}"`).join(", ") || undefined,
  };
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

/**
 * The words a scale step is shown with: the first display step sets the name's
 * first word, later display steps the category, body the positioning, the rest
 * what they are for.
 */
export function stepSample(brand: Brand, step: TypeStyle, index: number) {
  if (step.face === "display") return index === 0 ? brand.name.split(/[\s-]/)[0]! : brand.category.name;
  if (step.id === "body") return brand.positioning;
  return step.use;
}
