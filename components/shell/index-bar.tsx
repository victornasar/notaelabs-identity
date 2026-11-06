"use client";

import { useEffect, useState } from "react";
import styles from "./index-bar.module.css";

export type Section = { id: string; label: string };

/** The table of contents. It sticks once the reveal scrolls away. */
export function IndexBar({
  name,
  symbol,
  sections,
}: {
  name: string;
  symbol?: React.ReactNode;
  sections: Section[];
}) {
  const [current, setCurrent] = useState<string | null>(null);

  useEffect(() => {
    const targets = sections
      .map((section) => document.getElementById(section.id))
      .filter((el): el is HTMLElement => el !== null);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setCurrent(entry.target.id);
        }
      },
      // A section is current while it crosses a line a third of the way down.
      { rootMargin: "-33% 0px -66% 0px" },
    );
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sections]);

  return (
    <nav id="index" className={styles.bar} aria-label="Contents">
      <div className={`grid ${styles.row}`}>
        <a href="#top" className={styles.home} title={name}>
          {symbol ? <span className={styles.symbol}>{symbol}</span> : null}
          <span className={styles.name}>{name}</span>
        </a>
        <ol className={styles.list}>
          {sections.map((section, i) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className={`label ${styles.link}`}
                aria-current={current === section.id ? "true" : undefined}
              >
                <span className={styles.number}>{String(i + 1).padStart(2, "0")}</span>
                {section.label}
              </a>
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
