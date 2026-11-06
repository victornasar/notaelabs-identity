import type { CSSProperties } from "react";
import type { ActiveBrand } from "@/lib/brand/active";
import type { Face, TypeStyle } from "@/lib/brand/schema";
import { describeStep, textTransform } from "@/lib/brand/type";
import { SectionHeader } from "./section-header";
import { Subhead } from "./subhead";
import book from "./book.module.css";
import styles from "./type-section.module.css";

const FACE_FAMILY: Record<TypeStyle["face"], string> = {
  display: "var(--display)",
  text: "var(--text)",
  mono: "var(--brand-mono, var(--mono))",
};

const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWER = "abcdefghijklmnopqrstuvwxyz";
const FIGURES = "0123456789 &@?!%";

export function TypeSection({ active, number }: { active: ActiveBrand; number: number }) {
  const { brand } = active;
  const { type } = brand;
  const faces = (["display", "text", "mono"] as const)
    .map((key) => [key, type[key]] as const)
    .filter((entry): entry is readonly [TypeStyle["face"], Face] => entry[1] !== undefined);

  // Words the scale is set in: the brand's own, where it has them.
  const sample = (step: TypeStyle, i: number) => {
    if (step.face === "display") return i === 0 ? brand.name.split(" ")[0] : brand.category.name;
    if (step.id === "body") return brand.positioning;
    return step.use;
  };

  return (
    <section id="type" className={book.section} aria-labelledby="type-title">
      <SectionHeader id="type" number={number} title="Type">
        <p>
          {faces.map(([, f]) => f.family).join(" and ")}. {faces.length} faces,{" "}
          {type.scale.steps.length} sizes, and nothing set outside them.
        </p>
      </SectionHeader>

      <ul className={styles.faces}>
        {faces.map(([key, face]) => {
          const steps = type.scale.steps.filter((s) => s.face === key);
          const capitalsOnly = steps.length > 0 && steps.every((s) => s.case === "upper");
          return (
            <li key={key} className={`grid ${styles.face}`} style={{ fontFamily: FACE_FAMILY[key] } as CSSProperties}>
              <div className={styles.faceHead}>
                <p className={`label ${book.quiet}`}>{key === "display" ? "Display" : key === "text" ? "Text" : "Mono"}</p>
                <h3
                  className={styles.faceName}
                  style={{ fontWeight: face.weights.at(-1), textTransform: capitalsOnly ? "uppercase" : undefined }}
                >
                  {face.family}
                </h3>
                <p className={styles.role}>{face.role}</p>
              </div>
              <div className={styles.glyphs} style={{ fontWeight: face.weights[0] }} aria-hidden="true">
                <p>{UPPER}</p>
                {capitalsOnly ? null : <p>{LOWER}</p>}
                <p>{FIGURES}</p>
              </div>
              <ul className={styles.weights}>
                {face.weights.map((w) => (
                  <li key={w} style={{ fontWeight: w, textTransform: capitalsOnly ? "uppercase" : undefined }}>
                    <span className={`label ${book.quiet}`}>{w}</span>
                    <span className={styles.weightSample}>{face.family}</span>
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ul>

      <Subhead label="Scale" title="Every size, and where it goes">
        Sizes are for desktop; phones take the second size where one is given.
      </Subhead>
      <ol className={book.rows}>
        {type.scale.steps.map((step, i) => (
          <li key={step.id} className={`grid ${book.row} ${styles.step}`}>
            <p className={`label ${book.rowLabel}`}>{step.id}</p>
            <p className={`label ${styles.spec}`}>{describeStep(step)}</p>
            <p
              className={styles.sample}
              style={
                {
                  "--size": `${step.size}px`,
                  "--mobile-size": `${step.mobileSize ?? step.size}px`,
                  fontFamily: FACE_FAMILY[step.face],
                  fontWeight: step.weight,
                  lineHeight: step.lineHeight,
                  letterSpacing: `${step.tracking}em`,
                  textTransform: textTransform(step.case),
                  fontFeatureSettings: step.features?.map((f) => `"${f}"`).join(", "),
                } as CSSProperties
              }
            >
              {sample(step, i)}
            </p>
            <p className={`${styles.use} ${book.quiet}`}>{step.use}</p>
          </li>
        ))}
      </ol>

      {type.rules.length ? (
        <>
          <Subhead label="Rules" title="How it is set" />
          <ul className={book.rows}>
            {type.rules.map((rule, i) => (
              <li key={rule} className={`grid ${book.row}`}>
                <p className={`label ${book.rowLabel}`}>{String(i + 1).padStart(2, "0")}</p>
                <p className={book.rowBody}>{rule}</p>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </section>
  );
}
