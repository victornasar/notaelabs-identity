import { Mark } from "@/components/shell/mark";
import styles from "./closing.module.css";
import ui from "./ui/ui.module.css";
import type { BrandProps } from "./ui/types";

/** The last word: the sign-off and the wordmark, on the accent. */
export function Closing({ active }: BrandProps) {
  const { brand, svg, roles } = active;
  const { accent, ground } = roles;

  return (
    <footer className={`${ui.container} ${styles.closing}`}>
      <div className={styles.closingPanel} style={{ background: accent.hex, color: ground.hex }}>
        <p className={styles.closingLine}>{brand.voice?.signoff ?? brand.positioning}</p>
        {brand.story?.mission ? <p className={styles.closingMission}>{brand.story.mission}</p> : null}
        <Mark className={styles.closingMark} svg={svg(brand.marks.primary)} label={brand.name} align="xMidYMid" />
      </div>
      <p className={styles.colophon}>
        <span>{brand.edition}</span>
        <a href="#top">Back to top</a>
      </p>
    </footer>
  );
}
