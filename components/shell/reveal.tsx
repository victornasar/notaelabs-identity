import type { ActiveBrand } from "@/lib/brand/active";
import { Mark } from "./mark";
import styles from "./reveal.module.css";

export function Reveal({ active }: { active: ActiveBrand }) {
  const { brand, color, mark, svg } = active;
  const ground = color(brand.reveal.ground);
  const ink = color(brand.reveal.ink);
  const opening = mark(brand.reveal.mark);
  const compact = brand.reveal.compactMark ? mark(brand.reveal.compactMark) : null;

  return (
    <section
      id="top"
      className={styles.reveal}
      style={{ background: ground.hex, color: ink.hex }}
      aria-label={`${brand.name}, brand guidelines`}
    >
      <div className={`grid ${styles.meta}`}>
        <p className={`label ${styles.edition}`}>{brand.edition}</p>
        <a className={`label ${styles.contents}`} href="#index">
          Contents
        </a>
      </div>

      <div className={`grid ${styles.body}`}>
        <p className={styles.positioning}>{brand.positioning}</p>
        <div className={styles.markWindow} role="img" aria-label={brand.name}>
          <Mark
            className={`${styles.mark} ${compact ? styles.wide : ""}`}
            svg={svg(opening)}
            label=""
          />
          {compact ? (
            <Mark className={`${styles.mark} ${styles.compact}`} svg={svg(compact)} label="" />
          ) : null}
        </div>
      </div>
    </section>
  );
}
