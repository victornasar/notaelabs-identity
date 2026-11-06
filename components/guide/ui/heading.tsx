import type { PageSection } from "@/lib/brand/sections";
import styles from "./ui.module.css";

/** A section's opening: its number and name, the headline, and a lede beside it. */
export function Heading({ section, title, children }: { section: PageSection; title: string; children?: React.ReactNode }) {
  return (
    <header className={styles.heading}>
      <p className={styles.eyebrow}>
        {section.number} · {section.label}
      </p>
      <h2 id={`${section.id}-title`} className={styles.title}>
        {title}
      </h2>
      {children ? <p className={styles.lede}>{children}</p> : null}
    </header>
  );
}
