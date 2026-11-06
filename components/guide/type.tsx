import type { CSSProperties } from "react";
import { faceNames } from "@/lib/brand/labels";
import type { Face, TypeStyle } from "@/lib/brand/schema";
import { describeStep, stepStyle } from "@/lib/brand/type";
import styles from "./type.module.css";
import { Heading } from "./ui/heading";
import type { SectionProps } from "./ui/types";
import ui from "./ui/ui.module.css";

// The page's font variables for each face; a brand without a mono face falls back to the shell's.
const FACE_FAMILY: Record<TypeStyle["face"], string> = {
  display: "var(--display)",
  text: "var(--text)",
  mono: "var(--brand-mono, var(--mono))",
};

/** Each face as a specimen card, why they fit, then the scale set in the brand's own words. */
export function Type({ active, section }: SectionProps) {
  const { brand, roles } = active;
  const { type } = brand;
  const { accent, ground } = roles;
  const faces = (["display", "text", "mono"] as const)
    .map((key) => [key, type[key]] as const)
    .filter((entry): entry is readonly [TypeStyle["face"], Face] => entry[1] !== undefined);

  const sample = (step: TypeStyle, i: number) => {
    if (step.face === "display") return i === 0 ? brand.name.split(/[\s-]/)[0] : brand.category.name;
    if (step.id === "body") return brand.positioning;
    return step.use;
  };

  return (
    <section id="type" className={`${ui.container} ${ui.section}`} aria-labelledby="type-title">
      <Heading section={section} title={brand.page?.titles?.type ?? faces.map(([, f]) => f.family).join(" & ")}>
        {type.fit}
      </Heading>

      <ul className={styles.faces}>
        {faces.map(([key, face], i) => {
          const upper = type.scale.steps.filter((s) => s.face === key).every((s) => s.case === "upper");
          const lead = i === 0;
          return (
            <li
              key={key}
              className={`${ui.card} ${lead ? "" : ui.outlined} ${styles.face}`}
              style={{ fontFamily: FACE_FAMILY[key], ...(lead ? { background: accent.hex, color: ground.hex } : {}) }}
            >
              <p className={styles.faceKind}>{faceNames[key]}</p>
              <p className={styles.faceGlyph} style={{ fontWeight: face.weights.at(-1) }} aria-hidden="true">
                {upper ? "AG" : "Ag"}
              </p>
              <div>
                <h3
                  className={styles.faceName}
                  style={{ fontWeight: face.weights.at(-1), textTransform: upper ? "uppercase" : undefined }}
                >
                  {face.family}
                </h3>
                <p className={styles.faceRole}>{face.role}</p>
                <p className={styles.faceWeights}>Weights {face.weights.join(", ")}</p>
              </div>
            </li>
          );
        })}
      </ul>

      <h3 className={ui.subtitle}>The scale</h3>
      <ol className={`${ui.card} ${ui.outlined} ${styles.scale}`}>
        {type.scale.steps.map((step, i) => (
          <li key={step.id} className={styles.scaleRow}>
            <div className={styles.scaleMeta}>
              <p className={styles.scaleId}>{step.id}</p>
              <p className={ui.quiet}>{describeStep(step)}</p>
              <p className={ui.quiet}>{step.use}</p>
            </div>
            <p
              className={styles.scaleSample}
              style={
                {
                  "--size": `${step.size}px`,
                  "--mobile-size": `${step.mobileSize ?? step.size}px`,
                  ...stepStyle(step, FACE_FAMILY[step.face]),
                } as CSSProperties
              }
            >
              {sample(step, i)}
            </p>
          </li>
        ))}
      </ol>

      {type.rules.length ? (
        <ul className={ui.rules}>
          {type.rules.map((rule, i) => (
            <li key={rule} className={ui.step}>
              <span className={ui.stepNumber}>{String(i + 1).padStart(2, "0")}</span>
              <p>{rule}</p>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
