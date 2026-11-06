import { Mark } from "@/components/shell/mark";
import { pageSections } from "@/lib/brand/sections";
import styles from "./hero.module.css";
import ui from "./ui/ui.module.css";
import type { BrandProps } from "./ui/types";

/** The cover: the brand's cover mark, as large as the screen allows. */
export function Hero({ active }: BrandProps) {
  const { brand, svg, mark } = active;
  const imagery = pageSections(brand).some((s) => s.id === "imagery");

  return (
    <section id="top" className={`${ui.container} ${styles.hero}`} aria-label={`${brand.name}, brand guidelines`}>
      <div className={styles.heroMeta}>
        <p className={ui.pill}>
          <span className={ui.dot} aria-hidden="true" />
          {brand.edition}
        </p>
      </div>
      <h1 className={styles.heroLockup}>
        <Mark svg={svg(mark(brand.cover.mark))} label={brand.name} align="xMidYMid" />
      </h1>
      <div className={styles.heroFoot}>
        <p className={styles.heroLede}>{brand.positioning}</p>
        <div className={styles.actions}>
          <a href="#marks" className={ui.button}>
            See the marks
          </a>
          {/* Marks are in every book; imagery isn't, and color is. */}
          <a href={imagery ? "#imagery" : "#color"} className={`${ui.button} ${ui.ghost}`}>
            {imagery ? "See it at work" : "Get the colors"}
          </a>
        </div>
      </div>
    </section>
  );
}

/** The graphic device as a band that keeps moving. */
export function Band({ active }: BrandProps) {
  const { brand, color, deviceStrip } = active;
  const { device } = brand;
  if (!device || !deviceStrip) return null;

  return (
    <div className={styles.band} style={{ background: color(device.ground).hex, color: color(device.ink).hex }} aria-hidden="true">
      <div className={styles.bandTrack}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <Mark
            key={i}
            className={styles.bandTile}
            style={{ aspectRatio: deviceStrip.aspect }}
            svg={deviceStrip.svg}
            label=""
            align="xMinYMid"
          />
        ))}
      </div>
    </div>
  );
}
