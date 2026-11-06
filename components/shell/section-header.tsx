import styles from "./section-header.module.css";

export function SectionHeader({
  id,
  number,
  title,
  children,
}: {
  /** The section's id; the title gets `${id}-title` for aria-labelledby. */
  id: string;
  number: number;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <header className={`grid ${styles.header}`}>
      <p className={`label ${styles.number}`} aria-hidden="true">
        {String(number).padStart(2, "0")}
      </p>
      <h2 id={`${id}-title`} className={styles.title}>{title}</h2>
      {children ? <div className={styles.intro}>{children}</div> : null}
    </header>
  );
}
