import type { ActiveBrand } from "@/lib/brand/active";
import { Mark } from "./mark";
import { SectionHeader } from "./section-header";
import { Subhead } from "./subhead";
import book from "./book.module.css";
import styles from "./graphics-section.module.css";

/** The shapes, patterns and layout rules beyond the marks, each built from the primitives. */
export function GraphicsSection({ active, number }: { active: ActiveBrand; number: number }) {
  const { brand, color, graphic } = active;
  const language = brand.graphicLanguage;
  if (!language) return null;

  const primitives = new Set(
    language.elements.flatMap((e) => e.cites.filter((c) => c.startsWith("concept.primitives.")).map((c) => c.split(".").at(-1))),
  );

  return (
    <section id="graphics" className={book.section} aria-labelledby="graphics-title">
      <SectionHeader id="graphics" number={number} title="Graphic language">
        <p>
          {language.elements.length} devices, built from the {[...primitives].join(", ")}{" "}
          {primitives.size === 1 ? "primitive" : "primitives"}.
        </p>
      </SectionHeader>

      <ul className={styles.elements}>
        {language.elements.map((element) => (
          <li key={element.file} className={`grid ${styles.element}`}>
            <div
              className={styles.field}
              data-edge={color(element.ground).role === "ground" || undefined}
              style={{ background: color(element.ground).hex, color: color(element.ink).hex }}
            >
              <Mark className={styles.drawing} svg={graphic(element.file)} label="" align="xMidYMid" />
            </div>
            <h3 className={styles.name}>{element.name}</h3>
            <p className={styles.construction}>{element.construction}</p>
            <p className={`${styles.use} ${book.quiet}`}>{element.use}</p>
          </li>
        ))}
      </ul>

      <Subhead label="Layout" title="How a page is built" />
      <ul className={book.rows}>
        {language.layout.map((rule, i) => (
          <li key={rule} className={`grid ${book.row}`}>
            <p className={`label ${book.rowLabel}`}>{String(i + 1).padStart(2, "0")}</p>
            <p className={book.rowBody}>{rule}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
