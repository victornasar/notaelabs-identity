import type { ActiveBrand } from "@/lib/brand/active";
import { SectionHeader } from "./section-header";
import book from "./book.module.css";
import styles from "./intro-section.module.css";

/** Who the brand is, in three lines: what it is, where it stands, and what it does. */
export function IntroSection({ active, number }: { active: ActiveBrand; number: number }) {
  const { brand } = active;

  return (
    <section id="intro" className={book.section} aria-labelledby="intro-title">
      <SectionHeader id="intro" number={number} title="Intro" />

      <p className={`grid ${styles.idea}`}>
        <span className={`label ${styles.ideaLabel}`}>{brand.category.name}</span>
        <span className={styles.ideaText}>{brand.positioning}</span>
      </p>

      {brand.story?.mission ? (
        <ul className={book.rows}>
          <li className={`grid ${book.row}`}>
            <p className={`label ${book.rowLabel}`}>Mission</p>
            <p className={book.rowBody}>{brand.story.mission}</p>
          </li>
        </ul>
      ) : null}
    </section>
  );
}
