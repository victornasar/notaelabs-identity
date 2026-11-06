import type { ActiveBrand } from "@/lib/brand/active";
import { Mark } from "./mark";
import { SectionHeader } from "./section-header";
import book from "./book.module.css";
import styles from "./closing-section.module.css";

/** How the brand writes, in three lines, then its last word and its mark. */
export function ClosingSection({ active, number }: { active: ActiveBrand; number: number }) {
  const { brand, svg } = active;
  const { voice } = brand;
  if (!voice) return null;

  return (
    <section id="closing" className={book.section} aria-labelledby="closing-title">
      <SectionHeader id="closing" number={number} title="Closing">
        <p>Write this, not that.</p>
      </SectionHeader>

      <ul className={book.rows}>
        {voice.lines.slice(0, 3).map((line) => (
          <li key={line.do} className={`grid ${book.row} ${styles.pair}`}>
            <div className={styles.do}>
              <p className={`label ${book.quiet}`}>Write</p>
              <p className={styles.quote}>{line.do}</p>
            </div>
            <div className={styles.dont}>
              <p className={`label ${book.quiet}`}>Not</p>
              <p className={styles.quote}>
                <s>{line.dont}</s>
              </p>
            </div>
          </li>
        ))}
      </ul>

      {voice.signoff ? (
        <div className={`grid ${styles.end}`}>
          <p className={styles.signoff}>{voice.signoff}</p>
          <Mark className={styles.mark} svg={svg(brand.marks.primary)} label={brand.name} />
        </div>
      ) : null}
    </section>
  );
}
